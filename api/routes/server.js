const debug = require('debug')('iothamster:routes:server')
const express = require('express')
const router = express.Router()

class Api {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/server', modules.passport.passport.authenticate('jwt'), this.routes())
  }

  routes() {
    router.get('/restart', async (req, res, next) => {
      debug('Restart command executed')
      setTimeout(() => {
        process.exit()
      }, 100)
      res.json({ status: 200 })
    })
    router.get('/status', async (req, res, next) => {
      res.json({
        status: 200,
        data: {
          mqtt: this.modules.mqtt.connected,
          database: this.modules.database.connected,
          pushbullet: this.modules.pushbullet.connected
        }
      })
    })

    return router
  }
}

module.exports = Api
