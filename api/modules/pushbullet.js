const debug = require('debug')('iothamster:pushbullet')
const PushBullet = require('pushbullet')

class Pushbullet {
  constructor() {}

  async start(modules) {
    this.pusher = new PushBullet(process.env.PUSHBULLET_TOKEN)
    this.iden = await this.getIden()
    this.devices = await this.devices()
    // console.log(this.devices)
  }

  async devices() {
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
          return reject(error)
        }
        resolve(response)
      })
    })
  }

  async getIden() {
    return new Promise((resolve, reject) => {
      this.pusher.me((error, response) => {
        if (error) {
          return reject(error)
        }
        resolve(response)
      })
    })
  }
}

module.exports = Pushbullet
