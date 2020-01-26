const Knex = require('knex')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const debug = require('debug')('iothamster:database')

class Database {
  constructor() {}

  async start(modules) {
    this.knex = Knex({
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
    this.knex.migrate.latest()
    debug('Migrating done')

    // Reboot cipherchain because now knex is loaded
    await modules.cipherchain.bootCipherChain()
  }
}

module.exports = Database
