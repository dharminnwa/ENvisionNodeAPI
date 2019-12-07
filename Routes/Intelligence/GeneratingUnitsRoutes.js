'use strict'
const router = require('express').Router();
const config = require('config');
const {
    GetAllGeneratingUnitOptions,
    GetSuggestiveGeneratingUnitsResults,
    GetGeneratingUnits
} = require('../../Controller/IntelligenceController/GeneratingUnitsController');

var apiPGeneratingUnitsUrl = config.server.IntelligenceSection.apiGeneratingUnits;

router.route(apiPGeneratingUnitsUrl + '/GetGeneratingUnits')
    .get(GetGeneratingUnits);

router.route(apiPGeneratingUnitsUrl + '/GetSuggestiveGeneratingUnitsResults')
    .get(GetSuggestiveGeneratingUnitsResults);

router.route(apiPGeneratingUnitsUrl + '/GetAllGeneratingUnitOptions')
.get(GetAllGeneratingUnitOptions);

module.exports = router   