'use strict'

const createModel = require('../Helper/KnexHelper');

const name = 'Bookmark'
const tableName = 'Bookmarks'

const selectableProps = [
    'BookmarkID',
    'Name',
    'UserId',
    'Latitude',
    'Longitude',
    'ZoomLevel',
    'Created'
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
