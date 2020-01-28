const crypto = require('crypto')
const argon2 = require('argon2')
const CipherChain = require('cipher-chain')
const debug = require('debug')('iothamster:cipherchain')

class Cipherchain {
  constructor() {}

  async hash(key, salt, length = 128) {
    let presalt = 'with random salt (12)'
    if (!salt) {
      salt = crypto.randomBytes(6).toString('hex')
    } else {
      presalt = `with pre-defined salt (${salt.length})`
    }
    debug(`Hashing ${length} length key`, presalt)
    const argon2output = await argon2.hash(key, {
      raw: true,
      hashLength: parseInt(length),
      salt: Buffer.from(salt)
    })
    return argon2output.toString('hex')
  }

  async start(modules) {
    this.modules = modules
    this.secret = await this.hash(this.modules.masterkey.masterkey, this.modules.masterkey.mastersalt)
    await this.bootCipherChain()
  }

  async bootCipherChain() {
    debug('Spinning up cipher-chain instance')
    this.cipherchain = await new CipherChain({
      secret: this.secret,
      chain: 'aes-256-gcm',
      knex: this.modules.database.knex,
      compressData: false,
      kdf: {
        use: 'argon2',
        saltLength: 12,
        options: {
          argon2: {
            memoryCost: 1024 * 8,
            timeCost: 8
          }
        }
      }
    })
  }
}

module.exports = Cipherchain
