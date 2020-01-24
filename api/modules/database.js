const CipherChain = require('cipher-chain')
const Knex = require('knex')
const fs = require('fs')
const keys = JSON.parse(fs.readFileSync('.keyfile'))
const path = require('path')
const debug = require('debug')('iothamster:database')
const dotenv = require('dotenv')

debug('Starting')
const knex = Knex({
  log: {
    warn(message) {
      require('debug')('iothamster:database:knex:warn')(message)
    },
    error(message) {
      require('debug')('iothamster:database:knex:error')(message)
    },
    deprecate(message) {
      require('debug')('iothamster:database:knex:deprecate')(message)
    },
    debug(message) {
      require('debug')('iothamster:database:knex:debug')(message)
    }
  },
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
  }
})

debug('Migrating to latest')
knex.migrate.latest()
debug('Migrating done')

let cipherchain
const bootCipherChain = async () => {
  debug('Spinning up cipher-chain')
  cipherchain = await new CipherChain({
    secret: [keys.a, keys.b],
    chain: ['aes-256-gcm', 'camellia-256-cbc'],
    knex: knex,
    compressData: false,
    kdf: {
      use: 'argon2',
      saltLength: 8,
      options: {
        argon2: {
          memoryCost: 1024 * 8,
          timeCost: 4
        }
      }
    }
  })
}

bootCipherChain()
debug('Ready')

module.exports = knex
