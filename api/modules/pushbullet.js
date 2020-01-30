const debug = require('debug')('iothamster:pushbullet')
const PushBullet = require('pushbullet')
const tcpp = require('tcp-ping')

class Pushbullet {
  constructor() {
    this.connected = false
  }

  async start(modules) {
    this.pusher = new PushBullet(process.env.PUSHBULLET_TOKEN)

    this.refreshData()

    setInterval(async () => {
      await this.ping()
    }, 10000)
  }

  async refreshData() {
    this.iden = await this.getIden()
    this.devices = await this.getDevices()
  }

  async getDevices() {
    return new Promise((resolve, reject) => {
      this.pusher.devices().then(response => {
        resolve(response.devices)
      })
    })
  }

  async sendNote(title, body) {
    return new Promise((resolve, reject) => {
      this.pusher.note(this.iden, title, body, (error, response) => {
        if (error) {
          this.connected = false
          return reject(error)
        }
        resolve(response)
      })
    })
  }

  async ping() {
    this.connected = true
    tcpp.probe('api.pushbullet.com', '443', (err, available) => {
      this.connected = available
    })
  }

  async getIden() {
    return new Promise((resolve, reject) => {
      this.pusher.me((error, response) => {
        if (error) {
          this.connected = false
          return reject(error)
        }
        resolve(response)
      })
    })
  }
}

module.exports = Pushbullet
