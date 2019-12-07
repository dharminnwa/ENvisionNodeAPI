var logger = require("../Helper/logs");
var QueryPrama = require("../Helper/GetQueryPrama");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
var AddDataHelper = require("../Helper/AddData");
var Utilityjs = require('../Helper/Utility');
const request = require('request');
const { KnexRaw } = require('../Models');
var CreateLogsHelper = require("../Helper/createLogs");
const TestAddRoutes = (req, res, next) => {
    logger.detaillog("AddData Call Controller successfully");
    res.json("AddData Call successfully");
}

const GetPrivateLayerTreeView = (req, res, next) => {
    let URL = QueryPrama.CreateGetPrivateLayerTreeViewDataURL(req.query);
    request(URL, { json: true }, (error, response, body) => {
        let requestres = {
            isSuccess: false,
            result: null,
            errorMessage: null
        }
        if (error) {
            logger.error("GetPrivateLayerTreeViewData", "AddData", error);
            requestres.errorMessage = error;
        }
        else {
            logger.detaillog("GetLayerTreeViewData successfully");
            requestres = JSON.parse(response.body);
            try {
                var LayerName = requestres.result.MapLayers[0].DataSetName;
                var EnergyLayerUGid = requestres.result.MapLayers[0].DataSetGUID;
                var Description = LayerName + " Added To Map";
                var UserGuid = req.body.UserId;
                var Logtype = CreateLogsHelper.GetLogtype.MapsearchLayerAdded;
                CreateLogsHelper.createLogs(req, UserGuid, EnergyLayerUGid, null, Logtype, Description).then(function (data) {
                    logger.detaillog("User Logs inserted successfully..");
                }, function (error) {
                    logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                });
            } catch (e) {
                console.log(e);
            }
        }
        res.json(requestres)
    });
}

const GetPrivateLayerTreeView_node = (req, res, next) => {
    var JsonData = {
        isSuccess: false,
        result: null,
        errorMessage: '',
    }
    var treeView = [];
    var treeChild = 0;
    var layerList = [];
    var id = req.query.LayerId;
    var userId = req.query.UserId;
    var customMapId = req.query.CustomMapId;
    var loggedInUserId = req.query.LoggedInUserId;
    AddDataHelper.GetPrivateLayersTreeViewParent(next, id, treeView, treeChild, layerList, userId).then(function (data) {
        let layerFiledPromises = [];
        for (let layer of data.LayerList) {
            if (layer && layer.TableName) {
                let param = {
                    energyLayer: {
                        TableName: layer.TableName,
                        DataSetID: layer.DataSetID
                    }
                }
                layerFiledPromises.push(AddDataHelper.GetPropertyNames(param));
            }
        }
        Promise.all(layerFiledPromises).then(function (layerFieldData) {
            for (let layer of data.LayerList) {
                if (layer && layer.DataSetID) {
                    let geoserverFields = [];
                    layerFieldData.map(function (e) {
                        if (e.DataSetID == layer.DataSetID)
                            geoserverFields.push(e);
                    });
                    if (geoserverFields.length == 1 && geoserverFields[0].Fields.length > 0) {
                        let dbfProperties = layer.DBFProperties;
                        let detailPanelProperties = layer.DetailPanelProperties;
                        if (dbfProperties.length > 0) {
                            let properties = dbfProperties.split(',');
                            for (var i = properties.length - 1; i >= 0; i--) {
                                if (geoserverFields[0].Fields.indexOf(properties[i]) == -1) {
                                    properties.splice(i, 1);
                                }
                            }
                            layer.DBFProperties = properties.toString();
                        }
                        if (detailPanelProperties.length > 0) {
                            if (detailPanelProperties.length > 0) {
                                let properties = detailPanelProperties.split(',');
                                for (var i = properties.length - 1; i >= 0; i--) {
                                    if (properties[i].indexOf("=") > -1) {
                                        let property = properties[i].split("=");
                                        if (geoserverFields[0].Fields.indexOf(property[1]) == -1) {
                                            properties.splice(i, 1);
                                        }
                                    }
                                }
                                layer.DetailPanelProperties = properties.toString();
                            }
                        }
                    }
                }
            }

            AddDataHelper.SetMapLayersProperties(data.TreeView, data.LayerList, customMapId, loggedInUserId);
            var treeData = AddDataHelper.ConvertToTreeDataForPrivateLayer(data.TreeView, data.LayerList, customMapId, loggedInUserId);
            JsonData.result = { "TreeData": treeData, "MapLayers": data.LayerList };
            JsonData.isSuccess = true;
            try {
                if (JsonData.isSuccess) {
                    if (JsonData.result.MapLayers.length > 0) {
                        for (var layer of JsonData.result.MapLayers) {
                            if (layer.LayerGridFilterModel.length > 0)
                                Utilityjs.CreateCqlFilterFromXML(layer.LayerGridFilterModel);
                        }
                    }
                    var LayerName = JsonData.result.MapLayers[0].DataSetName;
                    var DatasetLayerUGid = JsonData.result.MapLayers[0].DataSetGUID;
                    var Description = LayerName + " Added To Map";
                    var UserGuid = userId;
                    var Logtype = CreateLogsHelper.GetLogtype.MapsearchLayerAdded;
                    CreateLogsHelper.createLogs(req, UserGuid, null, DatasetLayerUGid, Logtype, Description).then(function (data) {
                        logger.detaillog("User Login Logs inserted successfully..");
                    }, function (error) {
                        logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                    });
                }
            } catch (e) { console.log(e) }
            res.json(JsonData);
        }, function (error) {
            JsonData.isSuccess = false;
            JsonData.errorMessage = error;
            logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
            Utilityjs.InserterrorExceptionLogs(req, userId, error.originalError.message);
            res.json(JsonData);
        });
    }, function (error) {
        JsonData.isSuccess = false;
        JsonData.errorMessage = error;
        logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
        Utilityjs.InserterrorExceptionLogs(req, userId, error.originalError.message);
        res.json(JsonData);
    });
}

const GetPrivateGroupLayerTreeView_node = (req, res, next) => {
    var JsonData = {
        isSuccess: false,
        result: null,
        errorMessage: '',
    }
    var treeView = [];
    var treeChild = 0;
    var layerList = [];
    var parentId = req.query.LayerId;
    var childIds = req.query.ChildIds;
    var userId = req.query.UserId;
    var customMapId = req.query.CustomMapId;
    var loggedInUserId = req.query.LoggedInUserId;
    AddDataHelper.GetPrivateGroupLayersTreeViewParent(next, parentId, childIds, treeView, treeChild, layerList, userId).then(function (data) {
        let layerFiledPromises = [];
        for (let layer of data.LayerList) {
            if (layer && layer.TableName) {
                let param = {
                    energyLayer: {
                        TableName: layer.TableName,
                        DataSetID: layer.DataSetID
                    }
                }
                layerFiledPromises.push(AddDataHelper.GetPropertyNames(param));
            }
        }
        Promise.all(layerFiledPromises).then(function (layerFieldData) {
            for (let layer of data.LayerList) {
                if (layer && layer.DataSetID) {
                    let geoserverFields = [];
                    layerFieldData.map(function (e) {
                        if (e.DataSetID == layer.DataSetID)
                            geoserverFields.push(e);
                    });
                    if (geoserverFields.length == 1 && geoserverFields[0].Fields.length > 0) {
                        let dbfProperties = layer.DBFProperties;
                        let detailPanelProperties = layer.DetailPanelProperties;
                        if (dbfProperties.length > 0) {
                            let properties = dbfProperties.split(',');
                            for (var i = properties.length - 1; i >= 0; i--) {
                                if (geoserverFields[0].Fields.indexOf(properties[i]) == -1) {
                                    properties.splice(i, 1);
                                }
                            }
                            layer.DBFProperties = properties.toString();
                        }
                        if (detailPanelProperties.length > 0) {
                            if (detailPanelProperties.length > 0) {
                                let properties = detailPanelProperties.split(',');
                                for (var i = properties.length - 1; i >= 0; i--) {
                                    if (properties[i].indexOf("=") > -1) {
                                        let property = properties[i].split("=");
                                        if (geoserverFields[0].Fields.indexOf(property[1]) == -1) {
                                            properties.splice(i, 1);
                                        }
                                    }
                                }
                                layer.DetailPanelProperties = properties.toString();
                            }
                        }
                    }
                }
            }

            AddDataHelper.SetMapLayersProperties(data.TreeView, data.LayerList, customMapId, loggedInUserId);
            var treeData = AddDataHelper.ConvertToTreeDataForPrivateLayer(data.TreeView, data.LayerList, customMapId, loggedInUserId);
            for (var layer of data.LayerList) {
                if (layer.LayerGridFilterModel.length > 0)
                    Utilityjs.CreateCqlFilterFromXML(layer.LayerGridFilterModel);
            }
            JsonData.result = { "TreeData": treeData, "MapLayers": data.LayerList };
            JsonData.isSuccess = true;
            res.json(JsonData);
        }, function (error) {
            JsonData.isSuccess = false;
            JsonData.errorMessage = error;
            logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
            Utilityjs.InserterrorExceptionLogs(req, userId, error.originalError.message);
            res.json(JsonData);
        });
    }, function (error) {
        JsonData.isSuccess = false;
        JsonData.errorMessage = error;
        logger.error("GetPrivateGroupLayersTreeViewParent", "AddData", error);
        res.json(JsonData);
    });
}


const GetMyDataLibrary = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        LayerLibrary: null,
        errormsg: '',
    }
    var userId = req.query.UserId;
    let query = SQLQueryPrama.GetMyDataLibraryQuery(userId);
    KnexRaw.raw(query)
        .then(function (myLayerData) {
            var _myLayerData = myLayerData;
            JsonData.LayerLibrary = _myLayerData;
            JsonData._Issuccess = true;
            res.json(JsonData)
        }).catch(function (error) {
            Utilityjs.InserterrorExceptionLogs(req, userId, error.originalError.message);
            next(error);
        });
}

const RemoveMyDataLibrary = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        errormsg: '',
    }
    var layerId = req.query.LayerId;
    let query = SQLQueryPrama.RemoveDataInDataSetQuery(layerId);
    KnexRaw.raw(query)
        .then(function (data) {
            JsonData._Issuccess = true;
            res.json(JsonData)
        }).catch(next);
}

const UpdateMyLayerData = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        errormsg: ''
    }
    let query = SQLQueryPrama.UpdateMyDataLayerQuery(req.body);
    KnexRaw.raw(query)
        .then(function (data) {
            JsonData._Issuccess = true;
            res.json(JsonData)
        }).catch(function (error) {
            Utilityjs.InserterrorExceptionLogs(req, req.body.userId, error.originalError.message);
            next(error);
        });
}

const UploadFiles = (req, res, next) => {
    AddDataHelper.UploadFiles(req, res, next);
}

const GetKmlData = (req, res, next) => {
    AddDataHelper.GetKmlData(req, res, next);
}

module.exports = {
    TestAddRoutes,
    GetPrivateLayerTreeView,
    GetPrivateLayerTreeView_node,
    GetPrivateGroupLayerTreeView_node,
    GetMyDataLibrary,
    RemoveMyDataLibrary,
    UpdateMyLayerData,
    UploadFiles,
    GetKmlData
};