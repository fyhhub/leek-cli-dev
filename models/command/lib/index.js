const semver = require('semver')
const colors = require('colors/safe')
const log = require('@leek-cli-dev/log')
const { isObject } = require('@leek-cli-dev/utils')
const LOWEST_NODE_VERSION = '13.0.0'

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空！')
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！')
    }
    if (argv.length < 1) {
      throw new Error('参数列表不能为空！')
    }
    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain = chain.catch((error) => log.error(error.message))
    })
  }
  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestNodeVersion = LOWEST_NODE_VERSION;
    // node版本检查
    if (!semver.gte(currentVersion, lowestNodeVersion)) {
      throw new Error(colors.red(`@leek-cli-dev 需要安装 v${lowestNodeVersion}以上版本`))
    }
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1]
    this._argv = this._argv.slice(0, this._argv.length - 1)
  }
  init() {
    throw new Error('The init method must be implemented')
  }

  exec() {
    throw new Error('The init exec must be implemented')
  }
}

module.exports = Command;
