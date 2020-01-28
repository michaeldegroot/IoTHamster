const debug = require('debug')('iothamster')
const _ = require('lodash')

class IoTHamster {
  constructor() {
    const modules = ['masterkey', 'cipherchain', 'config', 'jwt', 'database', 'passport', 'express', 'mqtt', 'monitor']
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
    for (const i in this.modules) {
      const module = this.modules[i]
      if (!_.get(module, 'start')) {
        throw `Need start method in ${module.__name__}`
      }
      await module.start(this.modules)
    }

    return true
  }
}

module.exports = IoTHamster
