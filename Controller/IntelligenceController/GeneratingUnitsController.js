const { KnexRaw } = require('../../Models/ResearchDb');
var GeneratingQueryList = require('../../Helper/SqlQuery/IntelligenceSqlQuery/GeneratingUnitsQuery')
const request = require('request');
var logger = require("../../Helper/logs");
var UtilityJs = require("../../Helper/Utility");
const GetGeneratingUnits = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        GetGeneratingUnitsData: null,
        errormsg: ""
    }
    let take=req.query.take;
    let skip=req.query.skip;
    let Query = GeneratingQueryList.GetAllGeneartingUnitsQuery(take,skip);
    KnexRaw.raw(Query).then(function (ResData) {
        JsonData._Issuccess = true;
        JsonData.GetGeneratingUnitsData = ResData;
        res.json(JsonData);
    }).catch(next);
};
const GetAllGeneratingUnitOptions=(req,res,next)=>{
    let JsonData = {
        _Issuccess: false,
        FilterOptionData: {
            sates: null,
            nerc: null,
            primeMover: null,
            statusDisplay: null,
            fuelType: null
        },
        errormsg: ""
    }
    let stateQuery = GeneratingQueryList.GetStateQuery();
    let nercQuery = GeneratingQueryList.GetNERCQuery();
    let primeMoverQuery = GeneratingQueryList.GetPrimeMover();
    let statusDisplayQuery = GeneratingQueryList.GetStatusQuery();
    let fuelTypeQuery = GeneratingQueryList.GetGeneratingUnitsFuelTypeCode();
    KnexRaw.raw(stateQuery).then(function (StateresData) {
        JsonData._Issuccess = true;
        JsonData.FilterOptionData.sates = StateresData;
        KnexRaw.raw(nercQuery).then(function (nercData) {
            JsonData.FilterOptionData.nerc = nercData;
            KnexRaw.raw(primeMoverQuery).then(function (primeMoverData) {
                JsonData.FilterOptionData.primeMover = primeMoverData;
                KnexRaw.raw(statusDisplayQuery).then(function (statusData) {
                    JsonData.FilterOptionData.statusDisplay = statusData;
                    KnexRaw.raw(fuelTypeQuery).then(function (fuelTyperesData) {
                        JsonData.FilterOptionData.fuelType = fuelTyperesData;
                        res.json(JsonData);
                    });
                });
            });
        });
    }).catch(next);
}
const GetSuggestiveGeneratingUnitsResults = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        SuggestiveeGeneratingUnitsData: null,
        errormsg: ""
    }
    let Query = GeneratingQueryList.GetPowerandComapanySuggestationQuery();
    KnexRaw.raw(Query).then(function (resData) {
        var Data = resData[0].SuggestivePowerplant;
        let SplitedData = Data.split('@');
        SplitedData= GetDistinctStringArray(SplitedData);
        JsonData._Issuccess = true;
        JsonData.SuggestiveeGeneratingUnitsData = SplitedData;
        res.json(JsonData);
    }).catch(next);
};
function GetDistinctStringArray(Stringarray) {
    try {
        Stringarray = Stringarray.filter(function (elem, pos) {
            if (elem) {
                return Stringarray.indexOf(elem) == pos;
            }
        });
        return Stringarray.sort();
    } catch (e) { return null; }

}
module.exports = {
    GetGeneratingUnits,
    GetAllGeneratingUnitOptions,
    GetSuggestiveGeneratingUnitsResults
}