'use strict'

const router = require('express').Router()
const {
    GlobaMapSearchEnergyLayerLibrary,
    SaveDatasetsValues
} = require('../Controller/GlobalSearchController')
const config = require('config');

var apiGlobalSearchUrl = config.server.apiGlobalSearch;

router.route(apiGlobalSearchUrl + '/GetglobalSearchEnergylayer')
    .get(GlobaMapSearchEnergyLayerLibrary);
router.route(apiGlobalSearchUrl + '/SaveDatasetsValues')
    .post(SaveDatasetsValues);

module.exports = router
