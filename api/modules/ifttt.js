const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const debug = require('debug')('iothamster:ifttt')

class Ifttt {
  constructor() {}

  async start(modules) {
    this.modules = modules
    this.processed = []
    this.processes = {}

    setInterval(async () => {
      await this.process()
    }, 3000)
    await this.process()
  }

  async ifttDelete(id) {
    delete this.processes[id]
  }

  async ifttCreate(id, data) {
    this.processes[id] = { data }

    data.ifpayload = JSON.parse(data.ifpayload)
    data.thenpayload = JSON.parse(data.thenpayload)

    if (data.if === 'mqtt_publish') {
      const sub = await this.modules.mqtt.sub(data.ifpayload.topic)
      sub.on('message', async payload => {
        await this.then(data.then, data.thenpayload)
      })
    }
  }

  async then(event, data) {
    if (event === 'pushbullet') {
      await this.modules.pushbullet.sendNote(data.title, data.message)
    }
  }

  async process() {
    const items = await this.modules.database.knex('ifttt').select('*')

    const ids = []
    for (const item of items) {
      ids.push(item.id)
      if (this.processed.includes(item.id)) {
        continue
      }
      await this.ifttCreate(item.id, item)
      this.processed.push(item.id)
    }

    for (const deletedId of _.difference(this.processed, ids)) {
      await this.ifttDelete(deletedId)
    }

    return
  }
}

module.exports = Ifttt
