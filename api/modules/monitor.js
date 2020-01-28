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

    for (const device of monitorDevices) {
      if (!_.get(this.workers, device.id)) {
        await this.startWorker(device.id, { device })
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

  async stopWorker(uniqueId) {
    debug(`Stopping worker (${uniqueId})`)
    this.workers[uniqueId].terminate()
  }

  async startWorker(uniqueId, workerData) {
    const worker = new Worker(path.join(__dirname, '..', 'workers', 'monitor.js'), { workerData })
    const workerDebug = require('debug')(`iothamster:monitor:worker:${uniqueId}`)
    workerDebug('Started')
    worker.on('message', msg => {
      workerDebug(msg)
    })
    worker.on('error', err => {
      workerDebug(`ERROR: ${err}`)
    })
    worker.on('exit', code => {
      workerDebug('Stopped')
      delete this.workers[uniqueId]
    })

    this.workers[uniqueId] = worker
  }
}

module.exports = Monitor
