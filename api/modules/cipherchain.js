const argon2 = require('argon2')
const CipherChain = require('cipher-chain')
const debug = require('debug')('iothamster:cipherchain')

class Cipherchain {
  constructor() {}

  async hash(key, salt, length = 64) {
    debug(`Hashing ${length} length key`)
    const argon2output = await argon2.hash(key, {
      raw: true,
      hashLength: parseInt(length),
      salt: Buffer.from(salt)
    })
    return argon2output.toString('hex')
  }

  async genMaster() {
    return await this.hash(this.modules.masterkey.masterkey, this.modules.masterkey.mastersalt)
  }

  async compareMaster(comparison) {
    return (await this.hash(comparison, this.modules.masterkey.mastersalt)) === this.secret
  }

  async start(modules) {
    this.modules = modules
    this.secret = await this.genMaster()
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
