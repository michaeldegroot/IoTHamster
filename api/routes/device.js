const express = require('express')
const router = express.Router()

class Api {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/device', modules.passport.passport.authenticate('jwt'), this.routes())
  }

  routes() {
    router.get('/', async (req, res, next) => {
      res.json({ status: 200, data: await this.modules.database.knex('devices').select('*') })
    })

    router.post('/add', async (req, res, next) => {
      await this.modules.database.knex('devices').insert([
        {
          name: req.body.name,
          address: req.body.address,
          updatedAt: Date.now(),
          createdAt: Date.now(),
          lastPing: '',
          pingStatus: '',
          monitor: true
        }
      ])
      res.json({ status: 200 })
    })

    router.post('/delete/:id', async (req, res, next) => {
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
