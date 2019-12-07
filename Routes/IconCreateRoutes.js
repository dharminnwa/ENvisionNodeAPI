'use strict'

const router = require('express').Router()
const {
    GetIconTest,
    GetIcon
} = require('../Controller/IconCreateController')
const config = require('config');

var apiIconUrl = config.server.apiIcon;

router.route(apiIconUrl + '/')
    .get(GetIconTest)

router.route(apiIconUrl + '/GetIcon')
    .get(GetIcon)

router.route('/icongenerate/get')
    .get(GetIcon)

module.exports = router
