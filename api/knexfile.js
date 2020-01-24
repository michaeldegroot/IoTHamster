const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
