const { ipcMain } = require('electron')
// const db = require('../../db.js')

ipcMain.on('app-test', (event, data) => {
  // Do something
  console.log('IpcMain event app-test', { event, data })
})
