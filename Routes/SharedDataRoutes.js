'use strict'

const router = require('express').Router()
const {
    TestSharedDataRoutes,
    GetSharedData
} = require('../Controller/SharedDataController')

const config = require('config');

var apiSharedDataUrl = config.server.apiSharedData;

router.route(apiSharedDataUrl + '/')
    .get(TestSharedDataRoutes)

router.route(apiSharedDataUrl + '/GetSharedData')
    .get(GetSharedData)

module.exports = router
