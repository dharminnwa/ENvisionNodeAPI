'use strict'
const router = require('express').Router()
const config = require('config');
const {
    GetAllPowerPlants,
    GetAllPowerPlantFilterOptions,
    GetSuggestivePowerplantResults,
    GetPowerPlantByID,
    GetPlantOperatorByID
} = require('../../Controller/IntelligenceController/PowerPlantsController')
var apiPowerPlantsUrl = config.server.IntelligenceSection.apiPowerPlants;

router.route(apiPowerPlantsUrl + '/GetAllPowerPlants')
    .get(GetAllPowerPlants);
router.route(apiPowerPlantsUrl + '/GetAllPowerPlantFilterOptions')
    .get(GetAllPowerPlantFilterOptions);
router.route(apiPowerPlantsUrl + '/GetSuggestivePowerplantResults')
.get(GetSuggestivePowerplantResults);
router.route(apiPowerPlantsUrl + '/GetPowerPlantByID')
.get(GetPowerPlantByID);
router.route(apiPowerPlantsUrl + '/GetPlantOperatorByID')
.get(GetPlantOperatorByID);

module.exports = router   