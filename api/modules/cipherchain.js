const argon2 = require('argon2')
const CipherChain = require('cipher-chain')
const debug = require('debug')('iothamster:cipherchain')

class Cipherchain {
  constructor() {}

  async hash(key, salt, length = 64) {
    const argon2output = await argon2.hash(key, {
      raw: true,
      hashLength: parseInt(length),
      salt: Buffer.from(salt)
    })
    return argon2output.toString('hex')
  }

  async start(modules) {
    this.modules = modules
    debug('Spinning up cipher-chain')
    this.secret = await this.hash(modules.masterkey.masterkey, modules.masterkey.mastersalt)
    await this.bootCipherChain()
  }

  async bootCipherChain() {
    this.cipherchain = await new CipherChain({
      secret: this.secret,
      chain: 'aes-256-gcm',
      knex: this.modules.database.knex,
      compressData: false,
      kdf: {
        use: 'argon2',
        saltLength: 8,
        options: {
          argon2: {
            memoryCost: 1024 * 8,
            timeCost: 4
          }
        }
      }
    })
  }
}

module.exports = Cipherchain
