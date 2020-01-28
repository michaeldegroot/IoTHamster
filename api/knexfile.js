module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
  },
  pool: {
    min: 1,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
