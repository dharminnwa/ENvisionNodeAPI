var sql = require("mssql");
var config = require('config');
var Researchdb = function () {
    var Researchconn = new sql.ConnectionPool({
        user: config.db.Researchdb.user,
        password: config.db.Researchdb.password,
        server: config.db.Researchdb.server,
        database: config.db.Researchdb.database,
        ConnectionPool: 10
    });
    return Researchconn;
};
module.exports = Researchdb;