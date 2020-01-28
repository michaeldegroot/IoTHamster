exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('devices', function(t) {
      t.increments('id')
        .unsigned()
        .primary()
      t.text('createdAt').notNull()
      t.text('updatedAt').nullable()

      t.text('name').notNull()
      t.text('address').notNull()
      t.text('monitor').notNull()
    }),
    knex.schema.createTable('logs', function(t) {
      t.increments('id')
        .unsigned()
        .primary()
      t.text('createdAt').notNull()
      t.text('event').notNull()
      t.text('log').notNull()
    })
  ])
}

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('devices'), knex.schema.dropTable('logs')])
}
