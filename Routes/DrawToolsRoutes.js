'use strict'

const router = require('express').Router()
const {
    GetDrawTools,
    GetDrawToolsItems,
    DrawToolsTestCall,
    SaveEditableLayer,
    DeleteEditableLayer,
    DeleteSelectedDrawItem,
    UpdateDrawingLayer,
    GetSharedDrawLayers,
    DeleteSharedLayer
} = require('../Controller/DrawToolsController')
const config = require('config');

var apiToolUrl = config.server.apiDrawTools;

router.route(apiToolUrl + '/')
    .get(DrawToolsTestCall);

router.route(apiToolUrl + '/GetDrawTool')
    .get(GetDrawTools);

router.route(apiToolUrl + '/GetDrawToolItems')
    .get(GetDrawToolsItems);

router.route(apiToolUrl + '/DeleteDrawToolLayer')
    .get(DeleteEditableLayer);

router.route(apiToolUrl + '/DeleteDrawToolItem')
    .get(DeleteSelectedDrawItem);

router.route(apiToolUrl + '/SaveEditableLayer')
    .post(SaveEditableLayer);

router.route(apiToolUrl + '/UpdateEditableLayer')
    .post(UpdateDrawingLayer);

router.route(apiToolUrl + '/GetSharedLayers')
    .get(GetSharedDrawLayers);

router.route(apiToolUrl + '/DeleteSharedDrawToolItem')
    .post(DeleteSharedLayer);

module.exports = router
