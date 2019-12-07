var sql = require("mssql");
var config = require('config');
var connect = function () {
    var conn = new sql.ConnectionPool({
        user: config.db.energymapitdb.user,
        password: config.db.energymapitdb.password,
        server: config.db.energymapitdb.server,
        database: config.db.energymapitdb.database,
        ConnectionPool: 10
    });
    return conn;
};
module.exports = connect;

