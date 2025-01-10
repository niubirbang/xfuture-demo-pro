const { app, shell, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')
const { install, start, close, changeMode, data, quit } = require('./xfuture')

install().then(()=>{
  console.info('xfuture install success')
}).catch(err => {
  console.error('xfuture install failed:', err)
})

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    webPreferences: {
      preload: join(__dirname, './preload.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  mainWindow.loadFile(join(__dirname, './render/index.html'))
}

app.whenReady().then(() => {
  ipcMain.handle('start', (e, ...v) => {
    return start(...v)
  })
  ipcMain.handle('close', (e, ...v) => {
    return close(...v)
  })
  ipcMain.handle('changeMode', (e, ...v) => {
    return changeMode(...v)
  })
  ipcMain.handle('data', (e, ...v) => {
    return data(...v)
  })

  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await quit()
})