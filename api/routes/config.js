const express = require('express')
const router = express.Router()

class Api {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/config', modules.passport.passport.authenticate('jwt'), this.routes())
  }

  routes() {
    router.get('/', async (req, res, next) => {
      res.json({ status: 200, data: this.modules.config.config })
    })
    router.post('/update', async (req, res, next) => {
      await this.modules.config.updateConfig(req.body)
      await this.modules.config.readConfig()
      res.json({ status: 200, data: this.modules.config.config })
    })

    return router
  }
}

module.exports = Api
