'use strict'

const router = require('express').Router();
const {
    ParcelsTestCall,
    GetState,
    GetStateFromLineString
} = require('../Controller/ParcelDataController')
const config = require('config');

var apiParcelsUrl = config.server.apiParcels;

router.route(apiParcelsUrl + '/')
    .get(ParcelsTestCall);

router.route(apiParcelsUrl + '/GetState')
    .post(GetState);

router.route(apiParcelsUrl + '/GetStateFromLineString')
    .post(GetStateFromLineString);

module.exports = router
