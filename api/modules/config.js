const debug = require('debug')('iothamster:config')
const _ = require('lodash')
const path = require('path')
const prompts = require('prompts')
const fs = require('fs')

class Config {
  constructor() {
    this.configFile = path.join(__dirname, '..', '.config')
    this.config = {}
    this.defaultConfig = {
      API_HTTP_PORT: '80',
      API_HTTPS_PORT: '443',
      OVERRIDE_SSL_CHECK: '0',
      LOG_EXPRESS: '0',
      DEVICE_MONITOR_INTERVAL: '5000',
      BIND_ADDRESS: '127.0.0.1',
      ENCRYPTION_AT_REST: '1',
      DATABASE_HOST: 'localhost',
      DATABASE_USER: 'username',
      DATABASE_PASSWORD: 'password',
      DATABASE_DATABASE: 'database',
      MQTT_HOST: 'localhost',
      MQTT_USER: 'mqtt',
      MQTT_PASSWORD: 'mqtt',
      MQTT_TLS_METHOD: 'TLSv1_1_method',
      MQTT_REJECT_UNAUTHORIZED: '1'
    }
  }

  async askValues(values) {
    const returnVals = values
    for (const val in values) {
      const response = await prompts({
        type: typeof values[val] === 'string' ? 'text' : 'number',
        name: val,
        initial: values[val],
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

    try {
      this.config = JSON.parse(config)
    } catch (e) {
      fs.unlinkSync(this.configFile)
      console.log(e.message)
      throw '.config is corrupt, removed'
    }

    for (const key in this.config) {
      process.env[key] = this.config[key]
    }

    const newKeys = _.difference(Object.keys(this.defaultConfig), Object.keys(this.config))
    const delKeys = _.difference(Object.keys(this.config), Object.keys(this.defaultConfig))
    for (const newKey of newKeys) {
      debug(`inserting key ${newKey} = ${this.defaultConfig[newKey]}`)
      this.config[newKey] = this.defaultConfig[newKey]
    }

    for (const delKey of delKeys) {
      debug(`deleting key ${delKey} = ${this.config[delKey]}`)
      delete this.config[delKey]
    }
    if (delKeys.length >= 1 || newKeys.length >= 1) {
      await this.updateConfig(this.config, true)
      debug(`deleted ${delKeys.length} keys`)
      debug(`inserted ${newKeys.length} keys`)
      return await this.readConfig()
    }

    return this.config
  }

  async removeConfig() {
    return fs.unlinkSync(this.configFile)
  }

  async updateConfig(newConfig, force = false) {
    let oldConfig = {}

    if (fs.existsSync(this.configFile)) {
      try {
        oldConfig = await this.modules.cipherchain.cipherchain.decrypt(fs.readFileSync(this.configFile, 'utf-8'))
      } catch (e) {
        debug(`error decrypting: ${e}`)
      }
      try {
        oldConfig = JSON.parse(oldConfig)
      } catch (e) {
        debug(`error json parsing: ${e}`)
      }
    }
    let writeConfig = _.merge({}, oldConfig, newConfig)
    if (force) {
      writeConfig = newConfig
    }
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
