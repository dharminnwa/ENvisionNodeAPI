'use strict'

const router = require('express').Router()
const {
    TestGeoServer,
    GetInfoBoxData,
    GetPrivateLayerData,
    GetLayerFeatureType,
    GetDatabasedOnPropertyName,
    GetExportFeatureData,
    GetGeoData,
    GetGeoMap,
    GetBasemap,
    GetGeoMapTest,
    GetUniqueData
} = require('../Controller/GeoServerController')
const config = require('config');

var apiGeoServerUrl = config.server.apiGeoServer;

router.route(apiGeoServerUrl + '/')
    .get(TestGeoServer)

router.route(apiGeoServerUrl + '/GetInfoboxData')
    .post(GetInfoBoxData)

router.route(apiGeoServerUrl + '/GetPrivateLayerData')
    .post(GetPrivateLayerData)

router.route(apiGeoServerUrl + '/GetLayerFeaturetype')
    .post(GetLayerFeatureType)

router.route(apiGeoServerUrl + '/GetDatabasedonPropertyname')
    .post(GetDatabasedOnPropertyName)

router.route(apiGeoServerUrl + '/GetExportFeatureData')
    .post(GetExportFeatureData)

router.route(apiGeoServerUrl + '/GetGeoData')
    .post(GetGeoData)

router.route(apiGeoServerUrl + '/GetGeomap')
    .get(GetGeoMap)

router.route(apiGeoServerUrl + '/GetBasemap')
    .get(GetBasemap)

router.route(apiGeoServerUrl + '/GetGeomapTest')
    .get(GetGeoMapTest);
router.route(apiGeoServerUrl + '/GetUniqueData')
    .get(GetUniqueData);

module.exports = router
