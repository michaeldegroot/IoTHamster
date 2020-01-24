const crypto = require('crypto')
const https = require('https')
const http = require('http')
const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const passport = require('passport')
const debug = {}

// EXPRESS
const port = process.env.API_PORT
const app = express()
app.use(cors())
if (process.env.LOG_EXPRESS == 1) {
  app.use(logger('dev'))
}
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// MIDDLEWARE
debug.middleware = require('debug')('iothamster:middleware')
const override = !(0 | process.env.OVERRIDE_SSL_CHECK)
if (!override) {
  debug.middleware('OVERRIDE_SSL_CHECK = 1')
}
app.use((req, res, next) => {
  if (!req.connection.encrypted && override) {
    return res.json({ status: 405 })
  }
  next()
})

// ROUTING
const routes = {
  api: require('../routes/api'),
  index: require('../routes/index')
}
app.use('/', routes.index)
app.use('/api', passport.authenticate('jwt', { session: false }), routes.api)

// 404
app.use(function(req, res, next) {
  return res.json({ status: 404 })
  next()
})

// ERROR
app.use(function(err, req, res, next) {
  if (req.app.get('env') === 'development') {
    console.error(err.message)
  }
  res.json({ status: 500 })
})

const options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.key')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.crt'))
}

debug.web = require('debug')('iothamster:web')
http.createServer(app).listen(process.env.API_HTTP_PORT)
debug.web(`HTTP Listening on ${process.env.API_HTTP_PORT}`)
https.createServer(options, app).listen(process.env.API_HTTPS_PORT)
debug.web(`HTTPS Listening on ${process.env.API_HTTPS_PORT}`)
