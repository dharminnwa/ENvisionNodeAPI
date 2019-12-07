'use strict'

const config = require('config');
const env = config.enviroment || 'development';
const connection = require('../Connection/connectKnex');
const db = connection[env].dbPostgreParcelSql;
const knex = require('knex')(db);

module.exports = knex
