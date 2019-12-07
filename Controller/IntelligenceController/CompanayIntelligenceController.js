var express = require('express');
var router = express.Router();
var UtilityJs = require("../../Helper/Utility");
var logger = require("../../Helper/logs");
var MapSearchDataQueryparam = require("../../Helper/SqlQuery/IntelligenceSqlQuery/MapSearchQuery");
const request = require('request');
const { KnexRaw } = require('../../Models/ResearchDb');
const TestCompanyIntelligence = (req, res, next) => {
    logger.detaillog("Company Intelligence Call Controller successfully");
    res.json("Company Intelligence Call successfully");
}

const GetAllCompanyOptions = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        GetAllCompanyOptions: {
            state: null,
            BusinessLine: null,
            Commodities: null,
            Entities: null,
            EntityType: null
        },
        errormsg: '',
    }
    let stateQuery = MapSearchDataQueryparam.GetAllCompanyUsState();
    let BusinessLineQuery = MapSearchDataQueryparam.GetALLCompanyBusinessLine();
    let CommoditiesQuery = MapSearchDataQueryparam.GetallCommodity();
    let EntitiesQuery = MapSearchDataQueryparam.GetAllEntity();
    let EntityTypeQuery = MapSearchDataQueryparam.GetAllEntityType();
    KnexRaw.raw(stateQuery)
        .then(function (Statedata) {
            JsonData._Issuccess = true;
            JsonData.GetAllCompanyOptions.state = Statedata;
            KnexRaw.raw(BusinessLineQuery)
                .then(function (BusinessLinedata) {
                    JsonData.GetAllCompanyOptions.BusinessLine = BusinessLinedata;
                    KnexRaw.raw(CommoditiesQuery)
                        .then(function (CommoditiesData) {
                            JsonData.GetAllCompanyOptions.Commodities = CommoditiesData;
                            KnexRaw.raw(EntitiesQuery)
                                .then(function (EntitiesQData) {
                                    JsonData.GetAllCompanyOptions.Entities = EntitiesQData;
                                    KnexRaw.raw(EntityTypeQuery)
                                        .then(function (EntityTypeData) {
                                            JsonData.GetAllCompanyOptions.EntityType = EntityTypeData;
                                            res.json(JsonData);
                                        }).catch(next)
                                }).catch(next)
                        }).catch(next)
                }).catch(next)
        }).catch(next);
}

const GetSuggestiveCompanyNameResults = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        GetSuggestiveCompanyNameResults: null,
        errormsg: '',
    }
    let query = MapSearchDataQueryparam.GetAllCompanyName();
    KnexRaw.raw(query).then(function (ResData) {
        var _myDataList = ResData;
        let CompanyList = [];
        _myDataList.forEach(element => {
            CompanyList.push(element.CompanyName);
        });
        JsonData.GetSuggestiveCompanyNameResults = CompanyList;
        JsonData._Issuccess = true;
        UtilityJs.ReturnResult(JsonData, res);
    }).catch(next);
}

const GetAllCompnayList = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        CompanyList: null,
        errormsg: '',
    }
    let query = MapSearchDataQueryparam.GetAllCompanyProfile(req.query);
    KnexRaw.raw(query)
        .then(function (ResData) {
            JsonData.CompanyList = ResData;
            JsonData._Issuccess = true;
            res.json(JsonData);
        }).catch(next);
}

const CompanyDataSearchDataResult = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        TotalCount: 0,
        errormsg: '',
        FilterCompanyList: null,
    }
    let query = MapSearchDataQueryparam.GetCompanyDataSearchDataResult(req.body);
    UtilityJs.ResearchExecuteQuery(query)
        .then(function (Data) {
            var _myDataList = Data.recordset;
            JsonData.TotalCount = _myDataList.length;
            JsonData.FilterCompanyList = _myDataList;
            JsonData._Issuccess = true;
            UtilityJs.ReturnResult(JsonData, res);
        }).catch(function (error) {
            logger.error("CompanyDataSearchDataResult", "CompanyIntelligenceController", error.message);
            JsonData.errormsg = error.message;
            UtilityJs.ReturnResult(JsonData, res);
        });
}

const GetResult = (req, res, next) => {
    let Url = MapSearchDataQueryparam.GetResultURL(req.query.id, req.query.type);
    request(Url, { json: true }, (error, responce, body) => {
        if (error) {
            logger.error("Getresult", "CompanyIntelligenceController", error);
        }
        res.json(responce.body);
    });
}
//const GetJsonfiledata = (req, res, next) => {
//    const fs = require('fs');
//    let jsonData = {}
//    let filename = __dirname + "/IntelligenceJsonfiles/CompnayIntelligence.json";
//    fs.readFile(filename, 'utf-8', (err, data) => {
//        if (err) throw err

//        jsonData = JSON.parse(data)
//        res.json(jsonData);
//    });
//}

const GetFilteredCompanyList = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        CompanyList: null,
    }
    let filterString = req.query.filter;
    let query = MapSearchDataQueryparam.GetFilteredCompanyList(filterString);
    KnexRaw.raw(query)
        .then(function (ResData) {
            JsonData.CompanyList = ResData;
            JsonData._Issuccess = true;
            res.json(JsonData);
        }).catch(next);
}

module.exports = {
    TestCompanyIntelligence,
    GetAllCompanyOptions,
    GetSuggestiveCompanyNameResults,
    GetAllCompnayList,
    CompanyDataSearchDataResult,
    GetResult,
    //GetJsonfiledata,
    GetFilteredCompanyList
};