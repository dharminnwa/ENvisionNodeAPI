'use strict'

const router = require('express').Router()
const {
    SaveLayerStyles,
    SaveCustomSymbols,
    GetExternalIcon,
    DeleteExternalSysmbols,
    SavePrivateLayerStyles
} = require('../Controller/LayerStyleController')
const config = require('config');

var apiLayerStyleUrl = config.server.apiLayerStyle;

router.route(apiLayerStyleUrl + '/SaveLayerStyles')
    .post(SaveLayerStyles)

router.route(apiLayerStyleUrl + '/SaveCustomSymbols')
    .post(SaveCustomSymbols)

router.route(apiLayerStyleUrl + '/GetExternalIcon')
    .get(GetExternalIcon)

router.route(apiLayerStyleUrl + '/DeleteExternalSysmbols')
    .get(DeleteExternalSysmbols)

router.route(apiLayerStyleUrl + '/SavePrivateLayerStyles')
    .post(SavePrivateLayerStyles)

module.exports = router
