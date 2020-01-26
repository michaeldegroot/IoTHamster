const https = require('https')
const http = require('http')
const express = require('express')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const debug = {}

class Express {
  constructor() {}

  async start(modules) {
    // EXPRESS
    const app = express()
    app.use(require('cors')())
    if (process.env.LOG_EXPRESS === 1) {
      app.use(require('morgan')('dev'))
    }
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(require('cookie-parser')())
    if (!process.env.SESSION_SECRET) {
      throw 'SESSION_SECRET not set in .env'
    }
    app.use(
      require('express-session')({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true
      })
    )
    app.use(modules.passport.passport.initialize())
    app.use(modules.passport.passport.session())

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
    const routeFiles = glob.sync(path.join(__dirname, '..', 'routes', '**/*.js'))
    const routes = {}
    for (const file of routeFiles) {
      const basename = path.basename(file, '.js')
      routes[basename] = require(file)
    }
    app.use('/', routes.index)
    app.use('/api', modules.passport.passport.authenticate('jwt'), routes.api)

    // 404
    app.use(function(req, res) {
      return res.json({ status: 404 })
    })

    // ERROR
    app.use(function(err, req, res) {
      console.log(err)
      res.json({ status: 500 })
    })

    const options = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.key')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.crt'))
    }

    debug.web = require('debug')('iothamster:web')
    const bindIp = process.env.BIND_ADDRESS ? process.env.BIND_ADDRESS : '0.0.0.0'
    if (process.env.API_HTTP_PORT) {
      http.createServer(app).listen(process.env.API_HTTP_PORT, bindIp, () => {
        debug.web(`HTTP Listening on ${bindIp}:${process.env.API_HTTP_PORT}`)
      })
    }
    if (process.env.API_HTTPS_PORT) {
      https.createServer(options, app).listen(process.env.API_HTTPS_PORT, bindIp, () => {
        debug.web(`HTTPS Listening on ${bindIp}:${process.env.API_HTTPS_PORT}`)
      })
    }
  }
}

module.exports = Express
