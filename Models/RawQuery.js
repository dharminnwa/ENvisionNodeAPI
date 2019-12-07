'use strict'

const createModel = require('../Helper/KnexHelper')

const name = 'KnexRaw'
const tableName = ''

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
