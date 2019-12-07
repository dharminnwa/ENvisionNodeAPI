'use strict'

const router = require('express').Router()
const {
    TestAddRoutes,
    GetPrivateLayerTreeView,
    GetPrivateLayerTreeView_node,
    GetPrivateGroupLayerTreeView_node,
    GetMyDataLibrary,
    RemoveMyDataLibrary,
    UpdateMyLayerData,
    UploadFiles,
    GetKmlData
} = require('../Controller/AddDataController')
const config = require('config');

var apiAddDataUrl = config.server.apiAddData;

router.route(apiAddDataUrl + '/')
    .get(TestAddRoutes)

router.route(apiAddDataUrl + '/GetPrivateLayerTreeViewData')
    .get(GetPrivateLayerTreeView)

router.route(apiAddDataUrl + '/GetPrivateLayerTreeView_node')
    .get(GetPrivateLayerTreeView_node)

router.route(apiAddDataUrl + '/GetPrivateGroupLayerTreeView_node')
    .get(GetPrivateGroupLayerTreeView_node)

router.route(apiAddDataUrl + '/MyDataLibrary')
    .get(GetMyDataLibrary)

router.route(apiAddDataUrl + '/RemoveLayerFromMyDataLibrary')
    .get(RemoveMyDataLibrary)

router.route(apiAddDataUrl + '/UpdateMyDataLayer')
    .post(UpdateMyLayerData)

router.route(apiAddDataUrl + '/UploadFiles')
    .post(UploadFiles)

router.route(apiAddDataUrl + '/GetKmlData')
    .get(GetKmlData)

module.exports = router
