const Knex = require('knex')
const _ = require('lodash')
const debug = require('debug')('iothamster:database')
const tcpp = require('tcp-ping')

class Database {
  constructor() {
    this.connected = false
  }

  async start(modules) {
    this.modules = modules
    const knexfile = require('../knexfile')
    this.config = knexfile
    this.knex = Knex(this.config)

    let extra = ''
    if (_.get(knexfile, 'connection')) {
      extra = `at ${knexfile.connection.user}@${knexfile.connection.host}:${knexfile.connection.port}`
    }
    debug(`Connecting ${knexfile.client} ${extra}`)

    const doSeed = !(await this.knex.schema.hasTable('devices'))
    debug('Migrating to latest')
    await this.knex.migrate.latest()
    if (doSeed) {
      debug('Seeding')
      await this.knex.seed.run()
    }

    // Reboot cipherchain because now knex is loaded
    await modules.cipherchain.cipherchain.knexHook()

    await this.knex('logs').insert([
      {
        event: 'ApiServer',
        log: 'Started server',
        createdAt: Date.now()
      }
    ])
    this.connected = true

    setInterval(async () => {
      await this.ping()
    }, 5000)
  }

  async ping() {
    tcpp.probe(process.env.DATABASE_HOST, process.env.DATABASE_PORT, (err, available) => {
      this.connected = available
    })
  }
}

module.exports = Database
