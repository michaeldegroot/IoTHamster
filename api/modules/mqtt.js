const mqtt = require('async-mqtt')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('iothamster:mqtt')

class Mqtt {
  constructor() {}

  async start(modules) {
    debug(`Trying to connect to ${process.env.MQTT_HOST}`)
    console.log('use auth', !!+process.env.MQTT_REJECT_UNAUTHORIZED, process.env.MQTT_REJECT_UNAUTHORIZED)
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
        ca: fs.readFileSync(path.join(__dirname, '..', 'certs', 'mqtt', 'server.crt')),
        reconnectPeriod: 1000
      })
    } catch (e) {
      debug(e.message)
      process.exit()
    }
    debug('connected')
    console.log(this.client)

    this.client.on('connect', function() {
      this.client.subscribe('presence', function(err) {
        if (!err) {
          this.client.publish('presence', 'Hello mqtt')
        }
      })
    })

    this.client.on('offline', function() {
      console.log('offline')
    })

    this.client.on('reconnect', function() {
      console.log('reconnect')
    })

    this.client.on('error', function(error) {
      console.log('ERROR: ', error)
    })

    this.client.on('message', function(topic, message) {
      // message is Buffer
      console.log(message.toString())
      this.client.end()
    })
  }
}

module.exports = Mqtt
