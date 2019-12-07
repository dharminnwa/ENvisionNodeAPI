'use strict'

const router = require('express').Router()
const {
    GetPropertyTypes,
    SiteSelectionTest,
    GetEnergyLayersIDS,
    InsertSiteSelectionLogs
} = require('../Controller/SiteSelectionController')
const config = require('config');

var apiSiteSelectionUrl = config.server.apiSiteSelection;

router.route(apiSiteSelectionUrl + '/')
    .get(SiteSelectionTest);

router.route(apiSiteSelectionUrl + '/GetPropertyTypes')
    .get(GetPropertyTypes)

router.route(apiSiteSelectionUrl + '/GetEnergyLayersIDS')
    .post(GetEnergyLayersIDS)

router.route(apiSiteSelectionUrl + '/InsertSiteSelectionLogs').post(InsertSiteSelectionLogs)

module.exports = router
