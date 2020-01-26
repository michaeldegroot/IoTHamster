const program = require('commander')
const IoTHamster = require('./iothamster')
const packagejson = require('./package.json')
program.version(packagejson.version)

program.option('-p, --masterkey <masterkey>', 'masterkey password')

program.parse(process.argv)

process.env.MASTERKEY = program.masterkey

new IoTHamster()
