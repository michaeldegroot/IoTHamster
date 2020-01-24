const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const jsonwebtoken = require('jsonwebtoken')
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '..', '.env')))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

const keys = JSON.parse(fs.readFileSync('.keyfile'))

const secret = process.env.SECRET
if (!secret) {
  throw 'SECRET not set in .env'
}

module.exports = {
  sign: (data, opts) => {
    return jsonwebtoken.sign(data, secret, opts)
  },
  verify: token => {
    return jsonwebtoken.verify(token, secret)
  },
  issue: (deviceName, expire = '7days') => {
    return jsonwebtoken.sign({ device: deviceName }, secret, {
      expiresIn: expire
    })
  },
  secret: secret,
  keys: keys
}
