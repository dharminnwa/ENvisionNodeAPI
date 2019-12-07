var logger = require("../Helper/logs");
var QueryPrama = require("../Helper/GetQueryPrama");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
const request = require('request');
const { Category, KnexRaw } = require('../Models');
//var MapSearchTreeHelper = require("../Helper/MapsearchTreeLayer");
var Utilityjs = require('../Helper/Utility');
var CreateLogsHelper = require("../Helper/createLogs");

const TestRoot = (req, res, next) => {
    logger.detaillog("Layer Call Controller successfully");
    res.json("Layer Call successfully");
}

const TestLayer = (req, res, next) => {
    logger.detaillog("Test successfully");
    res.json("Test successfully");
}

const MapSearchLayerCategory = (req, res, next) => {
    var JsonData = {
        LayerLibrary: null,
        errormsg: '',
        Body: req.query
    }
    let Query = SQLQueryPrama.GetLayercategoriesRolewise(req.query.UserId);
    KnexRaw.raw(Query)
        .then(function (SQLRes) {
            if (SQLRes.length > 0) {
                let parentCategories = SQLRes.filter(x => x.ParentCategoryID == null);
                let childCategories = SQLRes.filter(x => x.ParentCategoryID != null);
                parentCategories.forEach(x => { x['CategoryChilds'] = []; });
                childCategories.forEach(category => {
                    let parentCategory = parentCategories.find(x => x.CategoryID == category.ParentCategoryID);
                    if (parentCategory && parentCategory.CategoryChilds)
                        parentCategory.CategoryChilds.push(category);
                });
                JsonData.LayerLibrary = parentCategories;
                res.json(JsonData);
            }
            else {
                JsonData.LayerLibrary = null;
                JsonData.errormsg = "Category list is not geting";
                logger.error("MapSearchLayerCategory", "MapsearchLayer", JsonData.errormsg);
                res.json(JsonData);
            }
        }).catch(function (error) {
            Utilityjs.InserterrorExceptionLogs(req, req.query.UserId, error.originalError.message);
            next(error);
        });
    // Category.find({ IsEnabled: 1 }).orderBy('Ordernumber')
    //     .then(function (SQLRes) {
    //         if (SQLRes.length > 0) {
    //             let parentCategories = SQLRes.filter(x => x.ParentCategoryID == null);
    //             let childCategories = SQLRes.filter(x => x.ParentCategoryID != null);
    //             parentCategories.forEach(x => { x['CategoryChilds'] = []; });
    //             childCategories.forEach(category => {
    //                 let parentCategory = parentCategories.find(x => x.CategoryID == category.ParentCategoryID);
    //                 if (parentCategory && parentCategory.CategoryChilds)
    //                     parentCategory.CategoryChilds.push(category);
    //             });
    //             JsonData.LayerLibrary = parentCategories;
    //             res.json(JsonData);
    //         }
    //         else {
    //             JsonData.LayerLibrary = null;
    //             JsonData.errormsg = "Category list is not geting";
    //             logger.error("MapSearchLayerCategory", "MapsearchLayer", JsonData.errormsg);
    //             res.json(JsonData);
    //         }
    //     }).catch(function (error) {
    //         Utilityjs.InserterrorExceptionLogs(req, req.body.UserId, error.originalError.message);
    //         next(error);
    //     });
}

const MapSearchEnergyLayerLibrary = (req, res, next) => {
    var JsonData = {
        LayerLibrary: null,
        errormsg: '',
        Body: req.query,
        TotalCount: 0
    }
    _EnergyLayerQery = SQLQueryPrama.GetMapSearchEnergyLayerLibrary(req.query);
    KnexRaw.raw(_EnergyLayerQery)
        .then(function (Data) {
            var SQLRes = Data;
            if (SQLRes.length > 0 && req.query.UserID) {
                SQLRes = SQLRes.map((el) => {
                    var o = Object.assign({}, el);
                    o.EnergyLayerStylesByUsers = [];
                    return o;
                });
                let _QueryEnergyLayerSylebyUser = " select * from EnergyLayerStylesByUser ELSBU where ELSBU.UserID='" + req.query.UserID + "' order by EnergyLayerId";
                KnexRaw.raw(_QueryEnergyLayerSylebyUser)
                    .then(function (stylebyuserData) {
                        var _stylebyuserData = stylebyuserData;
                        if (_stylebyuserData.length > 0) {
                            for (let i = 0; i < SQLRes.length; i++) {
                                let EnergyLayer = SQLRes[i];
                                for (let j = 0; j < _stylebyuserData.length; j++) {
                                    let Stybydata = _stylebyuserData[j];
                                    if (EnergyLayer.EnergyLayerID == Stybydata.EnergyLayerId && Stybydata.UserId == req.query.UserID) {
                                        EnergyLayer.EnergyLayerStylesByUsers.push(Stybydata);
                                    }
                                }
                            }
                            JsonData.LayerLibrary = SQLRes;
                            JsonData.errormsg = "";
                            JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                            res.json(JsonData);
                        }
                        else {
                            JsonData.LayerLibrary = SQLRes;
                            JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                            JsonData.errormsg = "";
                            res.json(JsonData);
                        }
                    }).catch(function (error) {
                        logger.error("MapSearchEnergyLayerLibrary", "MapsearchLayer", error);
                        JsonData.LayerLibrary = SQLRes;
                        JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                        Utilityjs.InserterrorExceptionLogs(req, req.query.UserID, error.originalError.message);
                        res.json(JsonData);
                    });
            }
            else {
                JsonData.LayerLibrary = SQLRes;
                res.json(JsonData);
            }
        }).catch(function (error) {
            Utilityjs.InserterrorExceptionLogs(req, req.query.UserID, error.originalError.message);
            next(error);
        });;
}

const GetLayerTreeView = (req, res, next) => {
    let URL = QueryPrama.CreateGetTreeviewDataURL(req.query);
    request(URL, { json: true }, (error, response, body) => {
        let requestres = {
            isSuccess: false,
            result: null,
            errorMessage: null
        }
        if (error) {
            logger.error("GetLayerTreeView", "Layer", error);
            requestres.errorMessage = error;
            try {
                var Description = error.message;
                var UserGuid = req.query.UserId;
                Utilityjs.InserterrorExceptionLogs(req, UserGuid, Description);
            } catch (e) { console.log(e) }

        }
        else {
            logger.detaillog("GetLayerTreeViewData successfully");
            requestres = JSON.parse(response.body);
            if (requestres.isSuccess && requestres.result.MapLayers.length > 0) {
                try {
                    for (var layer of requestres.result.MapLayers) {
                        if (layer.LayerGridFilterModel.length > 0)
                            Utilityjs.CreateCqlFilterFromXML(layer.LayerGridFilterModel);
                    }
                    var LayerName = requestres.result.MapLayers[0].DisplayName;
                    var EnergyLayerUGid = requestres.result.MapLayers[0].EnergyLayerGUID;
                    var Description = LayerName + " Added To Map";
                    var UserGuid = req.query.UserId;
                    var Logtype = CreateLogsHelper.GetLogtype.MapsearchLayerAdded;
                    CreateLogsHelper.createLogs(req, UserGuid, EnergyLayerUGid, null, Logtype, Description).then(function (data) {
                        logger.detaillog("User GetLayerTreeView Logs inserted successfully..");
                    }, function (error) {
                        logger.error("Login", "Login", "User GetLayerTreeView not inserted successfully.." + error);
                    });

                } catch (e) {
                    console.log(e);
                }
            }

        }
        res.json(requestres);
    });
};

//const GetEneryLayerTreeData = (req, res, next) => {
//    JsonData = {
//        isSuccess: false,
//        errorMessage: "",
//        result: {
//            ExternalIcon: null,
//            MapLayers: null,
//            TreeData: null
//        }
//    }
//    // var data = MapSearchTreeHelper.GetEnegeryLayersTreeViewParent(req, res, next);
//    let treeView = [];
//    let treeChild = 0;
//    let layerList = [];
//    let layerid = req.query.LayerID;
//    let userId = req.query.UserID;//--//UserData.UserGuid;//"F88174DB-F6A4-444C-A7FF-7FC7E549D293"; //
//    MapSearchTreeHelper.GetEnegeryLayersTreeViewParent(next, layerid, treeView, treeChild, layerList, userId).then(function (data) {
//        JsonData.isSuccess = true;
//        var treeData = MapSearchTreeHelper.ConvertToTreeDataForEnergyLayer(data.TreeView, data.LayerList);
//        let GetExternalIconByUserIdQuery = SQLQueryPrama.GetExternalIconByUserId(userId);
//        KnexRaw.raw(GetExternalIconByUserIdQuery).then(function (externalIcon) {
//            JsonData.result.MapLayers = data.LayerList;
//            JsonData.result.TreeData = treeData;
//            JsonData.result.ExternalIcon = externalIcon;
//            res.json(JsonData);
//        }, function (error) {
//            logger.error("MapSearchEnergyLayerLibrary", "GetExternalIconByUserId", error)
//            res.json(JsonData);
//        }).catch(next);
//    }, function (error) {
//        logger.error("MapSearchEnergyLayerLibrary", "GetEneryLayerTreeData", error)
//        res.json(JsonData);
//    }).catch(next);
//}


const GetBaseMap = (req, res, next) => {
    let query = SQLQueryPrama.GetBaseMapDataQuery();
    KnexRaw.raw(query)
        .then(function (baseMaps) {
            res.json(baseMaps);
        }).catch(next);
}

const GetBaseMap_New = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        BaseMapData: null,
        MapSettingData: null,
        errormsg: ""
    }
    let UserId = req.query.UserId;
    let query = SQLQueryPrama.GetBaseMapDataQuery();
    let mapSettingquery = SQLQueryPrama.GetMapSettingQuery(UserId);
    KnexRaw.raw(query)
        .then(function (baseMaps) {
            JsonData._Issuccess = true;
            JsonData.BaseMapData = baseMaps
            KnexRaw.raw(mapSettingquery).then(function (ResmapsettingData) {
                JsonData._Issuccess = true;
                JsonData.MapSettingData = ResmapsettingData
                //InsertLog(req, JsonData.BaseMapData, ResmapsettingData, req.query.UserId);
                res.json(JsonData);
            }).catch(function (error) {
                logger.error("Layer", "GetBaseMap", error);
                Utilityjs.InserterrorExceptionLogs(req, req.query.UserId, error.originalError.message);
                res.json(JsonData);
            })
        }).catch(function (error) {
            Utilityjs.InserterrorExceptionLogs(req, UserId, error.originalError.message);
            next(error)
        });
};
const InsertBaseMapLogs = (req, res, next) => {
    InsertLog(req, res, next);
}
const SaveMapSetting = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        MapSettingData: null,
        errormsg: ""
    }
    var UserID = req.query.UserId;
    var BaseMapProviderID = req.query.BaseMapProviderID;
    let Query = SQLQueryPrama.InsertMapSetting(UserID, BaseMapProviderID);
    KnexRaw.raw(Query).then(function (ResmapsettingData) {
        JsonData._Issuccess = true;
        JsonData.MapSettingData = ResmapsettingData
        res.json(JsonData);
    }).catch(function (error) {
        logger.error("Layer", "SaveMapSetting", error);
        Utilityjs.InserterrorExceptionLogs(req, UserID, error.originalError.message);
        res.json(JsonData);
    });
}
const GetUserDetails = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        UserData: null,
        errormsg: ""
    }
    var UserID = req.query.UserId;
    let Query = SQLQueryPrama.GetUserDetailsQuery(UserID);
    KnexRaw.raw(Query).then(function (ResUserData) {
        JsonData._Issuccess = true;
        JsonData.UserData = ResUserData
        res.json(JsonData);
    }).catch(function (error) {
        Utilityjs.InserterrorExceptionLogs(req, UserID, error.originalError.message);
        next(error);
    });
}
module.exports = {
    TestRoot,
    TestLayer,
    MapSearchLayerCategory,
    MapSearchEnergyLayerLibrary,
    GetLayerTreeView,

    GetBaseMap_New,
    SaveMapSetting,
    GetUserDetails,
    InsertBaseMapLogs,
    GetBaseMap//,
    //GetEneryLayerTreeData
};
function InsertLog(req, res, next) {
    let BaseMapData = req.body.BaseMapData;
    let Mapsetting = req.body.Mapsetting;
    let UserId = req.body.UserId;
    var JsonData = {
        _Issuccess: false,
        LogData: null,
        errormsg: ""
    }
    try {
        var Description = ""
        var UserGuid = UserId;
        var Logtype = CreateLogsHelper.GetLogtype.BaseMapChanged;
        var mapid = 5;
        if (Mapsetting) {
            mapid = Mapsetting.BaseMapProviderID;

        }
        for (let i = 0; i < BaseMapData.length; i++) {
            let Basemap = BaseMapData[i];
            if (Basemap.BaseMapProviderID == mapid) {
                Description = "Basemap changed to " + Basemap.Name;
            }
        }
        CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
            logger.detaillog("Basemap changed Logs inserted successfully..");
            JsonData.isSuccess = true;
            JsonData.LogData = data;
            JsonData.errormsg = "";
            res.json(JsonData);
        }, function (error) {
            logger.error("InsertLog", "Layer",  error);
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
