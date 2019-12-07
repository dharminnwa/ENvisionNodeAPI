'use strict'

const router = require('express').Router()
const {
    FeedbackTest,
    SendFeedbackTomai
} = require('../Controller/InfoBoxFeedbackController')
const config = require('config');

var apiFeedbackUrl = config.server.apiFeedback;

router.route(apiFeedbackUrl + '/')
    .get(FeedbackTest);

router.route(apiFeedbackUrl + '/SendFeedback')
    .post(SendFeedbackTomai);

module.exports = router