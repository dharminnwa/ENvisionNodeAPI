'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'InfoboxNotes'
const tableName = 'EnergyLayerNotesByUser'

const selectableProps = [
    'Id'
      ,'EnergyLayerId'
      ,'EnergyLayerRecordId'
      ,'UserId'
      ,'NoteLabel'
      ,'NoteValue'
      ,'ClickBound'
      ,'Created'
      ,'IsPublic'
      ,'IsDeleted'
      ,'EnergyLayerRecordLabel'
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
