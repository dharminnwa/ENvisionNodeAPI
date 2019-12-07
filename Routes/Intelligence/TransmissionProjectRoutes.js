'use strict'
const router = require('express').Router()
const config = require('config');
const {
    GetProjectsData,
    GetSuggestiveProjectDataResults,
    GetAllProjectDataOptions,
    GetProjectDataById
} = require('../../Controller/IntelligenceController/TransmissionProjectController')
var apiTransmissionProjectUrl = config.server.IntelligenceSection.apiTransmissionProject;

router.route(apiTransmissionProjectUrl + '/GetProjectsData')
    .get(GetProjectsData);

router.route(apiTransmissionProjectUrl + '/GetSuggestiveProjectDataResults')
    .get(GetSuggestiveProjectDataResults);

router.route(apiTransmissionProjectUrl + '/GetAllProjectDataOptions')
    .get(GetAllProjectDataOptions);

router.route(apiTransmissionProjectUrl + '/GetProjectDataById')
    .get(GetProjectDataById);


module.exports = router    
