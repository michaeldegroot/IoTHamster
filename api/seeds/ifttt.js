exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('ifttt')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('ifttt').insert([
        {
          id: 1,
          createdAt: Math.floor(new Date() / 1000),
          ifpayload: '{"topic":"topic"}',
          thenpayload: '{"title": "yeet", "message": "beet"}',
          if: 'mqtt_publish',
          then: 'pushbullet'
        }
      ])
    })
}
