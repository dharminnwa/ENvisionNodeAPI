var pg = require('pg')
var config = require('config');
var pool = new pg.Pool({
    database: config.db.dbPostgreSql.database,
    user: config.db.dbPostgreSql.user,
    password: config.db.dbPostgreSql.password,
    port: config.db.dbPostgreSql.port,
    connectionTimeoutMillis: 5000,
    host: config.db.dbPostgreSql.server,
    max: 10
});
module.exports = pool;