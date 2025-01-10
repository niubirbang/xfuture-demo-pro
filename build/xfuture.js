const fs = require('fs')
const path = require('path')

const moduleXfutureDir = path.join(__dirname, '../node_modules/xfuture')

const xfutureDir = path.join(__dirname, '../xfuture')
const xfuturePackageName = {
  'darwin-x64': 'darwin',
  'darwin-arm64': 'darwin',
  'win32-x64': 'win32-x64',
  'win32-arm64': 'win32-arm64',
}[`${process.platform}-${process.arch}`]
const xfutureResourcesRemain = (item = '') => {
  switch (process.platform) {
    case 'darwin':
      return !item.endsWith('.exe')
    case 'win32':
      return true
    default:
      return true
  }
}

fs.rmSync(xfutureDir, { recursive: true, force: true })
fs.renameSync(moduleXfutureDir, xfutureDir)

fs.rmSync(path.join(xfutureDir, '/node_modules'), { recursive: true, force: true })
fs.rmSync(path.join(xfutureDir, '/package.json'), { recursive: true, force: true })
fs.rmSync(path.join(xfutureDir, '/x.js'), { recursive: true, force: true })

fs.readdirSync(path.join(xfutureDir, `/package`)).forEach((item) => {
  if (item !== xfuturePackageName) {
    fs.rmSync(path.join(xfutureDir, `/package/${item}`), { recursive: true, force: true })
  }
})
fs.readdirSync(path.join(xfutureDir, `/package/${xfuturePackageName}`)).forEach((item) => {
  if (item.endsWith('.node')) {
    return
  }
  fs.renameSync(
    path.join(xfutureDir, `/package/${xfuturePackageName}/${item}`),
    path.join(xfutureDir, `/package/${item}`),
  )
})
fs.readdirSync(path.join(xfutureDir, `/resources`)).forEach((item) => {
  if (!xfutureResourcesRemain(item)) {
    fs.rmSync(path.join(xfutureDir, `/resources/${item}`), { recursive: true, force: true })
  }
})