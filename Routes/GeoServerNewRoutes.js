'use strict'

const router = require('express').Router()
const {
    GetGeoMapPost,
    SetImageLayerData,
    GetGeoMapNew,
    DeleteGeoImageTempProp,
    GetGeoDataNew,
    GetTotalCountListOfLayers,
    GetParcelsLayersDataCountForSiteSelection,
    GetFloodHazardTransparentLayer
} = require('../Controller/GeoServerNewController')
const config = require('config');

var apiGeoServerUrl = config.server.apiGeoServerNew;

router.route(apiGeoServerUrl + '/GetGeoMapPost')
    .post(GetGeoMapPost)

router.route(apiGeoServerUrl + '/SetImageLayerData')
    .post(SetImageLayerData)

router.route(apiGeoServerUrl + '/GetGeoMapNew')
    .get(GetGeoMapNew)

router.route(apiGeoServerUrl + '/DeleteGeoImageProp')
    .get(DeleteGeoImageTempProp)

router.route(apiGeoServerUrl + '/GetHazardImage')
    .get(GetFloodHazardTransparentLayer)

router.route(apiGeoServerUrl + '/GetGeoDataNew')
    .post(GetGeoDataNew)

router.route(apiGeoServerUrl + '/GetTotalCountListOfLayers')
    .post(GetTotalCountListOfLayers)

router.route(apiGeoServerUrl + '/GetParcelsLayersDataCountForSiteSelection')
    .post(GetParcelsLayersDataCountForSiteSelection)

module.exports = router
