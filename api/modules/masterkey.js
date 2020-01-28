const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const prompts = require('prompts')
const debug = require('debug')('iothamster:masterkey')

const masterkeyFile = path.join(__dirname, '..', '.masterkey')
const mastersaltFile = path.join(__dirname, '..', '.mastersalt')

class Masterkey {
  constructor() {}

  async start() {
    if (fs.existsSync(mastersaltFile)) {
      this.mastersalt = fs.readFileSync(mastersaltFile, 'utf-8')
    } else {
      this.mastersalt = crypto.randomBytes(32).toString('hex')
      fs.writeFileSync(mastersaltFile, this.mastersalt)
      debug(`.mastersalt saved (${32}) to ${masterkeyFile}`)
    }

    this.masterkey = process.env.MASTERKEY
    if (this.masterkey != 'undefined') {
      debug(`masterkey found in process.env.MASTERKEY (${this.masterkey.length})`)
    }
    if (this.masterkey == 'undefined') {
      if (fs.existsSync(masterkeyFile)) {
        this.masterkey = fs.readFileSync(masterkeyFile, 'utf-8')
        debug(`.masterkey password found (${this.masterkey.length})`)
      } else {
        const randomGen = await prompts({
          type: 'confirm',
          name: 'value',
          message: 'Do you want to create a random cryptographically secure masterkey?',
          initial: true
        })

        if (randomGen.value) {
          this.masterkey = crypto.randomBytes(128).toString('hex')
          fs.writeFileSync(masterkeyFile, this.masterkey)
          debug(`.masterkey password saved (${this.masterkey.length}) to ${masterkeyFile}`)
        } else {
          const response = await prompts({
            type: 'text',
            name: 'password',
            message: 'What master password would you like to use?',
            validate: val => {
              return val !== ''
            }
          })
          this.masterkey = response.password

          const save = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Do you want to save the masterkey to a .masterkey file for easy booting? (lowers security)',
            initial: false
          })

          if (save.value) {
            debug(`.masterkey password saved (${this.masterkey.length}) to ${masterkeyFile}`)
            fs.writeFileSync(masterkeyFile, this.masterkey)
          }
        }
      }
    }
  }
}

module.exports = Masterkey
