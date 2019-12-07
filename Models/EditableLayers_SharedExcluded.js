'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'EditableLayers_SharedExcluded'
const tableName = 'HTML_EditableLayers_SharedExcluded'

const selectableProps = [
    'ID'
    , 'HTML_EditableLayerID'
    , 'UserGuid'
    , 'IsDeleted'
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
