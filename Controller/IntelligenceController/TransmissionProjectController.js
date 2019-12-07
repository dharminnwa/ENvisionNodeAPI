const { KnexRaw } = require('../../Models/ResearchDb');
var TransmissionProjectQueryList = require('../../Helper/SqlQuery/IntelligenceSqlQuery/TransmissionQuery')
const request = require('request');
var logger = require("../../Helper/logs");
const GetProjectsData = (req, res, next) => {
    let ProjectsJsonData = {
        _Issuccess: false,
        TransmissionData: null,
        errormsg: ''
    }
    let Query = TransmissionProjectQueryList.GetAllTransmissionDataQuery();
    KnexRaw.raw(Query).then(function (resData) {
        ProjectsJsonData.TransmissionData = resData;
        ProjectsJsonData._Issuccess = true;
        res.json(ProjectsJsonData);
    }).catch(next);
}
const GetSuggestiveProjectDataResults = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        SuggestiveProjectData: null,
        errormsg: ''
    }
    let Query = TransmissionProjectQueryList.GetSuggestiveTransmissionProjectQuery();
    KnexRaw.raw(Query).then(function (resData) {
        var TransData = resData[0];
        let splitedData = TransData.SuggestiveData.split('@');
        JsonData.SuggestiveProjectData = splitedData;
        JsonData._Issuccess = true;
        res.json(JsonData);
    }).catch(next);
}
const GetAllProjectDataOptions = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        FilterOptions: {
            ProjectStatus: null,
            NERC: null,
            ServiceYear: null,
            VoltageType: null,
            ISORTO: null
        },
        errormsg: ''
    }
    let ProjectStatusQuery = TransmissionProjectQueryList.GetProjectstatusQuery();
    let NERCQuery = TransmissionProjectQueryList.GetNERCQuery()
    let ServiceYearQuery = TransmissionProjectQueryList.GetServiceYearQuery()
    let VoltageTypeQuery = TransmissionProjectQueryList.GetVoltageTypeQuery();
    let ISORTOQuery = TransmissionProjectQueryList.GetISORTOQuery();
    KnexRaw.raw(ProjectStatusQuery).then(function (ProjectStatusData) {
        JsonData._Issuccess = true;
        JsonData.FilterOptions.ProjectStatus = ProjectStatusData;
        KnexRaw.raw(NERCQuery).then(function (NERCData) {
            JsonData.FilterOptions.NERC = NERCData;
            KnexRaw.raw(ServiceYearQuery).then(function (ServiceYearData) {
                JsonData.FilterOptions.ServiceYear = ServiceYearData;
                KnexRaw.raw(VoltageTypeQuery).then(function (VoltageTypeData) {
                    JsonData.FilterOptions.VoltageType = VoltageTypeData;
                    KnexRaw.raw(ISORTOQuery).then(function (ISORTOData) {
                        JsonData.FilterOptions.ISORTO = ISORTOData;
                        res.json(JsonData);
                    });

                });

            });
        });

    }).catch(next);
}
const GetProjectDataById = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        TransmissionData: null,
        document: null,
        GeometryList: null,
        Image: null,
        errormsg: ''
    }
    let id = req.query.id;
    let Query = TransmissionProjectQueryList.GetProjectByID(id);
    let DocQuery = TransmissionProjectQueryList.GetTransmissionDocumentQuery(id);
    let GetGeometryQuery = TransmissionProjectQueryList.GetGeometryQuery(id);
    let URL = TransmissionProjectQueryList.GetgetBase64ImageURL(id);
    KnexRaw.raw(Query).then(function (resData) {
        JsonData._Issuccess = true;
        JsonData.TransmissionData = resData[0];
        KnexRaw.raw(DocQuery).then(function (DocData) {
            if (DocData.length > 0) {
                if (DocData[0].DocumentID)
                    JsonData.document = DocData[0];
            }
            KnexRaw.raw(GetGeometryQuery).then(function (Geometrydata) {
                if (Geometrydata.length > 0) {
                    for (let i = 0; i < Geometrydata.length; i++) {
                        Geometrydata[i].strokeWeight = parseFloat(Geometrydata[i].strokeWeight == "" ? "0.0" : Geometrydata[i].strokeWeight);
                        Geometrydata[i].geometry = Geometrydata[i].geometry.replace("\\", "0");
                    }
                    JsonData.GeometryList = Geometrydata;
                }
                request(URL, { json: true }, (error, responce, body) => {
                    if (error) {
                        logger.error("GetProjectDataById", "Transmission Project", error);
                    }
                    else {
                        JsonData.Image = responce.body.getBase64ImageResult;
                    }
                    res.json(JsonData);
                });
            }).catch(error => {
                res.json(JsonData);
            });
        }).catch(error => {
            res.json(JsonData);
        });
    }).catch(next);
}

module.exports = {
    GetProjectsData,
    GetSuggestiveProjectDataResults,
    GetAllProjectDataOptions,
    GetProjectDataById
};