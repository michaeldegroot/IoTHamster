exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('devices', function(t) {
      t.increments('id')
        .unsigned()
        .primary()
      t.text('createdAt').notNull()
      t.text('updatedAt').nullable()

      t.text('name').notNull()
      t.text('address').nullable()
    }),
    knex.schema.createTable('logs', function(t) {
      t.increments('id')
        .unsigned()
        .primary()
      t.text('createdAt').notNull()
      t.text('event').nullable()
      t.text('log').nullable()
    })
  ])
}

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('devices'), knex.schema.dropTable('logs')])
}
