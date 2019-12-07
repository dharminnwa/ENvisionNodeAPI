'use strict'

const router = require('express').Router()
const {
    GetListofIndustryUpdates,
    GetSuggestivePipelineActivityResults,
    IndustryUpdatesFilterOptions,
    PipeLineTest,
    SearchPipelineActivities
} = require('../../Controller/IntelligenceController/PipelineActivityController')
const config = require('config');

var apiPipelineActivityUrl = config.server.IntelligenceSection.apipipelineActivity;

router.route(apiPipelineActivityUrl + '/')
    .get(PipeLineTest)

router.route(apiPipelineActivityUrl + '/IndustryUpdatesFilterOption')
    .get(IndustryUpdatesFilterOptions)

router.route(apiPipelineActivityUrl + '/GetSuggestivePipelineActivityResults')
    .get(GetSuggestivePipelineActivityResults)

router.route(apiPipelineActivityUrl + '/ListofIndustryUpdates')
    .get(GetListofIndustryUpdates)
    
router.route(apiPipelineActivityUrl + '/SearchPipelineActivities')
    .get(SearchPipelineActivities)

module.exports = router
