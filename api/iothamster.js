const debug = require('debug')('iothamster')

class IoTHamster {
  constructor() {
    const modules = ['masterkey', 'cipherchain', 'config', 'jwt', 'database', 'passport', 'express']
    this.modules = {}
    debug(`loading ${modules.length} modules`)
    for (const module of modules) {
      const required = require(`./modules/${module}`)
      this.modules[module] = new required()
    }

    this.start()
  }

  async start() {
    await this.startModules()
  }

  async startModules() {
    debug(`starting ${Object.keys(this.modules).length} modules`)
    for (const module in this.modules) {
      await this.modules[module].start(this.modules)
    }

    return true
  }
}

module.exports = IoTHamster
