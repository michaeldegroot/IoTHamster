const https = require('https')
const http = require('http')
const express = require('express')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const debug = require('debug')('iothamster:express')

class Express {
  constructor() {
    this.app = express()
  }

  async start(modules) {
    // EXPRESS
    this.app.use(require('cors')())
    if (process.env.LOG_EXPRESS === 1) {
      this.app.use(require('morgan')('dev'))
    }
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(require('cookie-parser')())

    const mastersalt = fs.readFileSync(path.join(__dirname, '..', '.mastersalt'))
    this.app.use(
      require('express-session')({
        secret: await modules.cipherchain.hash(`${modules.cipherchain.secret}session`, mastersalt, 128),
        resave: true,
        saveUninitialized: true
      })
    )
    this.app.use(modules.passport.passport.initialize())
    this.app.use(modules.passport.passport.session())

    if (process.env.GENTOKEN == 1) {
      debug(modules.jwt.issue('web', '6years'))
      process.exit()
    }

    // MIDDLEWARE
    const override = !(0 | process.env.OVERRIDE_SSL_CHECK)
    if (!override) {
      debug('OVERRIDE_SSL_CHECK = 1')
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
      debug(err)
      res.json({ status: 500 })
    })

    // SSL
    const options = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'express', 'certificate.key')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'express', 'certificate.crt'))
    }

    // BIND ADDRESS
    const bindIp = process.env.BIND_ADDRESS ? process.env.BIND_ADDRESS : '0.0.0.0'

    // HTTP
    if (process.env.API_HTTP_PORT) {
      http.createServer(this.app).listen(process.env.API_HTTP_PORT, bindIp, () => {
        debug(`HTTP Listening on ${bindIp}:${process.env.API_HTTP_PORT}`)
      })
    }

    // HTTPS
    if (process.env.API_HTTPS_PORT) {
      https.createServer(options, this.app).listen(process.env.API_HTTPS_PORT, bindIp, () => {
        debug(`HTTPS Listening on ${bindIp}:${process.env.API_HTTPS_PORT}`)
      })
    }
  }
}

module.exports = Express
