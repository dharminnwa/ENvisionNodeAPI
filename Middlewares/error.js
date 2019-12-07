'use strict'

const {
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    CONFLICT,
    NOT_FOUND,
    UNPROCESSABLE,
    GENERIC_ERROR,
    BAD_REQUEST_MESSAGE,
    UNAUTHORIZED_MESSAGE,
    FORBIDDEN_MESSAGE,
    CONFLICT_MESSAGE,
    NOT_FOUND_MESSAGE,
    UNPROCESSABLE_MESSAGE,
    GENERIC_ERROR_MESSAGE
} = require('../Helper/ErrorHelper')

var logger = require("../Helper/logs");

const unauthorized = (err, req, res, next) => {
    if (err.status !== UNAUTHORIZED) return next(err)

    let message = err.message || UNAUTHORIZED_MESSAGE;
    logger.knexError(message);
    res.status(UNAUTHORIZED).send({
        _Issuccess: false,
        errormsg: UNAUTHORIZED_MESSAGE
    })
}

const forbidden = (err, req, res, next) => {
    if (err.status !== FORBIDDEN) return next(err)

    let message = err.message || FORBIDDEN_MESSAGE;
    logger.knexError(message);
    res.status(FORBIDDEN).send({
        _Issuccess: false,
        errormsg: FORBIDDEN_MESSAGE
    })
}

const conflict = (err, req, res, next) => {
    if (err.status !== CONFLICT) return next(err)

    let message = err.message || CONFLICT_MESSAGE;
    logger.knexError(message);
    res.status(CONFLICT).send({
        _Issuccess: false,
        errormsg: CONFLICT_MESSAGE
    })
}

const badRequest = (err, req, res, next) => {
    if (err.status !== BAD_REQUEST) return next(err)

    let message = err.message || BAD_REQUEST_MESSAGE;
    logger.knexError(message);
    res.status(BAD_REQUEST).send({
        _Issuccess: false,
        errormsg: BAD_REQUEST_MESSAGE
    })
}

const unprocessable = (err, req, res, next) => {
    if (err.status !== UNPROCESSABLE) return next(err)

    let message = err.message || UNPROCESSABLE_MESSAGE;
    logger.knexError(message);
    res.status(UNPROCESSABLE).send({
        _Issuccess: false,
        errormsg: UNPROCESSABLE_MESSAGE
    })
}

// If there's nothing left to do after all this (and there's no error),
// return a 404 error.
const notFound = (err, req, res, next) => {
    if (err.status !== NOT_FOUND) return next(err)

    let message = err.message || NOT_FOUND_MESSAGE;
    logger.knexError(message);
    res.status(NOT_FOUND).send({
        _Issuccess: false,
        errormsg: NOT_FOUND_MESSAGE
    })
}

// If there's still an error at this point, return a generic 500 error.
const genericError = (err, req, res, next) => {
    let message = err.message || GENERIC_ERROR_MESSAGE;
    logger.knexError(message);
    res.status(GENERIC_ERROR).send({
        _Issuccess: false,
        errormsg: GENERIC_ERROR_MESSAGE
    })
}

// If there's nothing left to do after all this (and there's no error),
// return a 404 error.
const catchall = (req, res, next) => {
    let message = NOT_FOUND_MESSAGE;
    logger.knexError(message);
    res.status(NOT_FOUND).send({
        _Issuccess: false,
        errormsg: NOT_FOUND_MESSAGE
    })
}

const exportables = {
    unauthorized,
    forbidden,
    conflict,
    badRequest,
    unprocessable,
    genericError,
    notFound,
    catchall
}

// All exportables stored as an array (e.g., for including in Express app.use())
const all = Object.keys(exportables).map(key => exportables[key])

module.exports = {
    ...exportables,
    all
}
