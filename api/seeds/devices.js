exports.seed = function(knex) {
  return knex('devices')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('devices').insert([
        { id: 1, createdAt: Math.floor(new Date() / 1000), name: 'testDevice', address: '127.0.0.1:443', monitor: true }
      ])
    })
}
