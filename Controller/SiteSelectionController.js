var logger = require("../Helper/logs");
const { KnexRawPG } = require('../Models/ParcelPostgreDb');
var PostGrePrama = require("../Helper/SqlQuery/PostGreQuery");
var toolQuery = require("../Helper/SqlQuery/ToolsQuery");
const { KnexRaw } = require('../Models');
var CreateLogsHelper = require("../Helper/createLogs");

const SiteSelectionTest = (req, res, next) => {
    res.json(" Site Selection Test successfully");
}

const GetPropertyTypes = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        PropertyTypes: [],
        Errormsg: ""
    }
    let tableName = req.query.TableName;
    var query = PostGrePrama.GetDistinctPropertyValues(tableName);
    return KnexRawPG.raw(query).then(data => {
        if (data.rowCount > 0) {
            let result = data.rows;
            JsonData.PropertyTypes = result;
            JsonData._Issuccess = true;
            res.json(JsonData);
        }
    }).catch(next);
}

const GetEnergyLayersIDS = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        EnergyLayersIDS: [],
        Errormsg: ""
    }
    let tableName = req.body.TableNames;
    var query = toolQuery.GetEnergyLayersIdsQuery(tableName);
    KnexRaw.raw(query).then(function (data) {
        if (data.length > 0) {
            JsonData.EnergyLayersIDS = data;
            JsonData._Issuccess = true;
            res.json(JsonData);
        }
    }).catch(next);
}

const InsertSiteSelectionLogs = (req, res, next) => {
    InsertSiteSelectionLog(req, res, next);
}

module.exports = {
    SiteSelectionTest,
    GetPropertyTypes,
    GetEnergyLayersIDS,
    InsertSiteSelectionLogs
};

function InsertSiteSelectionLog(req, res, next) {
    let ssFilterData = req.body.SiteSelectionFilterData;
    let UserId = req.body.UserId;
    var JsonData = {
        _Issuccess: false,
        LogData: null,
        errormsg: ""
    }
    try {
        var Description = "";
        var UserGuid = UserId;
        var Logtype = CreateLogsHelper.GetLogtype.SiteSelection;
        Description = ssFilterData.StateName + "; " + ssFilterData.CountyName + "; Size: " + ssFilterData.Size;

        if (ssFilterData.SelectedLines.length > 0) {
            Description = Description + "; Translines: "
            for (let i = 0; i < ssFilterData.SelectedLines.length; i++) {
                Description = Description + ", " + ssFilterData.SelectedLines[i].value;
            }
        }
        Description = Description + "; Substation : " + ssFilterData.Substation;
        if (ssFilterData.Propeties.length > 0) {
            Description = Description + "; Property types: "
            for (let i = 0; i < ssFilterData.Propeties.length; i++) {
                Description = Description + ", '" + ssFilterData.Propeties[i].item_text + "'";
            }
        }

        CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
            logger.detaillog("Site selection Logs inserted successfully..");
            JsonData.isSuccess = true;
            JsonData.LogData = data;
            JsonData.errormsg = "";
            res.json(JsonData);
        }, function (error) {
            logger.error("InsertSiteSelectionLog", "SiteSelection", error);
            JsonData.isSuccess = false;
            JsonData.LogData = null;
            JsonData.errormsg = error;
            res.json(JsonData);
        });
    } catch (err) {
        logger.error("InsertSiteSelectionLog", "SiteSelection", error);
        JsonData.isSuccess = false;
        JsonData.LogData = null;
        JsonData.errormsg = err;
        res.json(JsonData);
    }
}