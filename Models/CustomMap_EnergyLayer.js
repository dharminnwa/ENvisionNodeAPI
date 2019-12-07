'use strict'

const createModel = require('../Helper/KnexHelper');
const name = 'CustomMap_EnergyLayer'
const tableName = 'CustomMaps_EnergyLayers'

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