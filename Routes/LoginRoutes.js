'use strict'

const router = require('express').Router()
const {
    UserLogin,
    UserLogout,
    ChangePassword,
    GetUserRoles
} = require('../Controller/LoginContoller')
const config = require('config');

var apiLoginUrl = config.server.apiLogin;

router.route(apiLoginUrl + '/LogInUser')
    .post(UserLogin)

router.route(apiLoginUrl + '/LogOut')
    .post(UserLogout)

router.route(apiLoginUrl + '/ChangePassowrd')
    .post(ChangePassword)

router.route(apiLoginUrl + '/GetUserRoles')
    .get(GetUserRoles)

module.exports = router
