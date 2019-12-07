'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'CustomMap'
const tableName = 'CustomMaps'

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