exports.up = function(knex) {
  return knex.schema.createTable('devices', function(t) {
    t.increments('id')
      .unsigned()
      .primary()
    t.dateTime('createdAt').notNull()
    t.dateTime('updatedAt').nullable()
    t.dateTime('deletedAt').nullable()

    t.string('name').notNull()
    t.text('address').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('devices')
}
