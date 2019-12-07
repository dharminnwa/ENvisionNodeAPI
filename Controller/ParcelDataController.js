var logger = require("../Helper/logs");
var PostGrePrama = require("../Helper/SqlQuery/PostGreQuery");
const { KnexRawPG } = require('../Models/PostgreDb');
const { KnexRaw } = require('../Models');
var CreateLogsHelper = require("../Helper/createLogs");


const ParcelsTestCall = (req, res, next) => {
    logger.detaillog("Parcels Controller Call successfully");
    res.json("Parcels Call successfully");
}

const GetState = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        States: null
    }
    let userId = req.body.userId;
    let query = PostGrePrama.GetParcelStatesQuery(req.body);
    let logData = {
        Type: 'Point',
        Distance: req.body.distanceMeter,
        Query: query
    }
    var Description = "";
    var UserGuid = userId;
    var Logtype = CreateLogsHelper.GetLogtype.ParcelBuffer;
    Description = "Type: " + logData.Type + "; Distance (m): " + logData.Distance + "; Query: " + logData.Query;
    CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
        logger.detaillog("Parcel buffer logs inserted successfully..");
    }, function (error) {
        logger.error("InsertParcelBufferLog", "ParcelData", error);
        JsonData._Issuccess = false;
        JsonData.States = null;
        res.json(JsonData);
    });
    KnexRawPG.raw(query)
        .then(data => {
            let result = data.rows;
            var promises = [];
            for (let i = 0; i < result.length; i++) {
                let stateItem = result[i];
                let energyLayerQuery = PostGrePrama.GetParcelTreeNameQuery(stateItem);
                if (energyLayerQuery != '') {
                    promises.push(getStateLayerName(energyLayerQuery, stateItem));
                }
            }
            Promise.all(promises).then(function (StatesData) {
                // res = StatesData;
                JsonData._Issuccess = true;
                JsonData.States = StatesData;
                res.json(JsonData);
            }, function (error) {
                JsonData._Issuccess = true;
                JsonData.States = StatesData;
                res.json(JsonData);
                console.log(error);
            });
        })
        .catch(next);
}

const GetStateFromLineString = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        States: null
    }
    let userId = req.body.userId;
    let query = PostGrePrama.GetParcelStatesLineStringQuery(req.body);
    let logData = {
        Type: 'Line',
        Distance: req.body.distanceMeter,
        Query: query
    }
    var Description = "";
    var UserGuid = userId;
    var Logtype = CreateLogsHelper.GetLogtype.ParcelBuffer;
    Description = "Type: " + logData.Type + "; Distance (m): " + logData.Distance + "; Query: " + logData.Query;
    CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
        logger.detaillog("Parcel buffer logs inserted successfully..");
    }, function (error) {
        logger.error("InsertParcelBufferLog", "ParcelData", error);
        JsonData._Issuccess = false;
        JsonData.States = null;
        res.json(JsonData);
    });
    KnexRawPG.raw(query)
        .then(data => {
            let result = data.rows;
            var promises = [];
            for (let i = 0; i < result.length; i++) {
                let stateItem = result[i];
                let energyLayerQuery = PostGrePrama.GetParcelTreeNameQuery(stateItem);
                if (energyLayerQuery != '') {
                    promises.push(getStateLayerName(energyLayerQuery, stateItem));
                }
            }
            Promise.all(promises).then(function (StatesData) {
                // res = StatesData;
                JsonData._Issuccess = true;
                JsonData.States = StatesData;
                res.json(JsonData);
            }, function (error) {
                JsonData._Issuccess = true;
                JsonData.States = StatesData;
                res.json(JsonData);
                console.log(error);
            });
        })
        .catch(next);
}

function getStateLayerName(energyLayerQuery, stateItem) {
    return new Promise((resolve, reject) => {
        KnexRaw.raw(energyLayerQuery)
            .then(energyData => {
                if (energyData.length && energyData.length > 0) {
                    for (let j = 0; j < energyData.length; j++) {
                        let item = energyData[j];
                        if (item.TableName && item.DisplayName) {
                            stateItem[item.TableName] = item.DisplayName;
                        }
                    }
                    // JsonData.States = result;
                    // JsonData._Issuccess = true;
                    // res.json(JsonData);
                    resolve(stateItem);
                } else {
                    // JsonData.States = result;
                    // JsonData._Issuccess = true;
                    // res.json(JsonData);
                    resolve(stateItem);
                }
            })
            .catch(err => reject(err));
    });

}

module.exports = {
    ParcelsTestCall,
    GetState,
    GetStateFromLineString
};