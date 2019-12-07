'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'DrawTool'
const tableName = 'HTML_DrawTools'

const selectableProps = [
    'ShapeType'
    , 'SubType'
    , 'Name'
    , 'Description'
    , 'FontSize'
    , 'Color'
    , 'StrokeThickness'
    , 'BackColor'
    , 'Opacity'
    , 'ShapeGeo'
    , 'UserId'
    , 'Visible'
    , 'HTML_EditableLayerID'
    , 'IsDeleted'
    , 'LineStyle'
    , 'Radius'
];

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
