'use strict'

const router = require('express').Router()
const {
    ToolsTestCall,
    GetBookMarks,
    SaveBookmark,
    DeleteBookmark,
    GetMapsByUserID
} = require('../Controller/ToolsController')
const config = require('config');

var apiToolUrl = config.server.apiTool;

router.route(apiToolUrl + '/')
    .get(ToolsTestCall);

router.route(apiToolUrl + '/GetAllBookMarksByUser')
    .get(GetBookMarks);

router.route(apiToolUrl + '/SaveBookMark')
    .post(SaveBookmark);

router.route(apiToolUrl + '/DeleteBookmark')
    .get(DeleteBookmark);
    
router.route(apiToolUrl + '/GetMapsByUserID')
    .get(GetMapsByUserID);


module.exports = router
