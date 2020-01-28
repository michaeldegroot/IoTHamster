const express = require('express')
const router = express.Router()

class Api {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/logs', modules.passport.passport.authenticate('jwt'), this.routes())
  }

  routes() {
    router.get('/', async (req, res, next) => {
      res.json({ status: 200, data: await this.modules.database.knex('logs').select('*') })
    })

    return router
  }
}

module.exports = Api
