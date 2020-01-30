const mqtt = require('mqtt')
const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const debug = require('debug')('iothamster:mqtt')

const certificate = path.join(__dirname, '..', 'certs', 'mqtt', 'certificate.crt')

class Mqtt {
  constructor() {
    this.connected = false
    if (!fs.existsSync(certificate)) {
      throw new Error(`${certificate} does not exists`)
    }
  }

  async start(modules) {
    await this.connect()

    this.events = {}
  }

  async unsub(topic) {
    return new Promise((resolve, reject) => {
      delete this.events[topic]
      this.client.unsubscribe(topic, error => {
        if (error) {
          return reject(error)
        }
        debug('event UNSUB TOPIC')
      })

      return resolve(true)
    })
  }

  async sub(topic) {
    return new Promise((resolve, reject) => {
      this.events[topic] = new EventEmitter()
      this.client.subscribe(topic, error => {
        if (error) {
          return reject(error)
        }
        debug('event SUB TOPIC')
      })

      return resolve(this.events[topic])
    })
  }

  async connect() {
    debug(`Trying to connect to ${process.env.MQTT_HOST}`)
    this.client = mqtt.connect({
      host: process.env.MQTT_HOST,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      clientId: 'IoTHamster',
      keepalive: 5,
      clean: true,
      protocol: process.env.MQTT_PROTOCOL,
      rejectUnauthorized: !!+process.env.MQTT_REJECT_UNAUTHORIZED,
      secureProtocol: process.env.MQTT_TLS_METHOD,
      ca: fs.readFileSync(certificate),
      reconnectPeriod: 1000
    })

    this.client.on('connect', () => {
      this.connected = true
      debug('connect')
    })

    this.client.on('offline', () => {
      this.connected = false
      debug('offline')
    })

    this.client.on('reconnect', () => {
      this.connected = false
      debug('reconnect')
    })

    this.client.on('disconnect', () => {
      this.connected = false
      debug('disconnect')
    })

    this.client.on('error', error => {
      debug('error')
      console.log('MQTT ERROR: ', error)
    })

    this.client.on('message', (topic, message) => {
      debug('event message', message.toString())
      this.events[topic].emit('message', message.toString())
    })
  }
}

module.exports = Mqtt
