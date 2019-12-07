'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'DataSet'
const tableName = 'DataSets'

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