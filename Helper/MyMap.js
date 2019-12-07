var UtilityJs = require("../Helper/Utility");
var logger = require("../Helper/logs");
const { KnexRaw, CustomMap, CustomMap_EnergyLayer, CustomMap_DataSet, CustomMap_DefaultCheckedLayer, DataSet, LayerGridFilter } = require('../Models');
var config = require('config');
const request = require('request');
var SQLQuery = require("./SqlQuery/MyMapQuery");
var CreateLogsHelper = require("../Helper/createLogs");
module.exports =
    {
        SaveMap: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                CustomMapData: null,
                errormsg: '',
            }
            var promises = [];
            module.exports.AddDataInCustomMap(request.body.CustomMaps).then(function (customMapData) {
                if (customMapData.length == 1) {
                    promises.push(module.exports.AddDataInCustomMapEnergyLayer(request.body.EnergyLayers, customMapData[0].CustomMapId));
                    promises.push(module.exports.AddDataInCustomMapDataSet(request.body.DataSets, customMapData[0].CustomMapId));
                    promises.push(module.exports.AddDataInCustomMapDefaultCheckedLayer(request.body.DefaultCheckedLayers, customMapData[0].CustomMapId));
                    promises.push(module.exports.AddDataInLayerGridFilters(request.body.LayerGridFilters, customMapData[0].CustomMapId));
                    module.exports.InsertEnergyLayerStylesByUser(request.body.EnergyLayersStylebyuser, customMapData[0].CustomMapId, request.body.CustomMaps.UserId);
                }
                Promise.all(promises).then(function (data) {
                    if (data.length == 4) {
                        JsonData._Issuccess = true;
                        JsonData.CustomMapData = {
                            CustomMaps: customMapData,
                            CustomMaps_EnergyLayers: data[0],
                            CustomMaps_DataSets: data[1],
                            CustomMaps_DefaultCheckedLayers: data[2],
                            LayerGridFilters: data[3]
                        }
                        response.json(JsonData);
                    }
                }, function (error) {
                    JsonData._Issuccess = false;
                    JsonData.errormsg = error;
                    logger.error("SaveMap", "MyMap", error);
                    response.json(JsonData);
                });
            }, function (error) {
                JsonData._Issuccess = false;
                JsonData.errormsg = error;
                logger.error("SaveMap", "MyMap", error);
                response.json(JsonData);
            });
        },

        AddDataInCustomMap(param) {
            return new Promise((resolve, reject) => {
                param.Created = new Date();
                param.Modified = new Date();
                param.IsPublic = "false";
                param.IsDeleted = "false";
                let ColKey = Object.keys(param);
                let dataFields = "Name,Description,UserId,CenterLatitude,CenterLongitude,ZoomLevel,IsPublic,IsDeleted,BaseMapProviderId,Created,Modified,LegendOrder";
                dataFields = dataFields.split(',');
                for (let i = 0; i < ColKey.length; i++) {
                    if (!param[ColKey[i]]) {
                        param[ColKey[i]] = null;
                    }
                    if (dataFields.indexOf(ColKey[i]) == -1)
                        delete param[ColKey[i]];
                    if (param[ColKey[i]]) {
                        if (param[ColKey[i]].toString().toLowerCase() == "true")
                            param[ColKey[i]] = "1";
                        if (param[ColKey[i]].toString().toLowerCase() == "false")
                            param[ColKey[i]] = "0";
                    }
                }
                CustomMap.save(param)
                    .then(data => { resolve(data); })
                    .catch(err => { reject(err); });
            });
        },

        AddDataInCustomMapEnergyLayer(energyLayers, customMapId) {
            return new Promise((resolve, reject) => {
                if (energyLayers.length > 0) {
                    var rows = [];
                    for (var layer of energyLayers) {
                        var param = {
                            CustomMapId: customMapId,
                            EnergyLayerId: layer
                        };
                        let ColKey = Object.keys(param);
                        let dataFields = "CustomMapId,EnergyLayerId";
                        dataFields = dataFields.split(',');
                        for (let i = 0; i < ColKey.length; i++) {
                            if (!param[ColKey[i]]) {
                                param[ColKey[i]] = null;
                            }
                            if (dataFields.indexOf(ColKey[i]) == -1)
                                delete param[ColKey[i]];
                        }
                        rows.push(param);
                    }
                    CustomMap_EnergyLayer.bulkSave(rows)
                        .then(data => { resolve(data); })
                        .catch(err => { reject(err); });
                }
                else
                    resolve([]);
            });
        },

        AddDataInCustomMapDataSet(datasetLayers, customMapId) {
            return new Promise((resolve, reject) => {
                if (datasetLayers.length > 0) {
                    var rows = [];
                    for (var layer of datasetLayers) {
                        var param = {
                            CustomMapId: customMapId,
                            DataSetId: layer
                        };
                        let ColKey = Object.keys(param);
                        let dataFields = "CustomMapId,DataSetId";
                        dataFields = dataFields.split(',');
                        for (let i = 0; i < ColKey.length; i++) {
                            if (!param[ColKey[i]]) {
                                param[ColKey[i]] = null;
                            }
                            if (dataFields.indexOf(ColKey[i]) == -1)
                                delete param[ColKey[i]];
                        }
                        rows.push(param);
                    }
                    CustomMap_DataSet.bulkSave(rows)
                        .then(data => { resolve(data); })
                        .catch(err => { reject(err); });
                }
                else
                    resolve([]);
            });
        },

        AddDataInCustomMapDefaultCheckedLayer(defaultCheckedLayers, customMapId) {
            return new Promise((resolve, reject) => {
                if (defaultCheckedLayers.length > 0) {
                    var rows = [];
                    for (var layer of defaultCheckedLayers) {
                        var param = {
                            CustomMapId: customMapId,
                            LayerGuid: layer
                        };
                        let ColKey = Object.keys(param);
                        let dataFields = "CustomMapId,LayerGuid";
                        dataFields = dataFields.split(',');
                        for (let i = 0; i < ColKey.length; i++) {
                            if (!param[ColKey[i]]) {
                                param[ColKey[i]] = null;
                            }
                            if (dataFields.indexOf(ColKey[i]) == -1)
                                delete param[ColKey[i]];
                        }
                        rows.push(param);
                    }
                    CustomMap_DefaultCheckedLayer.bulkSave(rows)
                        .then(data => { resolve(data); })
                        .catch(err => { reject(err); });
                }
                else
                    resolve([]);
            });
        },

        AddDataInLayerGridFilters(gridFilter, customMapId) {
            return new Promise((resolve, reject) => {
                if (gridFilter.length > 0) {
                    var rows = [];
                    for (var param of gridFilter) {
                        param.CreatedDate = new Date();
                        param.UpdatedDate = new Date();
                        param.MapId = customMapId;
                        let ColKey = Object.keys(param);
                        let dataFields = "LayerId,IsEnergyLayer,UserId,FilterSaveString,CreatedDate,UpdatedDate,MapId";
                        dataFields = dataFields.split(',');
                        for (let i = 0; i < ColKey.length; i++) {
                            if (!param[ColKey[i]]) {
                                param[ColKey[i]] = null;
                            }
                            if (dataFields.indexOf(ColKey[i]) == -1)
                                delete param[ColKey[i]];
                            if (param[ColKey[i]]) {
                                if (param[ColKey[i]].toString().toLowerCase() == "true")
                                    param[ColKey[i]] = "1";
                                if (param[ColKey[i]].toString().toLowerCase() == "false")
                                    param[ColKey[i]] = "0";
                            }
                        }
                        rows.push(param);
                    }
                    LayerGridFilter.bulkSave(rows)
                        .then(data => { resolve(data); })
                        .catch(err => { reject(err); });
                }
                else
                    resolve([]);
            });

        },

        CheckMapNameExists(request, response, next) {
            var JsonData = {
                _Issuccess: false,
                isMapNameExists: false,
                errormsg: '',
            }
            CustomMap.find({ Name: request.query.MapName, IsDeleted: 0 })
                .then(function (data) {
                    if (data.length > 0) {
                        JsonData._Issuccess = true;
                        JsonData.isMapNameExists = true;
                    }
                    else {
                        JsonData._Issuccess = true;
                        JsonData.isMapNameExists = false;
                    }
                    response.json(JsonData);
                }).catch(next);
        },

        UpdateMap: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                CustomMapData: null,
                errormsg: '',
            }
            var CustomMapId = request.body.CustomMapId;
            var MapData = request.body.MapData;
            var promises = [];
            promises.push(module.exports.UpdateDataInCustomMap(MapData.CustomMaps, CustomMapId));
            promises.push(module.exports.UpdateDataInCustomMapEnergyLayer(MapData.EnergyLayers, CustomMapId));
            promises.push(module.exports.UpdateDataInCustomMapDataSet(MapData.DataSets, CustomMapId));
            promises.push(module.exports.UpdateDataInCustomMapDefaultCheckedLayer(MapData.DefaultCheckedLayers, CustomMapId));
            promises.push(module.exports.UpdateDataInCustomMapLayerGridFilters(MapData.LayerGridFilters, CustomMapId));
            Promise.all(promises).then(function (data) {
                if (data.length == 5) {
                    JsonData._Issuccess = true;
                    JsonData.CustomMapData = {
                        CustomMaps: data[0],
                        CustomMaps_EnergyLayers: data[1],
                        CustomMaps_DataSets: data[2],
                        CustomMaps_DefaultCheckedLayers: data[3],
                        LayerGridFilters: data[4]
                    }
                    response.json(JsonData);
                }
            },
                function (error) {
                    JsonData._Issuccess = false;
                    JsonData.errormsg = error;
                    logger.error("UpdateMap", "MyMap", error);
                    response.json(JsonData);
                });
        },

        UpdateDataInCustomMap(customMapData, customMapId) {
            return new Promise((resolve, reject) => {
                if (customMapData && customMapId > 0) {
                    customMapData.Modified = new Date();
                    let ColKey = Object.keys(customMapData);
                    let dataFields = "Name,Description,CenterLatitude,CenterLongitude,ZoomLevel,BaseMapProviderId,Modified,LegendOrder,IsPublic";
                    dataFields = dataFields.split(',');
                    for (let i = 0; i < ColKey.length; i++) {
                        if (!customMapData[ColKey[i]]) {
                            customMapData[ColKey[i]] = null;
                        }
                        if (ColKey[i] == "IsPublic" && customMapData[ColKey[i]] == null)
                            customMapData[ColKey[i]] = false;

                        if (dataFields.indexOf(ColKey[i]) == -1)
                            delete customMapData[ColKey[i]];
                    }
                    CustomMap.update({ CustomMapId: customMapId }, customMapData)
                        .then(data => { resolve(data); })
                        .catch(err => { reject(err); });
                }
                else
                    resolve([]);
            });
        },

        UpdateDataInCustomMapEnergyLayer(energyLayers, customMapId) {
            return new Promise((resolve, reject) => {
                CustomMap_EnergyLayer.hardDelete({ CustomMapId: customMapId }).then(data => {
                    if (energyLayers.length > 0) {
                        var rows = [];
                        for (var layer of energyLayers) {
                            var param = {
                                CustomMapId: customMapId,
                                EnergyLayerId: layer
                            };
                            let ColKey = Object.keys(param);
                            let dataFields = "CustomMapId,EnergyLayerId";
                            dataFields = dataFields.split(',');
                            for (let i = 0; i < ColKey.length; i++) {
                                if (!param[ColKey[i]]) {
                                    param[ColKey[i]] = null;
                                }
                                if (dataFields.indexOf(ColKey[i]) == -1)
                                    delete param[ColKey[i]];
                            }
                            rows.push(param);
                        }
                        CustomMap_EnergyLayer.bulkSave(rows)
                            .then(data => { resolve(data); })
                            .catch(err => { reject(err); });
                    }
                    else
                        CustomMap_EnergyLayer.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                }).catch(err => { reject(err); });
            });
        },

        UpdateDataInCustomMapDataSet(datasetLayers, customMapId) {
            return new Promise((resolve, reject) => {
                CustomMap_DataSet.hardDelete({ CustomMapId: customMapId }).then(data => {
                    if (datasetLayers.length > 0) {
                        var rows = [];
                        for (var layer of datasetLayers) {
                            var param = {
                                CustomMapId: customMapId,
                                DataSetId: layer
                            };
                            let ColKey = Object.keys(param);
                            let dataFields = "CustomMapId,DataSetId";
                            dataFields = dataFields.split(',');
                            for (let i = 0; i < ColKey.length; i++) {
                                if (!param[ColKey[i]]) {
                                    param[ColKey[i]] = null;
                                }
                                if (dataFields.indexOf(ColKey[i]) == -1)
                                    delete param[ColKey[i]];
                            }
                            rows.push(param);
                        }
                        CustomMap_DataSet.bulkSave(rows)
                            .then(data => { resolve(data); })
                            .catch(err => { reject(err); });
                    }
                    else
                        CustomMap_DataSet.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                }).catch(err => { reject(err); });
            });
        },

        UpdateDataInCustomMapDefaultCheckedLayer(defaultCheckedLayers, customMapId) {
            return new Promise((resolve, reject) => {
                if (defaultCheckedLayers.length > 0) {
                    CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId }).then(data => {
                        var needToAddLayers = [];
                        var needToDeleteLayers = [];
                        if (data.length > 0) {
                            var layersGuid = data.map(r => r.LayerGuid);
                            data.map(function (el) {
                                if (defaultCheckedLayers.indexOf(el.LayerGuid) < 0)
                                    needToDeleteLayers.push(el.Id);
                            });
                            defaultCheckedLayers.map(function (el) {
                                if (layersGuid.indexOf(el) < 0)
                                    needToAddLayers.push(el);
                            });
                        }
                        else
                            needToAddLayers = defaultCheckedLayers;
                        if (needToAddLayers.length > 0 && needToDeleteLayers.length > 0) {
                            CustomMap_DefaultCheckedLayer.bulkHardDelete("Id", needToDeleteLayers)
                                .then(data => {
                                    if (data > 0) {
                                        var rows = [];
                                        for (var layer of needToAddLayers) {
                                            var param = {
                                                CustomMapId: customMapId,
                                                LayerGuid: layer
                                            };
                                            let ColKey = Object.keys(param);
                                            let dataFields = "CustomMapId,LayerGuid";
                                            dataFields = dataFields.split(',');
                                            for (let i = 0; i < ColKey.length; i++) {
                                                if (!param[ColKey[i]]) {
                                                    param[ColKey[i]] = null;
                                                }
                                                if (dataFields.indexOf(ColKey[i]) == -1)
                                                    delete param[ColKey[i]];
                                            }
                                            rows.push(param);
                                        }
                                        CustomMap_DefaultCheckedLayer.bulkSave(rows)
                                            .then(data => {
                                                if (data.length > 0)
                                                    CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                                            }).catch(err => { reject(err); });
                                    }
                                }).catch(err => { reject(err); })
                        }
                        else if (needToAddLayers.length > 0 && needToDeleteLayers.length == 0) {
                            var rows = [];
                            for (var layer of needToAddLayers) {
                                var param = {
                                    CustomMapId: customMapId,
                                    LayerGuid: layer
                                };
                                let ColKey = Object.keys(param);
                                let dataFields = "CustomMapId,LayerGuid";
                                dataFields = dataFields.split(',');
                                for (let i = 0; i < ColKey.length; i++) {
                                    if (!param[ColKey[i]]) {
                                        param[ColKey[i]] = null;
                                    }
                                    if (dataFields.indexOf(ColKey[i]) == -1)
                                        delete param[ColKey[i]];
                                }
                                rows.push(param);
                            }
                            CustomMap_DefaultCheckedLayer.bulkSave(rows)
                                .then(data => {
                                    if (data.length > 0)
                                        CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                                })
                                .catch(err => { reject(err); });
                        }
                        else if (needToDeleteLayers.length > 0 && needToAddLayers.length == 0) {
                            CustomMap_DefaultCheckedLayer.bulkHardDelete("Id", needToDeleteLayers)
                                .then(data => {
                                    if (data > 0)
                                        CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                                })
                                .catch(err => { reject(err); });
                        }
                    }).catch(err => { reject(err); });
                }
                else {
                    CustomMap_DefaultCheckedLayer.hardDelete({ CustomMapId: customMapId }).then(data => {
                        CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                    }).catch(err => { reject(err); });
                }
            });
        },

        UpdateDataInCustomMapLayerGridFilters(gridFilter, customMapId) {
            return new Promise((resolve, reject) => {
                LayerGridFilter.hardDelete({ MapId: customMapId }).then(data => {
                    if (gridFilter.length > 0) {
                        var rows = [];
                        for (var param of gridFilter) {
                            param.CreatedDate = new Date();
                            param.UpdatedDate = new Date();
                            param.MapId = customMapId;
                            let ColKey = Object.keys(param);
                            let dataFields = "LayerId,IsEnergyLayer,UserId,FilterSaveString,CreatedDate,UpdatedDate,MapId";
                            dataFields = dataFields.split(',');
                            for (let i = 0; i < ColKey.length; i++) {
                                if (!param[ColKey[i]]) {
                                    param[ColKey[i]] = null;
                                }
                                if (dataFields.indexOf(ColKey[i]) == -1)
                                    delete param[ColKey[i]];
                                if (param[ColKey[i]]) {
                                    if (param[ColKey[i]].toString().toLowerCase() == "true")
                                        param[ColKey[i]] = "1";
                                    if (param[ColKey[i]].toString().toLowerCase() == "false")
                                        param[ColKey[i]] = "0";
                                }
                            }
                            rows.push(param);
                        }
                        LayerGridFilter.bulkSave(rows)
                            .then(data => { resolve(data); })
                            .catch(err => { reject(err); });
                    }
                    else
                        LayerGridFilter.find({ MapId: customMapId }).then(data => { resolve(data); }).catch(err => { reject(err); });
                }).catch(err => { reject(err); });
            });
        },

        GetMapData: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                CustomMapData: null,
                errormsg: '',
            }
            var CustomMapId = request.query.CustomMapId;
            var promises = [];
            promises.push(module.exports.GetCustomMapById(CustomMapId));
            promises.push(module.exports.GetCustomMapEnergyLayerById(CustomMapId));
            promises.push(module.exports.GetCustomMapDataSetById(CustomMapId));
            promises.push(module.exports.GetCustomMapDefaultCheckedLayerById(CustomMapId));
            Promise.all(promises).then(function (data) {
                if (data.length == 4) {
                    JsonData._Issuccess = true;
                    JsonData.CustomMapData = {
                        CustomMaps: data[0],
                        CustomMaps_EnergyLayers: data[1],
                        CustomMaps_DataSets: data[2],
                        CustomMaps_DefaultCheckedLayers: data[3]
                    }
                    response.json(JsonData);
                }
            },
                function (error) {
                    JsonData._Issuccess = false;
                    JsonData.errormsg = error;
                    logger.error("GetMapData", "MyMap", error);
                    response.json(JsonData);
                });
        },

        GetCustomMapById(customMapId) {
            return new Promise((resolve, reject) => {
                CustomMap.find({ CustomMapId: customMapId })
                    .then(data => { resolve(data); })
                    .catch(err => { reject(err); });
            });
        },

        GetCustomMapEnergyLayerById(customMapId) {
            return new Promise((resolve, reject) => {
                let query = SQLQuery.GetCustomMapEnergyLayersQuery(customMapId);
                KnexRaw.raw(query)
                    .then(data => { resolve(data); })
                    .catch(err => { reject(err); });
            });
        },

        GetCustomMapDataSetById(customMapId) {
            return new Promise((resolve, reject) => {
                let query = SQLQuery.GetCustomMapPrivateLayersQuery(customMapId);
                KnexRaw.raw(query)
                    .then(data => { resolve(data); })
                    .catch(err => { reject(err); });
            });
        },

        GetCustomMapDefaultCheckedLayerById(customMapId) {
            return new Promise((resolve, reject) => {
                CustomMap_DefaultCheckedLayer.find({ CustomMapId: customMapId })
                    .then(data => { resolve(data); })
                    .catch(err => { reject(err); });
            });
        },

        GetGUIDOfDataSets: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                result: null,
                errormsg: '',
            }
            var dataSetIds = request.query.DataSetIds.split(',');
            if (dataSetIds.length > 0) {
                DataSet.bulkFind("DataSetID", dataSetIds)
                    .then(data => {
                        if (data.length > 0) {
                            JsonData._Issuccess = true;
                            JsonData.result = data;
                            response.json(JsonData);
                        }
                    })
                    .catch(err => {
                        JsonData._Issuccess = false;
                        JsonData.errormsg = err;
                        logger.error("GetGUIDOfDataSets", "MyMap", error);
                        response.json(JsonData);
                    });
            }
        },

        DeleteMap: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                CustomMapData: null,
                errormsg: '',
            }
            var customMapId = request.query.CustomMapId;
            CustomMap.update({ CustomMapId: customMapId }, { IsDeleted: 1 })
                .then(data => {
                    if (data.length == 1) {
                        JsonData._Issuccess = true;
                        JsonData.CustomMapData = data;
                        response.json(JsonData);
                    }
                })
                .catch(err => {
                    JsonData._Issuccess = false;
                    JsonData.errormsg = err;
                    logger.error("DeleteMap", "MyMap", err);
                    response.json(JsonData);
                });
        },
        InsertEnergyLayerStylesByUser: function (energyLayersids, customMapId, UserId) {
            if (energyLayersids.length > 0 && customMapId && UserId) {
                let energyLayersstyleUserids = energyLayersids.join(',');
                let Selectquery = "select * from EnergyLayerStylesByUser where UserId='" + UserId + "' and id in(" + energyLayersstyleUserids + ") and mapid is null ";
                let InsertQuery = " insert into EnergyLayerStylesByUser (EnergyLayerId" +
                    ",UserId" +
                    ",IconType" +
                    ",StrokeThicknessPercent" +
                    ",StrokeColor" +
                    ",FillColor" +
                    ",SizePercent" +
                    ",Opacity" +
                    ",Created" +
                    ",CreatedBy" +
                    ",Updated" +
                    ",UpdatedBy" +
                    ",IsLabelVisible" +
                    ",LabelField" +
                    ",DetailPanelProperties" +
                    ",DateIS" +
                    ",ExternalIconId" +
                    ",MapId" +
                    ",IsChecked" +
                    ",DetailPanelPropertiesBackup)  " +
                    "  select EnergyLayerId" +
                    ",UserId" +
                    ",IconType" +
                    ",StrokeThicknessPercent" +
                    ",StrokeColor" +
                    ",FillColor" +
                    ",SizePercent" +
                    ",Opacity" +
                    ",getdate()" +
                    ",CreatedBy" +
                    ",null" +
                    ",UpdatedBy" +
                    ",IsLabelVisible" +
                    ",LabelField" +
                    ",DetailPanelProperties" +
                    ",DateIS" +
                    ",ExternalIconId" +
                    "," + customMapId + " as MapId" +
                    ",IsChecked" +
                    ",DetailPanelPropertiesBackup from EnergyLayerStylesByUser s where UserId='" + UserId + "' and id in (" + energyLayersstyleUserids + ") and mapid is null  ";
                let query = "  if (EXISTS(" + Selectquery + "))BEGIN" + InsertQuery + Selectquery + " end else BEGIN select 'No any Data found'; end ";
                KnexRaw.raw(query)
                    .then(data => {
                        logger.detaillog("Data Inserted Successfully");
                    })
                    .catch(err => {
                        logger.error("InsertEnergyLayerStylesByUser", "MyMap", error);
                    });
            }
        },

        InsertMyMapLog: function (req, res, next) {
            let MyMapData = req.body.MyMapData;
            let UserId = req.body.UserId;
            var JsonData = {
                _Issuccess: false,
                LogData: null,
                errormsg: ""
            }
            try {
                var Description = "";
                var UserGuid = UserId;
                var Logtype = CreateLogsHelper.GetLogtype.LoadedMap;
                Description = 'User ' + req.body.UserName + ' loaded My Maps "' + MyMapData.Name + '"';

                CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                    logger.detaillog("Loaded map Logs inserted successfully..");
                    JsonData.isSuccess = true;
                    JsonData.LogData = data;
                    JsonData.errormsg = "";
                    res.json(JsonData);
                }, function (error) {
                    logger.error("InsertMyMapLog", "MyMap", error);
                    JsonData.isSuccess = false;
                    JsonData.LogData = null;
                    JsonData.errormsg = error;
                    res.json(JsonData);
                });
            } catch (err) {
                JsonData.isSuccess = false;
                JsonData.LogData = null;
                JsonData.errormsg = err;
                res.json(JsonData);
            }
        },

        InsertMyMapChangeLog: function (req, res, next) {
            let MyMapData = req.body.MyMapData;
            let UserId = req.body.UserId;
            var JsonData = {
                _Issuccess: false,
                LogData: null,
                errormsg: ""
            }
            try {
                var Description = "";
                var UserGuid = UserId;
                var Logtype = CreateLogsHelper.GetLogtype.MyMapChanged;
                Description = 'Map Saved. MapName: ' + MyMapData.CustomMapData.Name + ' Mapid: ' + MyMapData.LoadedCustomMapID + '; BaseMapId: ' + MyMapData.CustomMapData.BaseMapProviderId + ';';
                if (MyMapData.EnergyLayers.length > 0)
                    Description += ' EnergyLayerIds: ' + MyMapData.EnergyLayers.toString();
                if (MyMapData.PrivateLayers.length > 0)
                    Description += '; MyDataSetIds: ' + MyMapData.PrivateLayers.toString();
                if (MyMapData.SharedLayers.length > 0)
                    Description += '; PublicDataSetIds: ' + MyMapData.SharedLayers.toString();

                CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                    logger.detaillog("change my map Logs inserted successfully..");
                    JsonData.isSuccess = true;
                    JsonData.LogData = data;
                    JsonData.errormsg = "";
                    res.json(JsonData);
                }, function (error) {
                    logger.error("ChangeMyMapLog", "MyMap", error);
                    JsonData.isSuccess = false;
                    JsonData.LogData = null;
                    JsonData.errormsg = error;
                    res.json(JsonData);
                });
            } catch (err) {
                JsonData.isSuccess = false;
                JsonData.LogData = null;
                JsonData.errormsg = err;
                res.json(JsonData);
            }
        }

    };