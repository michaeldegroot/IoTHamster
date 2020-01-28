const jsonwebtoken = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('iothamster:jwt')

class Jwt {
  constructor() {}

  async start(modules) {
    const mastersalt = fs.readFileSync(path.join(__dirname, '..', '.mastersalt'))
    this.secret = await modules.cipherchain.hash(`${modules.cipherchain.secret}jwt`, mastersalt, 128)
  }

  sign(data, opts) {
    return jsonwebtoken.sign(data, this.secret, opts)
  }

  verify(token) {
    return jsonwebtoken.verify(token, this.secret)
  }

  issue(deviceName, expire = '7days') {
    return this.sign(
      { device: deviceName },
      {
        expiresIn: expire
      }
    )
  }
}

module.exports = Jwt
