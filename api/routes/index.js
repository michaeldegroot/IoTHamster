const express = require('express')
const router = express.Router()

class Index {
  constructor(modules) {
    this.modules = modules
    modules.express.app.use('/', this.routes())
  }

  routes() {
    router.get('/', function(req, res, next) {
      res.json({ status: 200, time: Math.floor(new Date() / 1000) })
    })

    return router
  }
}

module.exports = Index
