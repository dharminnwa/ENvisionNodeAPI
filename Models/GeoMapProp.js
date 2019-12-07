'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'TempHtml5_GeoMapProp'
const tableName = 'TempHtml5_GeoMapProp'

const selectableProps = [
    'GeoMapPropID'
    , 'SldBody'
    , 'CqlFilter'
    , 'UserID'
    , 'ZoomData'
]

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
