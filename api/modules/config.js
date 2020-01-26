const crypto = require('crypto')
const _ = require('lodash')
const path = require('path')
const prompts = require('prompts')
const fs = require('fs')

class Config {
  constructor() {
    this.configFile = path.join(__dirname, '..', '.config')
    this.config = {}
    this.defaultConfig = {
      JWT_SECRET: crypto.randomBytes(128).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(128).toString('hex'),
      API_HTTP_PORT: 80,
      API_HTTPS_PORT: 443,
      OVERRIDE_SSL_CHECK: 0,
      LOG_EXPRESS: 0,
      BIND_ADDRESS: '127.0.0.1',
      ENCRYPTION_AT_REST: 1,
      DATABASE_HOST: 'localhost',
      DATABASE_USER: 'username',
      DATABASE_PASSWORD: 'password',
      DATABASE_DATABASE: 'database'
    }
  }

  async askValues(values) {
    const returnVals = values
    for (const val in values) {
      const response = await prompts({
        type: 'text',
        name: val,
        initial: String(values[val]),
        message: `${val}: `
      })
      returnVals[val] = response[val]
    }

    return returnVals
  }

  async readConfig() {
    let config = JSON.stringify({})
    try {
      config = await this.modules.cipherchain.cipherchain.decrypt(fs.readFileSync(this.configFile, 'utf-8'))
    } catch (e) {
      if (e.message === 'HMAC verification failed') {
        const newName = path.join(__dirname, '..', '.config.bak')
        const oldName = path.join(__dirname, '..', '.config')
        if (fs.existsSync(newName)) {
          throw `${newName} exists, please ensure that you don't need the file and delete it manually`
        }
        fs.renameSync(oldName, newName)
        throw '.config is corrupt, renamed'
      }
      console.log(e.message)
    }
    this.config = JSON.parse(config)

    for (const key in this.config) {
      process.env[key] = this.config[key]
    }

    return this.config
  }

  async removeConfig() {
    return fs.unlinkSync(this.configFile)
  }

  async updateConfig(newConfig) {
    let oldConfig = {}
    try {
      oldConfig = await this.modules.cipherchain.cipherchain.decrypt(fs.readFileSync(this.configFile, 'utf-8'))
    } catch (e) {}
    try {
      oldConfig = JSON.parse(oldConfig)
    } catch (e) {}
    const writeConfig = _.merge({}, oldConfig, newConfig)
    const encrypted = await this.modules.cipherchain.cipherchain.encrypt(JSON.stringify(writeConfig))
    fs.writeFileSync(this.configFile, encrypted)
  }

  async start(modules) {
    this.modules = modules
    if (!fs.existsSync(this.configFile)) {
      this.defaultConfig = await this.askValues(this.defaultConfig)
      await this.updateConfig(this.defaultConfig)
    }

    await this.readConfig()
  }
}

module.exports = Config
