const mqtt = require('async-mqtt')
const fs = require('fs')
const path = require('path')
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
    debug(`Trying to connect to ${process.env.MQTT_HOST}`)
    try {
      this.client = await mqtt.connectAsync({
        host: process.env.MQTT_HOST,
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
        clientId: 'IoTHamster',
        keepalive: 5,
        clean: true,
        protocol: 'mqtts',
        rejectUnauthorized: !!+process.env.MQTT_REJECT_UNAUTHORIZED,
        secureProtocol: process.env.MQTT_TLS_METHOD,
        ca: fs.readFileSync(certificate),
        reconnectPeriod: 1000
      })
    } catch (e) {
      debug(e.message)
      process.exit()
    }
    debug('connected')
    this.connected = true

    this.client.on('connect', function() {
      this.connected = true
      debug('event connect')
      // this.client.subscribe('presence', function(err) {
      //   if (!err) {
      //     this.client.publish('presence', 'Hello mqtt')
      //   }
      // })
    })

    this.client.on('offline', function() {
      this.connected = false
      debug('event offline')
    })

    this.client.on('reconnect', function() {
      debug('event reconnect')
    })

    this.client.on('disconnect', function() {
      this.connected = false
      debug('event disconnect')
    })

    this.client.on('error', function(error) {
      debug('event error')
      console.log('ERROR: ', error)
    })

    this.client.on('message', function(topic, message) {
      debug('event message')
      console.log(message.toString())
      this.client.end()
    })
  }
}

module.exports = Mqtt
