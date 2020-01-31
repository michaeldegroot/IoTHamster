const fs = require('fs')
const path = require('path')
const debug = require('debug')('iothamster:mqttserver')
const ipaddr = require('ipaddr.js')
const tcpp = require('tcp-ping')
const _ = require('lodash')

const certFile = path.join(__dirname, '..', 'certs', 'mqtt', 'server.crt')
const keyFile = path.join(__dirname, '..', 'certs', 'mqtt', 'server.key')

class MqttServer {
  constructor() {
    if (process.env.MQTT_MANAGE_SERVER !== '1') {
      return
    }

    this.connected = false

    if (!fs.existsSync(certFile)) {
      throw new Error(`${certFile} does not exists`)
    }
    if (!fs.existsSync(keyFile)) {
      throw new Error(`${keyFile} does not exists`)
    }

    setInterval(async () => {
      await this.ping()
    }, 5000)
  }

  async ping() {
    tcpp.probe(process.env.MQTT_HOST, process.env.MQTT_PORT, (err, available) => {
      this.connected = available
    })
  }

  async start() {
    if (process.env.MQTT_MANAGE_SERVER !== '1') {
      return
    }

    const aedes = require('aedes')()
    const server = require('tls').createServer(
      {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile)
      },
      aedes.handle
    )

    aedes.preConnect = function(client, callback) {
      if (process.env.MQTT_LOCAL_NETWORK_ONLY === '1') {
        const ip = client.conn.remoteAddress.replace(/^.*:/, '')
        const range = ipaddr.parse(ip).range()
        if (range !== 'loopback' && range !== 'private') {
          debug(`${ip} tried to connect but was not in the private network (MQTT_LOCAL_NETWORK_ONLY=1)`)
          return callback(false)
        }
      }
      callback(null, true)
    }

    aedes.authenticate = function(client, username, password, callback) {
      username = username.toString('utf-8')
      password = password.toString('utf-8')

      if (username === process.env.MQTT_USER && password === process.env.MQTT_PASSWORD) {
        return callback(null, true)
      }

      debug(`${client.conn.remoteAddress.replace(/^.*:/, '')} tried to auth with ${username} but username and/or password didn't match`)

      const error = new Error('Auth error')
      error.returnCode = 4
      callback(error, null)
    }

    aedes.on('closed', () => {
      debug('closed')
    })

    aedes.on('client', client => {
      debug('client connected', client.id)
    })

    aedes.on('clientReady', client => {
      debug('clientReady', client.id)
    })

    aedes.on('clientDisconnect', client => {
      debug('clientDisconnect', client.id)
    })

    aedes.on('clientError', (client, error) => {
      debug('clientError', client.id, error.message)
    })

    aedes.on('connectionError', (client, error) => {
      debug('connectionError', client.id, error)
    })

    aedes.on('keepaliveTimeout', client => {
      debug('keepaliveTimeout', client.id)
    })

    aedes.on('ack', (packet, client) => {
      debug('ack', packet, client.id)
    })

    aedes.on('connackSent', (packet, client) => {
      debug('connackSent', client.id)
    })

    aedes.on('ping', (packet, client) => {
      debug('ping', client.id)
    })

    aedes.on('publish', (packet, client) => {
      // weird?
      if (client !== null) {
        debug('publish', packet.topic, packet.payload.toString('utf-8'), client.parser.settings.clientId)
      }
    })

    aedes.on('subscribe', (subscriptions, client) => {
      for (const subscription of subscriptions) {
        debug('subscribe', subscription.topic, client.id)
      }
    })

    aedes.on('unsubscribe', (unsupscriptions, client) => {
      for (const unsubscription of unsupscriptions) {
        debug('unsubscribe', unsubscription.topic, client.id)
      }
    })

    server.listen(process.env.MQTT_PORT, function() {
      debug(`MQTT server started at ${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`)
    })
  }
}

module.exports = MqttServer
