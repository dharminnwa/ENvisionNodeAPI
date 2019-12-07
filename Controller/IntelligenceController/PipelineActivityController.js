var UtilityJs = require("../../Helper/Utility");
var logger = require("../../Helper/logs");
var MapSearchDataPipelineQueryparam = require("../../Helper/SqlQuery/IntelligenceSqlQuery/PipelineMapsearchQuery");
const { KnexRaw } = require('../../Models/ResearchDb');

const PipeLineTest = (req, res, next) => {
    logger.detaillog("Company Intelligence Call Controller successfully");
    res.json("PipeLineActivity Call successfully");
}

const IndustryUpdatesFilterOptions = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        GetAllCompanyOptions: {
            state: null,
            Commodities: null,
            Projectstatus: null
        },
        errormsg: '',
    }
    let queryPipelineState = MapSearchDataPipelineQueryparam.GetPipelineState();
    let queryGetPipelinecomodity = MapSearchDataPipelineQueryparam.GetPipelinecomodityQuery();
    let queryProjectStatus = MapSearchDataPipelineQueryparam.GetProjectStatus();
    KnexRaw.raw(queryPipelineState)
        .then(function (StateData) {
            JsonData._Issuccess = true;
            JsonData.GetAllCompanyOptions.state = StateData;

            KnexRaw.raw(queryGetPipelinecomodity)
                .then(function (CommodityData) {
                    JsonData.GetAllCompanyOptions.Commodities = CommodityData;

                    KnexRaw.raw(queryProjectStatus)
                        .then(function (StatusData) {
                            JsonData.GetAllCompanyOptions.Projectstatus = StatusData;
                            res.json(JsonData);
                        })
                        .catch(err => {
                            res.json(JsonData);
                            next(err);
                        })
                })
                .catch(err => {
                    res.json(JsonData);
                    next(err);
                })
        }).catch(next);
}

const GetSuggestivePipelineActivityResults = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        GetSuggestivePipelineActivityResults: null
    }
    let query = MapSearchDataPipelineQueryparam.GetPipelineSuggestionQuery();
    KnexRaw.raw(query)
        .then(function (resData) {
            JsonData._Issuccess = true;
            var _myDataList = resData;
            let SplitedProjectName = _myDataList[0].ProjectName.split('|');
            let SplitedHoldingCompany = _myDataList[0].HoldingCompany.split('|');
            let CompanyList = SplitedProjectName.concat(SplitedHoldingCompany);
            JsonData.GetSuggestivePipelineActivityResults = CompanyList;
            res.json(JsonData);
        }).catch(next);   
}

const GetListofIndustryUpdates = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ListofIndustryUpdates: null,
        errormsg: '',
    }
    let query = MapSearchDataPipelineQueryparam.GetAllPipelineActiviyList();
    KnexRaw.raw(query).then(function (ResData) {
        JsonData._Issuccess = true;
        JsonData.ListofIndustryUpdates = ResData;
        res.json(JsonData);
    }).catch(next);

}

const SearchPipelineActivities = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        SearchPipelineActivities: null,
        errormsg: '',
    }
    let Id = parseInt(req.query.ID);
    let query = MapSearchDataPipelineQueryparam.GetPipelineDetailsbasedonId(Id);
    let CompanyQuery = MapSearchDataPipelineQueryparam.GetCompnayDetialsBasedonPipelineId(Id);
    KnexRaw.raw(query).then(function (ResData) {
        JsonData._Issuccess = true;
        var PipeDetials = ResData[0];
        JsonData.SearchPipelineActivities = PipeDetials
        KnexRaw.raw(CompanyQuery).then(function (CompanyData) {
            let CompanyDetials = CompanyData;
            if (CompanyDetials.length > 0) {
                for (let i = 0; i < CompanyDetials.length; i++) {
                    if (PipeDetials.MRHoldingCo) {
                        PipeDetials["MRHoldingCo"] += "?" + CompanyDetials[i].MRHoldingCo;
                        PipeDetials["Hcity"] += "?" + CompanyDetials[i].Hcity;
                        PipeDetials["Hstate"] += "?" + CompanyDetials[i].Hstate;
                        PipeDetials["Hcountry"] += "?" + CompanyDetials[i].Hcountry;
                        PipeDetials["WebSite"] += "?" + CompanyDetials[i].WebSite;
                        PipeDetials["Hphone"] += "?" + CompanyDetials[i].Hphone;
                        PipeDetials["CompanyID"] += "?" + CompanyDetials[i].CompanyID;
                    } else {
                        PipeDetials["MRHoldingCo"] = CompanyDetials[i].MRHoldingCo;
                        PipeDetials["Hcity"] = CompanyDetials[i].Hcity;
                        PipeDetials["Hstate"] = CompanyDetials[i].Hstate;
                        PipeDetials["Hcountry"] = CompanyDetials[i].Hcountry;
                        PipeDetials["WebSite"] = CompanyDetials[i].WebSite;
                        PipeDetials["Hphone"] = CompanyDetials[i].Hphone;
                        PipeDetials["CompanyID"] = CompanyDetials[i].CompanyID;
                    }
                }

            }
            JsonData.SearchPipelineActivities = PipeDetials
            res.json(JsonData);
        }).catch(err => {
            res.json(JsonData);
            next(err);
        });

    }).catch(next);

}

module.exports = {
    PipeLineTest,
    IndustryUpdatesFilterOptions,
    GetSuggestivePipelineActivityResults,
    GetListofIndustryUpdates,
    SearchPipelineActivities
};