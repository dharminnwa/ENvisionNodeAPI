'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'EditableLayer'
const tableName = 'HTML_EditableLayers'

const selectableProps = [
    'EditableLayerID'
    , 'Name'
    , 'Description'
    , 'UserGuid'
    , 'CreatedTime'
    , 'IsDeleted'
    , 'isShared'
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
