const Package = require('@leek-cli-dev/package')
const log = require('@leek-cli-dev/log')
const path = require('path')

const SETTINGS = {
  init: '@leek-cli-dev/init'
}
const CACHE_DIR = 'dependencies'
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  let pkg
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
    if (await pkg.exists()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }

  const rootFile = pkg.getRootFilePath()
  console.log('%c 🍝 rootFile: ', 'font-size:20px;background-color: #FFDD4D;color:#fff;', rootFile);
  if (rootFile) {
    require(rootFile).apply(null, arguments)
  }
}

module.exports = exec;

