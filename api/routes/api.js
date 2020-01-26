const express = require('express')
const router = express.Router()

class Api {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/api', modules.passport.passport.authenticate('jwt'), this.routes())
  }

  routes() {
    router.get('/', function(req, res, next) {
      res.json({ status: 200, time: Math.floor(new Date() / 1000) })
    })

    router.post('/device/add', async function(req, res, next) {
      await this.modules.database.knex('devices').insert([
        {
          name: req.body.name,
          address: req.body.address,
          updatedAt: Date.now(),
          createdAt: Date.now()
        }
      ])
      res.json({ status: 200 })
    })

    router.post('/device/delete/:id', async function(req, res, next) {
      await this.modules.database
        .knex('devices')
        .where('id', req.params.id)
        .del()
      res.json({ status: 200 })
    })

    return router
  }
}

module.exports = Api
