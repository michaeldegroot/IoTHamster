const express = require('express')
const database = require('../modules/database')
const router = express.Router()

router.get('/', function(req, res, next) {
  res.json({ status: 200, time: Math.floor(new Date() / 1000) })
})

router.post('/device/add', async function(req, res, next) {
  await database('devices').insert([
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
  await database('devices')
    .where('id', req.params.id)
    .del()
  res.json({ status: 200 })
})

module.exports = router
