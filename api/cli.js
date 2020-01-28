const program = require('commander')
const IoTHamster = require('./iothamster')
const packagejson = require('./package.json')
program.version(packagejson.version)

program.option('-p, --masterkey <masterkey>', 'masterkey password')
program.option('-t, --token', 'generates a json web token')

program.parse(process.argv)

process.env.MASTERKEY = program.masterkey
if (program.token) {
  process.env.GENTOKEN = 1
}

new IoTHamster()
