'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'CustomMap_DefaultCheckedLayer'
const tableName = 'CustomMaps_DefaultCheckedLayers'

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