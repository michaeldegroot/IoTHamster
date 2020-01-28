const Knex = require('knex')
const debug = require('debug')('iothamster:database')

class Database {
  constructor() {}

  async start(modules) {
    this.modules = modules
    const knexfile = require('../knexfile')
    this.config = knexfile
    this.knex = Knex(this.config)

    debug('Migrating to latest')
    this.knex.migrate.latest()
    debug('Migrating done')

    // Reboot cipherchain because now knex is loaded
    await modules.cipherchain.bootCipherChain()
  }
}

module.exports = Database
