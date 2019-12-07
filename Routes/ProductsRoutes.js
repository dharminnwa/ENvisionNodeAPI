'use strict'

const router = require('express').Router()
const {
    GetCategory
} = require('../Controller/ProductController')
const config = require('config');

var apiProductsUrl = config.server.apiProducts;

router.route(apiProductsUrl + '/')
    .get(GetCategory)


module.exports = router
