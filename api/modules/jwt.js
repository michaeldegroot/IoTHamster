const jsonwebtoken = require('jsonwebtoken')

class Jwt {
  constructor() {}

  async start() {}

  sign(data, opts) {
    return jsonwebtoken.sign(data, process.env.JWT_SECRET, opts)
  }

  verify(token) {
    return jsonwebtoken.verify(token, process.env.JWT_SECRET)
  }

  issue(deviceName, expire = '7days') {
    return jsonwebtoken.sign({ device: deviceName }, process.env.JWT_SECRET, {
      expiresIn: expire
    })
  }
}

module.exports = Jwt
