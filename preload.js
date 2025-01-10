const { contextBridge, ipcRenderer } = require('electron')

const api = {
  start: (...args) => invoke('start', ...args),
  close: (...args) => invoke('close', ...args),
  changeMode: (...args) => invoke('changeMode', ...args),
  data: (...args) => invoke('data', ...args),
  listenData: (cb) => on('listen_data', cb),
}

contextBridge.exposeInMainWorld('api', api)

const invoke = (chan, ...args) => {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke(chan, ...args).then((data) => {
      console.info('[ipc invoke] chan:', chan, 'args:', args, 'data:', data)
      resolve(data)
    }).catch(err => {
      console.error('[ipc invoke] chan:', chan, 'args:', args, 'err:', err)
      err = err + ''
      err = err.replace('Error: Error invoking remote method \'' + chan + '\': ', '')
      reject(err)
    })
  })
}

const on = (chan, cb) => {
  ipcRenderer.on(chan, (e, ...v) => {
    console.info('[ipc on] chan:', chan, 'data:', v)
    cb(v[0])
  })
}
