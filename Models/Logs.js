'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'Log'
const tableName = 'Logs'

const selectableProps = '*'

module.exports = knex => {
    const model = createModel({
        knex,
        name,
        tableName,
        selectableProps
    })

    return {
        ...model
    }
}