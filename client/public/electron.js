// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, Tray } = require('electron')
const { is } = require('electron-util')
const path = require('path')
const url = require('url')
const glob = require('glob')
const isDev = require('electron-is-dev')
const windowStateKeeper = require('electron-window-state')
const { resolve } = require('app-root-path')
const db = require('./modules/db')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const ipc = {}
const files = glob.sync(path.join(__dirname, '..', 'main-process', '**/*.js'))
for (const filepath of files) {
  const name = path.basename(filepath, '.js')
  ipc[name] = require(filepath)
}

const createWindow = async () => {
  const tray = new Tray(resolve(path.join('public', 'favicon.ico')))
  await db.connect()
  const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workAreaSize
  const mainWindowState = windowStateKeeper({
    defaultWidth: screenWidth,
    defaultHeight: screenHeight
  })
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    frame: false,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: { nodeIntegration: true },
    show: false,
    center: true,
    skipTaskbar: true,
    icon: resolve(path.join('public', 'favicon.ico'))
  })

  const splashWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    movable: false,
    maximizable: false,
    minimizable: false,
    center: true,
    width: 700,
    height: 400,
    webPreferences: { nodeIntegration: true },
    icon: resolve(path.join('public', 'favicon.ico'))
  })

  mainWindowState.manage(mainWindow)

  let splashStartUrl = url.format({
    pathname: path.join(__dirname, '/../build/splash.html'),
    protocol: 'file:',
    slashes: true
  })

  let startUrl = url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  })

  if (isDev) {
    startUrl = 'http://localhost:3000'
    splashStartUrl = 'http://localhost:3000/splash.html'
  }

  mainWindow.loadURL(startUrl)
  splashWindow.loadURL(splashStartUrl)

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('close', function(event) {
    event.preventDefault()
    mainWindow.hide()
    return false
  })

  mainWindow.once('ready-to-show', () => {
    splashWindow.hide()
    mainWindow.show()

    // Open the DevTools.
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']
  return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload))).catch(console.log)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDev && process.argv.indexOf('--noDevServer') === -1) {
    await installExtensions()
  }
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault()
    require('open')(url)
  })
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) e.preventDefault(), require('open')(url)
  })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
