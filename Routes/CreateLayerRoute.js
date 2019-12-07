'use strict'

const router = require('express').Router()
const {
    GetPipelineWizardData,
    GetRailWizardData,
    TestCreateLayer,
    SaveLayer
} = require('../Controller/CreateLayerController')
const config = require('config');

var apiCreateLayerUrl = config.server.apiCreateLayer;

router.route(apiCreateLayerUrl + '/')
    .get(TestCreateLayer)

router.route(apiCreateLayerUrl + '/GetPipelineWizardData')
    .get(GetPipelineWizardData)

router.route(apiCreateLayerUrl + '/GetRailWizardData')
    .get(GetRailWizardData)

router.route(apiCreateLayerUrl + '/SaveLayer')
    .post(SaveLayer)


module.exports = router
