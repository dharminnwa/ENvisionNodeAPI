'use strict'

const router = require('express').Router()
const {
    TestMyMapRoutes,
    SaveMyMap,
    CheckMapName,
    UpdateMyMap,
    DeleteMyMap,
    GetMyMapById,
    GetGUIDByDataSets,
    SaveLayerGridFilters,
    GetListOfCompnayUserList,
    SaveSharedmymap,
    InsertMyMapLogs,
    InsertMyMapChangedLogs
} = require('../Controller/MyMapController')
const config = require('config');
var apiMyMapUrl = config.server.apiMyMap;

router.route(apiMyMapUrl + '/')
    .get(TestMyMapRoutes)

router.route(apiMyMapUrl + '/SaveMyMap')
    .post(SaveMyMap)

router.route(apiMyMapUrl + '/CheckMapName')
    .get(CheckMapName)

router.route(apiMyMapUrl + '/UpdateMyMap')
    .post(UpdateMyMap)

router.route(apiMyMapUrl + '/DeleteMyMap')
    .get(DeleteMyMap)

router.route(apiMyMapUrl + '/GetMyMapById')
    .get(GetMyMapById)

router.route(apiMyMapUrl + '/GetGUIDByDataSets')
    .get(GetGUIDByDataSets);

router.route(apiMyMapUrl + '/SaveLayerGridFilters')
    .post(SaveLayerGridFilters);

router.route(apiMyMapUrl + '/GetListOfCompnayUserList')
    .get(GetListOfCompnayUserList);

router.route(apiMyMapUrl + '/SaveSharedmymap')
    .post(SaveSharedmymap)

router.route(apiMyMapUrl + '/InsertMyMapLogs').post(InsertMyMapLogs)

router.route(apiMyMapUrl + '/InsertMyMapChangedLogs').post(InsertMyMapChangedLogs)

module.exports = router
