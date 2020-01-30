module.exports = {
  development: {
    client: 'sqlite',
    useNullAsDefault: false,
    connection: {
      filename: __dirname + '/local.sqlite3'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      stub: './migrations/migration.stub'
    },
    debug: true
  },
  production: {
    client: 'sqlite',
    useNullAsDefault: false,
    connection: {
      filename: __dirname + '/local.sqlite3'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      stub: './migrations/migration.stub'
    }
    // // You could add instead of sqlite; mysql!
    // client: 'mysql2',
    // connection: {
    //   database: 'test',
    //   user: 'test',
    //   password: 'test'
    // },
    // migrations: {
    //   tableName: 'knex_migrations'
    // }
  }
}
