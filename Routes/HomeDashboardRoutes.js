'use strict'
const router = require('express').Router()
const {
    GetAssetLookupData,
    HomeDashboardTest,
    GetParcelStates,
    GetWellsstate,
    GetTransProjects,
    GetPipelineActivities,
    GetFacilityData,
    GetStateBasedonComodity,
    GetCommodityBasedonStateandType,
    GetFactypeBasedonStateandCommodity,
    GetAllPipelineData,
    GetPiplelineDatabasedonFiltervalue,
    GetTypeandCommoditybasedonstate,
    GetPowerPlantDatabasedonFilter,
    GetSubstationDatabasedonfilter,
    GetTransmissionDatabasedonFilter
} = require('../Controller/HomeDashboradController')
const config = require('config');


var apiHomeDasboardURL = config.server.apiHomeDasboard;

router.route(apiHomeDasboardURL + '/')
    .get(HomeDashboardTest);

router.route(apiHomeDasboardURL + '/GetAssetLookupData')
    .get(GetAssetLookupData);

router.route(apiHomeDasboardURL + '/GetParcelStates')
    .get(GetParcelStates);
router.route(apiHomeDasboardURL + '/GetWellsstate')
    .get(GetWellsstate);
router.route(apiHomeDasboardURL + '/GetTransProjects')
    .get(GetTransProjects);
router.route(apiHomeDasboardURL + '/GetPipelineActivities')
    .get(GetPipelineActivities);

router.route(apiHomeDasboardURL + '/GetFacilityData')
    .get(GetFacilityData);

router.route(apiHomeDasboardURL + '/GetStateBasedonComodity')
    .get(GetStateBasedonComodity);

router.route(apiHomeDasboardURL + '/GetCommodityBasedonStateandType')
    .get(GetCommodityBasedonStateandType);

router.route(apiHomeDasboardURL + '/GetFactypeBasedonStateandCommodity')
    .get(GetFactypeBasedonStateandCommodity);

router.route(apiHomeDasboardURL + '/GetAllPipelineData')
    .get(GetAllPipelineData);

router.route(apiHomeDasboardURL + '/GetPiplelineDatabasedonFiltervalue')
    .get(GetPiplelineDatabasedonFiltervalue);

router.route(apiHomeDasboardURL + '/GetTypeandCommoditybasedonstate')
    .get(GetTypeandCommoditybasedonstate);

router.route(apiHomeDasboardURL + '/GetPowerPlantDatabasedonFilter')
    .get(GetPowerPlantDatabasedonFilter);

router.route(apiHomeDasboardURL + '/GetSubstationDatabasedonfilter')
    .get(GetSubstationDatabasedonfilter);

router.route(apiHomeDasboardURL + '/GetTransmissionDatabasedonFilter')
    .get(GetTransmissionDatabasedonFilter);



module.exports = router;


