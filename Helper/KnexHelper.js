'use strict'

// The guts of a model that uses Knexjs to store and retrieve data from a
// database using the provided `knex` instance. Custom functionality can be
// composed on top of this set of common guts.
//
// The idea is that these are the most-used types of functions that most/all
// "models" will want to have. They can be overriden/modified/extended if
// needed by composing a new object out of the one returned by this function ;)
module.exports = ({
  knex = {},
  name = 'name',
  tableName = 'tablename',
  selectableProps = [],
  timeout = 90000
}) => {

  // Method to Insert Data in to Table
  // Example 'Bookmark.save(param)'
  // param should contain all the fields that are to be inserted i.e. all required fields of table
  // param should have to match field name with Table Field name
  const save = props => {
    delete props.id // not allowed to set `id`

    return knex.insert(props)
      .returning(selectableProps)
      .into(tableName)
      .timeout(timeout)
  }

  //Method to Bulk Insert in to Table
  const bulkSave = rows => {
    for (var props in rows) {
      delete props.id // not allowed to set `id`
    }

    return knex.insert(rows)
      .returning(selectableProps)
      .into(tableName)
      .timeout(timeout)
  }

  // Method to Get All Data From Table
  // Example 'Bookmark.findAll()'
  const findAll = () => knex.select(selectableProps)
    .from(tableName)
    .timeout(timeout)

  // Method to Get Data From Table (with where condition)
  // Example 'Bookmark.find({ UserId: 'abc', IsDeleted: 0 })'
  // The Example will return Data from Bookmark Table where UserId is abc and IsDeleted is 0 (false)
  const find = filters => knex.select(selectableProps)
    .from(tableName)
    .where(filters)
    .timeout(timeout)

  // Same as `find` but only returns the first match if >1 are found.
  const findOne = filters => find(filters)
    .then(results => {
      if (results && results.length > 0)
        return results[0]
    })

  const bulkFind = (propName, values) => knex.select(selectableProps)
    .from(tableName)
    .whereIn(propName, values)
    .timeout(timeout)

  // Method to Update Existing Data in to Table
  // Example 'Bookmark.update({ BookmarkID: 45 }, { IsDeleted: 1 })'
  // First Param = for Condition so it will find row that has BookmarkID of 45
  // Second param = for New Values to set 
  // param should have to match field name with Table Field name
  const update = (id, props) => {
    delete props.id // not allowed to set `id`

    return knex.update(props)
      .from(tableName)
      .where(id)
      .returning(selectableProps)
      .timeout(timeout)
  }

  // Method to Delete row(s) Data from Table
  // Example 'Bookmark.hardDelete({ BookmarkID: 45 })'
  // param = for Condition so it will find row that has BookmarkID of 45 and will Delete it
  const hardDelete = filters => knex.del()
    .from(tableName)
    .where(filters)
    .timeout(timeout)

  const bulkHardDelete = (propName, values) => knex.del()
    .from(tableName)
    .whereIn(propName, values)
    .timeout(timeout)

  const raw = query => knex.raw(query)


  return {
    name,
    tableName,
    selectableProps,
    timeout,
    save,
    bulkSave,
    findAll,
    find,
    bulkFind,
    findOne,
    update,
    hardDelete,
    bulkHardDelete,
    raw
  }
}
