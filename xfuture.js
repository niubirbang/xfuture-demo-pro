const path = require('path')
const fs = require('fs')
const { app, BrowserWindow } = require('electron')
// const engine = require('xfuture/index')

const getXfuturePath = () => {
  return path.join(__dirname, "./xfuture").replace("app.asar", "app.asar.unpacked");
}

let engine

const install = async () => {
  const xfuturePath = getXfuturePath()
  const xfutureSecret = '88991238'
  const xfutureShellPath = {
    'win32': 'maodou',
    'darwin': path.join(xfuturePath, 'package/install_helper.sh'),
  }[`${process.platform}`]
  const xfutureHelperPath = {
    'win32': path.join(xfuturePath, `package/sysproxy.exe`),
    'darwin': path.join(xfuturePath, 'package/xsing-box-exec'),
  }[`${process.platform}`]
  const xfutureResourcePath = path.join(xfuturePath, 'resources')
  const xfutureLogPath = path.join(app.getPath('appData'), `xfuture-demo-pro/logs`)

  fs.mkdirSync(xfutureLogPath, { recursive: true })

  console.log(
    'install xfuture driver,\n',
    `xfutureShellPath: ${xfutureShellPath}\n`,
    `xfutureHelperPath: ${xfutureHelperPath}\n`,
    `xfutureResourcePath: ${xfutureResourcePath}\n`,
    `log_path: ${xfutureLogPath}`,
  )

  engine = require(path.join(xfuturePath, '/index.js'))
  engine.InstallDriver(xfutureShellPath, xfutureHelperPath, xfutureResourcePath, xfutureLogPath)
  engine.SetPassword(xfutureSecret)
}


let MODE = 'rule'
let STATUS = 'off'
let URL = 'ppx://103.117.150.85:45777?token=ixpprTzL0qrG8ugjC1fkvBbWxClqdNgpVgK6nKgWIzCBwzxWMJbbNfAiJ7XCAuW/0sFL9LYFO1vti978KeuxC6VtX6mbxZvjB/jW8x44OkhkJcmI1I48l8B+B+nmD2mKbauFE4vdbzm+p6kquFVKbLAg1TGB94p3uDR+aBGDX6n+kAK7JlxORbqtSVA43IkUyMFG37ywXb7fYZA/Onn/QL8Cpg2VukEZyIKxgCMUiWHEd6MUTyMriUOkGj3WhE0/H90j2xlpkVT2b1Qt0MDsLjF/1bjlge7TXcDrgMlO7LvV+U8n3tF1pt726QGSedMpcpHncH8D3X38VT3yYbJTTpcwLc0/C/dflDqxb2oCCyrqjq9tW4rpAS6XHjiu38WW4INJeO8GroUp1lZH45c+4FHhG8Gem3rIOtBWPTWMRCdl2CdFGFIwT2XMygT53P7gf6K/mfcG2GrLAzsj+AAVSD68GxNgpowvVOGGoPpcbHIeI6vSWcN5BosD+NfW8Rblov4tIK6hFxpafQQLgue2hbSkIcw4HLXYEcvdWe0UfEoLIbdYRP+VSf6YSJB2g6nE8Sdt&key=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANUpzuDL0ByBtajcED3fGUdHOlCl9M7+fzY2xSbizPKGm88iilPA1td1tnxiicEMEa/723TgE9+g+qJWoqkOW50CAwEAAQ=='

const start = (mode) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!mode) {
        mode = MODE
      }
      if (STATUS !== 'on' || MODE !== mode) {
        engine.StopTunnel()
        engine.SetTunModeEnable(true)
        engine.SetGlobalMode(mode === 'global')
        if (!engine.StartTunnel(URL)) {
          throw new Error(`start_failed`)
        }
      }
      resolve()
      MODE = mode
      STATUS = 'on'
      notify()
    } catch (err) {
      reject(err)
    }
  })
}

const close = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (STATUS !== 'off') {
        engine.StopTunnel()
      }
      resolve()
      STATUS = 'off'
      notify()
    } catch (err) {
      reject(err)
    }
  })
}

const changeMode = (mode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const restart = STATUS === 'on'
      if (restart) {
        await start(mode)
        resolve()
      } else {
        resolve()
        MODE = mode
        notify()
      }
    } catch (err) {
      reject(err)
    }
  })
}

const data = () => {
  return {
    mode: MODE,
    status: STATUS,
  }
}

const quit = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await close()
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

const notify = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send('listen_data', data())
    }
  }
}

module.exports = {
  install,
  start,
  close,
  changeMode,
  data,
  quit,
}