'use strict'

const config = require('config');
const env = config.enviroment || 'development';
const connection = require('../Connection/connectKnex');
const db = connection[env].Researchdb;
const knex = require('knex')(db);
// knex.on('query', function( queryData ) {
//     console.log( queryData );
// });

module.exports = knex
