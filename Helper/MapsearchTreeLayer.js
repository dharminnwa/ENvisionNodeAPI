var UtilityJs = require("../Helper/Utility");
var logger = require("../Helper/logs");
var Busboy = require('busboy');
var http = require('http'),
    path = require('path'),
    os = require('os'),
    fs = require('fs');
var AddDataModel = require("../Models/Custom/AddDataModel");
var fs = require("fs");
var mkdirp = require('mkdirp');
var dotSpatial = require("../Helper/DotSpatial");
var SQLQueryPrama = require("./SqlQuery/LayerQuery");
const { KnexRaw } = require('../Models');
var archiver = require('archiver');
var config = require('config');
const request = require('request');

module.exports =
    {
        GetEnegeryLayersTreeViewParent: function (next, layerId, treeView, treeChild, layerList, userId) {
            return new Promise((resolve, reject) => {
                let EnergyLayerquery = SQLQueryPrama.GetEnergyLayesById(layerId);
                KnexRaw.raw(EnergyLayerquery).then(function (ResEnergyLayerData) {
                    if (ResEnergyLayerData.length == 1) {
                        let layerInfo = ResEnergyLayerData[0];
                        module.exports.UpdateEnergyLayerStyle(next, layerInfo, layerId, userId).then(function (data) {
                            layerInfo = data;
                            let existingLayer = [];
                            treeView.map(function (e) {
                                if (e.EnergyLayerID == layerInfo.EnergyLayerID)
                                    existingLayer.push(e);
                            });
                            if (existingLayer.length == 0) {
                                if (layerInfo.IconType.toLowerCase() == "roundedrectanglearea")
                                    layerInfo.IconType = layerInfo.IconType.Replace("Area", "");
                                module.exports.GetIconUrl(next, layerInfo, userId).then(function (iconURL) {
                                    var layerTreeViewItem = {
                                        "id": layerInfo.EnergyLayerID,
                                        "parent": layerInfo.EnergyParentID,
                                        "text": layerInfo.DisplayName,
                                        "icon": iconURL
                                    }
                                    treeView.push(layerTreeViewItem);
                                    if (treeChild == 0) {
                                        treeChild++;
                                        var ids = [];
                                        ids.push(layerId);
                                        let Getquery = SQLQueryPrama.GetEnergyLayesParentsById(layerId);
                                        KnexRaw.raw(Getquery).then(function (data) {
                                            if (data.length > 0) {
                                                layerList = data;
                                                var promises = [];
                                                var promisesStyle = [];
                                                for (var item of data) {
                                                    item.EnergyLayerStylesByUserModel = [];
                                                    promisesStyle.push(module.exports.UpdateEnergyLayerStyle(next, item, item.EnergyLayerID, userId));
                                                }
                                                for (var item of data) {
                                                    if (item.EnergyLayerID != layerId) {
                                                        if (item.IconType.toLowerCase() == "roundedrectanglearea")
                                                            item.IconType = item.IconType.Replace("Area", "");
                                                        // if (layerInfo.RepresentationType == "Area")
                                                        //     layerInfo.SizePercent = 100;
                                                        promises.push(module.exports.GetIconUrl(next, item, userId));
                                                    }
                                                }
                                                Promise.all(promisesStyle).then(function (layerList) {
                                                    Promise.all(promises).then(function (data) {
                                                        for (var item of layerList) {
                                                            var iconURL = [];
                                                            data.map(function (e) {
                                                                if (e.indexOf("Id=" + item.EnergyLayerID) != -1)
                                                                    iconURL.push(e);
                                                            });
                                                            if (iconURL.length > 0) {
                                                                var layerTreeViewItem = {
                                                                    "id": item.EnergyLayerID,
                                                                    "parent": item.EnergyParentID,
                                                                    "text": item.DisplayName,
                                                                    "icon": iconURL[0]
                                                                }
                                                                treeView.push(layerTreeViewItem);
                                                            }
                                                        }
                                                        if (layerInfo.EnergyParentID)
                                                            module.exports.GetEnegeryLayersTreeViewParent(next, layerInfo.EnergyParentID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                        else {
                                                            var layerData = {
                                                                "TreeView": treeView,
                                                                "LayerList": layerList
                                                            }
                                                            resolve(layerData);
                                                        }
                                                    }, function (error) {
                                                        return reject(error);
                                                    });
                                                }, function (error) {
                                                    return reject(error);
                                                });

                                            }
                                            else {
                                                layerList.push(ResEnergyLayerData[0]);
                                                if (layerInfo.EnergyParentID)
                                                    module.exports.GetEnegeryLayersTreeViewParent(next, layerInfo.EnergyParentID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                else {
                                                    var layerData = {
                                                        "TreeView": treeView,
                                                        "LayerList": layerList
                                                    }
                                                    resolve(layerData);
                                                }
                                            }
                                        }, function (error) {
                                            return reject(error);
                                        }).catch(next);
                                    }
                                    else {
                                        if (layerInfo.EnergyParentID)
                                            module.exports.GetEnegeryLayersTreeViewParent(next, layerInfo.EnergyParentID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                        else {
                                            var layerData = {
                                                "TreeView": treeView,
                                                "LayerList": layerList
                                            }
                                            resolve(layerData);
                                        }
                                    }
                                }, function (error) {
                                    return reject(error);
                                });
                            }
                        }, function (error) {
                            return reject(error);
                        });
                    }
                }, function (error) {
                    return reject(error);
                }).catch(next);
            });
        },
        GetIconUrl: function (next, layerInfo, userId) {
            return new Promise((resolve, reject) => {
                var promises = [];
                if (layerInfo.ExternalIconId == null) {
                    resolve(config.ImagePath.iconImageURL + layerInfo.EnergyLayerID + "&URLType=CustomStyleIcon&FillColor=" + layerInfo.FillColor.replace("#", "") + "&IconType=" + layerInfo.IconType + "&StrokeColor=" + layerInfo.StrokeColor.replace("#", "") + "&SizePercent=" + layerInfo.SizePercent + "&StrokeThicknessPercent=" + layerInfo.StrokeThicknessPercent + "&Opacity=" + layerInfo.Opacity);
                }
                else {
                    var iconId = layerInfo.ExternalIconId;
                    var URL = UtilityJs.GetDefaultExternalIcon(iconId);
                    if (URL == "") {
                        let Getquery = SQLQueryPrama.GetExternalIcon(userId, iconId);
                        KnexRaw.raw(Getquery).then(function (data) {
                            if (data.length == 1) {
                                var icon = data[0];
                                let imagePath = config.ImagePath.UploadExternalIcon;
                                imagePath += "/" + icon.UploadedBy;
                                if (!fs.existsSync(imagePath)) {
                                    promises.push(UtilityJs.makeDirectoryByPath(imagePath));
                                    Promise.all(promises).then(function (data) {
                                        imagePath += "/" + icon.Id + icon.Extension.trim();
                                        fs.writeFile(imagePath, icon.Icon, 'base64', (error) => {
                                            if (error) reject(error);
                                            else resolve("https://api.envisionmaps.com:8080/Images/EnvisionAngularUsersIcon/" + icon.UploadedBy + "/" + icon.Id + icon.Extension.trim());
                                        });
                                    }, function (error) {
                                        reject(error);
                                    });
                                }
                                else {
                                    imagePath += "/" + icon.Id + icon.Extension.trim();
                                    fs.writeFile(imagePath, icon.Icon, 'base64', (error) => {
                                        if (error) reject(error);
                                        else resolve("https://api.envisionmaps.com:8080/Images/EnvisionAngularUsersIcon/" + icon.UploadedBy + "/" + icon.Id + icon.Extension.trim());
                                    });
                                }
                            }
                            else
                                resolve("https://api.envisionmaps.com:8080/Images/01)AngularEnvision%20Images/ExternalIconId/95.png");
                        }, function (error) {
                            reject(error);
                        }).catch(next);
                    }
                    else
                        resolve(URL);
                }
            });
        },
        UpdateEnergyLayerStyle: function (next, layerInfo, layerId, userId) {
            return new Promise((resolve, reject) => {
                let layerStylesByUserQuery = SQLQueryPrama.GetEnergyLayerStyleByUserById(layerId, userId);
                KnexRaw.raw(layerStylesByUserQuery).then(function (layerStylesByUser) {
                    if (layerStylesByUser.length == 1) {
                        layerStylesByUser = layerStylesByUser[0];
                        if (!layerInfo.EnergyLayerStylesByUserModel)
                            layerInfo.EnergyLayerStylesByUserModel = [layerStylesByUser];
                        if (layerStylesByUser.EnergyLayerId == layerInfo.EnergyLayerID) {
                            if (layerStylesByUser.ExternalIconId)
                                layerInfo.ExternalIconId = layerStylesByUser.ExternalIconId;
                            if (layerStylesByUser.IconType && layerStylesByUser.FillColor && layerStylesByUser.StrokeColor) {
                                layerInfo.IconType = layerStylesByUser.IconType;
                                layerInfo.FillColor = layerStylesByUser.FillColor;
                                layerInfo.StrokeColor = layerStylesByUser.StrokeColor;
                                layerInfo.SizePercent = layerStylesByUser.SizePercent;
                                layerInfo.StrokeThicknessPercent = layerStylesByUser.StrokeThicknessPercent;
                                layerInfo.Opacity = layerStylesByUser.Opacity;
                            }
                        }
                    }
                    resolve(layerInfo);
                }, function (error) {
                    return reject(error);
                }).catch(next);
            });
        },
        ConvertToTreeDataForEnergyLayer: function (treeLayers, mapLayers) {
            var treeData = [];
            if (mapLayers.length > 0) {
                var listChildNode = [];
                var listParentNode = [];
                var listParentParentNode = [];
                var treeLayer = null;
                var parentLayer = null;
                var parentParentLayer = null;
                var parentParentParentLayer = null;

                var tLayer = [];
                treeLayers.map(function (e) {
                    if (e.id == mapLayers[0].EnergyLayerID)
                        tLayer.push(e);
                });
                if (tLayer.length == 1) { treeLayer = tLayer[0]; }

                if (treeLayer != null) {
                    var pLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == treeLayer.parent)
                            pLayer.push(e);
                    });
                    if (pLayer.length == 1) { parentLayer = pLayer[0]; }
                }

                if (parentLayer != null) {
                    var ppLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == parentLayer.parent)
                            ppLayer.push(e);
                    });
                    if (ppLayer.length == 1) { parentParentLayer = ppLayer[0]; }
                }

                if (parentParentLayer != null) {
                    var pppLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == parentParentLayer.parent)
                            pppLayer.push(e);
                    });
                    if (pppLayer.length == 1) { parentParentParentLayer = pppLayer[0]; }
                }

                for (var mapLayer of mapLayers) {
                    var treeMapLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == mapLayer.EnergyLayerID)
                            treeMapLayer.push(e);
                    });
                    if (treeMapLayer.length == 1) {
                        treeMapLayer = treeMapLayer[0];
                        var cn = {
                            "Id": treeMapLayer.id,
                            "Name": treeMapLayer.text,
                            "IconUrl": treeMapLayer.icon,
                            "IsChecked": true
                        }
                        listChildNode.push(cn);
                    }
                }
                var pn = {
                    "Id": parentLayer.id,
                    "Name": parentLayer.text,
                    "children": listChildNode
                }
                if (parentParentLayer != null && parentParentParentLayer == null) {
                    listParentNode.push(pn);
                    var ppn = {
                        "Id": parentParentLayer.id,
                        "Name": parentParentLayer.text,
                        "children": listParentNode
                    }
                    treeData.push(ppn);
                }
                else if (parentParentParentLayer != null && parentParentLayer != null) {
                    listParentNode.push(pn);
                    var ppn = {
                        "Id": parentParentLayer.id,
                        "Name": parentParentLayer.text,
                        "children": listParentNode
                    }
                    listParentParentNode.push(ppn);
                    var pppn = {
                        "Id": parentParentParentLayer.id,
                        "Name": parentParentParentLayer.text,
                        "children": listParentParentNode
                    }
                    treeData.push(pppn);
                }
                else
                    treeData.push(pn);
            }
            return treeData;
        },
    }