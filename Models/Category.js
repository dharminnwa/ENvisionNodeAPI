'use strict'

const createModel = require('../Helper/KnexHelper')

const name = 'Category'
const tableName = 'Category'

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
