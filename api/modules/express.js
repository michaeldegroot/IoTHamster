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
    this.app = express()
    this.app.use(require('cors')())
    if (process.env.LOG_EXPRESS === 1) {
      this.app.use(require('morgan')('dev'))
    }
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(require('cookie-parser')())
    if (!process.env.SESSION_SECRET) {
      throw 'SESSION_SECRET not set in .env'
    }
    this.app.use(
      require('express-session')({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true
      })
    )
    this.app.use(modules.passport.passport.initialize())
    this.app.use(modules.passport.passport.session())

    // MIDDLEWARE
    debug.middleware = require('debug')('iothamster:middleware')
    const override = !(0 | process.env.OVERRIDE_SSL_CHECK)
    if (!override) {
      debug.middleware('OVERRIDE_SSL_CHECK = 1')
    }
    this.app.use((req, res, next) => {
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

    for (const file of routeFiles) {
      const basename = path.basename(file, '.js')
      const Class = routes[basename]
      routes[basename] = new Class(modules)
    }

    // 404
    this.app.use(function(req, res) {
      return res.json({ status: 404 })
    })

    // ERROR
    this.app.use(function(err, req, res) {
      console.log(err)
      res.json({ status: 500 })
    })

    // SSL
    const options = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.key')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'certificate.crt'))
    }

    // BIND ADDRESS
    debug.web = require('debug')('iothamster:web')
    const bindIp = process.env.BIND_ADDRESS ? process.env.BIND_ADDRESS : '0.0.0.0'

    // HTTP
    if (process.env.API_HTTP_PORT) {
      http.createServer(this.app).listen(process.env.API_HTTP_PORT, bindIp, () => {
        debug.web(`HTTP Listening on ${bindIp}:${process.env.API_HTTP_PORT}`)
      })
    }

    // HTTPS
    if (process.env.API_HTTPS_PORT) {
      https.createServer(options, this.app).listen(process.env.API_HTTPS_PORT, bindIp, () => {
        debug.web(`HTTPS Listening on ${bindIp}:${process.env.API_HTTPS_PORT}`)
      })
    }
  }
}

module.exports = Express
