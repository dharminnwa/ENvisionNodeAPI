var config = require('config');

var configDb = config.db.energymapitdb;
var researchDb = config.db.Researchdb;
var postgreDb = config.db.dbPostgreSql;

module.exports = {
    development: {
        energymapitdb: {
            client: configDb.client,
            connection: {
                host: configDb.server,
                user: configDb.user,
                password: configDb.password,
                database: configDb.database
            },
        },
        Researchdb: {
            client: researchDb.client,
            connection: {
                host: researchDb.server,
                user: researchDb.user,
                password: researchDb.password,
                database: researchDb.database,
                port: researchDb.port
            },
        },
        dbPostgreSql: {
            client: postgreDb.client,
            connection: {
                host: postgreDb.server,
                user: postgreDb.user,
                password: postgreDb.password,
                database: postgreDb.database
            },
        },
        dbPostgreParcelSql: { 
            client: postgreDb.client,
            connection: {
                host: postgreDb.server,
                user: postgreDb.user,
                password: postgreDb.password,
                database: postgreDb.parceldatabase
            },
        }
    },
    production: {
        client: configDb.client,
        connection: {
            host: configDb.server,
            user: configDb.user,
            password: configDb.password,
            database: configDb.database
        },
    }
    // Can Add Other Enviroments here
}