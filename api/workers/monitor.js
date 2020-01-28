const { workerData, parentPort } = require('worker_threads')
const tcpp = require('tcp-ping')

const ip = workerData.device.address.split(':')[0]
const port = workerData.device.address.split(':')[1]

const execute = async () => {
  tcpp.probe(ip, port, (err, available) => {
    parentPort.postMessage({ available })
  })
}
setInterval(async () => {
  await execute()
}, process.env.DEVICE_MONITOR_INTERVAL)
;(async () => {
  await execute()
})()
