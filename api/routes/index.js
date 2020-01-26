const express = require('express')
const router = express.Router()

router.get('/', function(req, res, next) {
  res.json({ status: 200, time: Math.floor(new Date() / 1000) })
})

module.exports = router
