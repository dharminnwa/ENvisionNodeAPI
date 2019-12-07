var logger = require("../Helper/logs");
var MyMapHelper = require("../Helper/MyMap");
var SQLQueryparameters = require("../Helper/SqlQuery/LayerQuery");
const request = require('request');
const { KnexRaw, CustomMaps_CooperativeUser } = require('../Models');
var Utilityjs = require('../Helper/Utility');
const TestMyMapRoutes = (req, res, next) => {
    logger.detaillog("MyMap Call Controller successfully");
    res.json("MyMap Call successfully");
}

const SaveMyMap = (req, res, next) => {
    MyMapHelper.SaveMap(req, res, next);
}

const CheckMapName = (req, res, next) => {
    MyMapHelper.CheckMapNameExists(req, res, next);
}

const UpdateMyMap = (req, res, next) => {
    MyMapHelper.UpdateMap(req, res, next);
}

const DeleteMyMap = (req, res, next) => {
    MyMapHelper.DeleteMap(req, res, next);
}

const GetMyMapById = (req, res, next) => {
    MyMapHelper.GetMapData(req, res, next);
}

const GetGUIDByDataSets = (req, res, next) => {
    MyMapHelper.GetGUIDOfDataSets(req, res, next);
}
const SaveLayerGridFilters = (req, res, next) => {
    var JsonData = {
        LayerGridfilter: null,
        Errormsg: null,
        _Issuccess: false
    }
    MyMapHelper.AddDataInLayerGridFilters(req.body, null).then(function (data) {
        JsonData._Issuccess = true;
        if (JsonData._Issuccess) {
            if (data.length > 0) {
                Utilityjs.CreateCqlFilterFromXML(data);
            }
        }
        JsonData.LayerGridfilter = data;
        res.json(JsonData);
    }, function (error) {
        JsonData._Issuccess = false;
        JsonData.errormsg = error;
        logger.error("GetMapData", "MyMap", error);
        res.json(JsonData);
    });
}
const GetListOfCompnayUserList = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        Data: null,
        CustomMaps_CooperativeUser: null,
        errormsg: ''
    }
    var Data = req.query;
    let Query = SQLQueryparameters.GetCompnayNameByUserId(Data.UserId);
    KnexRaw.raw(Query).then(function (ResData) {
        if (ResData.length > 0) {
            let CustomerID = ResData[0].CustomerID;
            let GetUserListQuery = SQLQueryparameters.GetUserListbasedonCompanyId(Data.UserId, CustomerID);
            KnexRaw.raw(GetUserListQuery).then(function (resUserList) {
                JsonData._Issuccess = true;
                JsonData.Data = resUserList;
                CustomMaps_CooperativeUser.find({ MapID: Data.MapId })
                    .then(cooperativeRes => {
                        JsonData.CustomMaps_CooperativeUser = cooperativeRes;
                        JsonData._Issuccess = true;
                        res.json(JsonData);
                    })
                    .catch(function (error) {
                        JsonData._Issuccess = true;
                        JsonData.Data = resUserList;
                        res.json(JsonData);
                    });

            }).catch(function (error) {
                Utilityjs.InserterrorExceptionLogs(req, Data.UserId, error.originalError.message)
            });
        } else {
            res.json(JsonData);
        }
    }).catch(function (error) {
        Utilityjs.InserterrorExceptionLogs(req, Data.UserId, error.originalError.message)
    });

}

const SaveSharedmymap = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        SavedMymap: null,
        errormsg: ''
    }
    var SelectedUserList = req.body.SelectedUser;
    var CustomMapId = req.body.CustomMapId;
    MyMapHelper.UpdateDataInCustomMap(req.body, CustomMapId).then(function (resdata) {
        CustomMaps_CooperativeUser.hardDelete({ MapID: CustomMapId })
            .then(cooperativeRes => {
                if (SelectedUserList) {
                    var param = [];
                    SelectedUserList.forEach(element => {
                        param.push({ MapID: CustomMapId, UserGuid: element.UserId });
                    });
                    CustomMaps_CooperativeUser.bulkSave(param)
                        .then(data => {
                            JsonData._Issuccess = true;
                            JsonData.SavedMymap = resdata;
                            res.json(JsonData);
                        })
                        .catch(err => {
                            JsonData.errormsg = error;
                            logger.error("SaveSharedmymap CustomMaps_CooperativeUser bulkSave", "MyMap", error);
                            res.json(JsonData);
                        });
                }
                else {
                    JsonData._Issuccess = true;
                    JsonData.SavedMymap = resdata;
                    res.json(JsonData);
                }
            })
            .catch(function (error) {
                JsonData.errormsg = error;
                logger.error("SaveSharedmymap CustomMaps_CooperativeUser", "MyMap", error);
                res.json(JsonData);
            });

    }, function (error) {
        JsonData.errormsg = error;
        logger.error("SaveSharedmymap UpdateDataInCustomMap", "MyMap", error);
        res.json(JsonData);
    });
}

const InsertMyMapLogs = (req, res, next) => {
    MyMapHelper.InsertMyMapLog(req, res, next);
}

const InsertMyMapChangedLogs = (req, res, next) => {
    MyMapHelper.InsertMyMapChangeLog(req, res, next);
}


module.exports = {
    TestMyMapRoutes,
    SaveMyMap,
    CheckMapName,
    UpdateMyMap,
    DeleteMyMap,
    GetMyMapById,
    GetGUIDByDataSets,
    SaveLayerGridFilters,
    GetListOfCompnayUserList,
    SaveSharedmymap,
    InsertMyMapLogs,
    InsertMyMapChangedLogs
};