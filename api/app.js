const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
const crypto = require('crypto')

// DOTENV
const defaultDotEnv = `API_HTTP_PORT=80
API_HTTPS_PORT=443
SECRET=${crypto.randomBytes(128).toString('hex')}
OVERRIDE_SSL_CHECK=0
LOG_EXPRESS=1

DATABASE_HOST=localhost
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_DATABASE=database
`
const dotEnvFile = path.join(__dirname, '..', '.env')
if (!fs.existsSync(dotEnvFile)) {
  fs.writeFileSync(dotEnvFile, defaultDotEnv)
}
const envConfig = dotenv.parse(fs.readFileSync(dotEnvFile))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

// KEYFILE
if (!fs.existsSync('.keyfile')) {
  keys = {
    a: crypto.randomBytes(128).toString('hex'),
    b: crypto.randomBytes(128).toString('hex')
  }

  fs.writeFileSync('.keyfile', JSON.stringify(keys))
}

const jwt = require('./modules/jwt')
const database = require('./modules/database')
const passport = require('./modules/passport')
const express = require('./modules/express')
