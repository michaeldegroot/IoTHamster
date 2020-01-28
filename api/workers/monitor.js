const { workerData, parentPort } = require('worker_threads')
var tcpp = require('tcp-ping')

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"

const execute = async () => {
  parentPort.postMessage('ping')

  const ip = workerData.device.address.split(':'[0])
  const port = workerData.device.address.split(':'[1])
  tcpp.probe(ip, port, (err, available) => {
    parentPort.postMessage({ available })
  })
}

setInterval(async () => {
  await execute()
}, 5000)
;(async () => {
  await execute()
})()

//parentPort.postMessage({ hello: workerData })
