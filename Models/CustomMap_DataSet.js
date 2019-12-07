'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'CustomMap_DataSet'
const tableName = 'CustomMaps_DataSets'

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