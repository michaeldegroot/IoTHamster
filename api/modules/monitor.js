const debug = require('debug')('iothamster:monitor')
const { Worker } = require('worker_threads')
const path = require('path')
const crypto = require('crypto')
const _ = require('lodash')

class Monitor {
  constructor() {
    this.workers = {}
  }
  async start(modules) {
    this.modules = modules
    this.loop()
  }

  async loop() {
    const monitorDevices = await this.modules.database
      .knex('devices')
      .select('*')
      .where('monitor', '1')
    const demonitorDevices = await this.modules.database
      .knex('devices')
      .select('*')
      .where('monitor', '0')

    let delay = 0
    for (const device of monitorDevices) {
      if (!_.get(this.workers, device.id)) {
        delay = delay + 300
        setTimeout(async () => {
          await this.startWorker(device.id, { device })
        }, delay)
      }
    }

    for (const device of demonitorDevices) {
      if (_.get(this.workers, device.id)) {
        await this.stopWorker(device.id)
      }
    }

    setTimeout(async () => {
      await this.loop()
    }, 3000)
  }

  async stopWorker(id) {
    debug(`Stopping worker (${id})`)
    this.workers[id].terminate()
  }

  async startWorker(id, workerData) {
    const worker = new Worker(path.join(__dirname, '..', 'workers', 'monitor.js'), { workerData })
    const workerDebug = require('debug')(`iothamster:monitor:worker:${id}`)
    workerDebug('Started')
    worker.on('message', async msg => {
      workerDebug(msg)
      if (_.get(msg, 'available', 'present') !== 'present') {
        await this.modules.database
          .knex('devices')
          .update({
            pingStatus: msg.available,
            lastPing: Math.floor(Date.now() / 1000)
          })
          .where('id', id)
      }
    })
    worker.on('error', err => {
      workerDebug(`ERROR: ${err}`)
    })
    worker.on('exit', code => {
      workerDebug('Stopped')
      delete this.workers[id]
    })

    this.workers[id] = worker
  }
}

module.exports = Monitor
