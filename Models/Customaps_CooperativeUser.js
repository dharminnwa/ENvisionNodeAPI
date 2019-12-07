'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'CustomMaps_CooperativeUser'
const tableName = 'CustomMaps_CooperativeUsers'

const selectableProps = "*";

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
