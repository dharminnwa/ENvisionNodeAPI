'use strict'

const router = require('express').Router()
const {
    TestRoot,
    TestLayer,
    MapSearchLayerCategory,
    MapSearchEnergyLayerLibrary,
    GetLayerTreeView,

    GetBaseMap_New,
    SaveMapSetting,
    GetUserDetails,
    InsertBaseMapLogs,
    GetBaseMap//,
    //GetEneryLayerTreeData
} = require('../Controller/MapSearchLayerController')
const config = require('config');

var apiLayerUrl = config.server.apiLayer;


router.route(apiLayerUrl + '/')
    .get(TestRoot)

router.route(apiLayerUrl + '/Test')
    .get(TestLayer)

router.route(apiLayerUrl + '/MapSearchLayerCategory')
    .get(MapSearchLayerCategory)

router.route(apiLayerUrl + '/MapSearchEnergyLayerLibrary')
    .get(MapSearchEnergyLayerLibrary)

router.route(apiLayerUrl + '/GetLayerTreeViewData')
    .get(GetLayerTreeView)

router.route(apiLayerUrl + '/GetBaseMapData')
    .get(GetBaseMap)

router.route(apiLayerUrl + '/GetBaseMapData_New')
    .get(GetBaseMap_New);

router.route(apiLayerUrl + '/SaveMapsetting')
    .get(SaveMapSetting)

router.route(apiLayerUrl + '/GetUserDetails')
    .get(GetUserDetails)

router.route(apiLayerUrl + '/InsertBaseMapLogs')
    .post(InsertBaseMapLogs)

//router.route(apiLayerUrl + '/GetEneryLayerTreeData')
//    .get(GetEneryLayerTreeData);


module.exports = router
