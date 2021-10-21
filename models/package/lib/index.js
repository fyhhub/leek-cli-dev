const { isObject } = require('@leek-cli-dev/utils')
const formatPath = require('@leek-cli-dev/format-path')
const pkgDir = require('pkg-dir')
const path = require('path')
const npminstall = require('npminstall')
const { getDefaultRegistry } = require('@leek-cli-dev/get-npm-info')
class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package初始化参数不能为空！');
    }
    if (!isObject(options)) {
      throw new Error('Package初始化参数类型不正确！');
    }
    console.log('package');
    // package路径
    this.targetPath = options.targetPath
    // package 缓存路径
    this.storeDir = options.storeDir
    // package名称
    this.packageName = options.packageName
    // package版本
    this.packageVersion = options.version
  }

  exists() {

  }

  install() {
    npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion || '^1.0.0'
        }
      ]
    })
  }

  update() {

  }
  
  // 获取入口文件路径
  getRootFilePath() {
    // 1. 获取package.json目录 - pkg-dir
    const dir = pkgDir.sync(this.targetPath)
    if (dir) {
      // 2. 读取package.json 获取main 入口文件路径
      const pkgFile = require(path.resolve(dir, 'package.json'))
      if (pkgFile && pkgFile.main) {
        // 3. mac window路径兼容
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null;
  }
}

module.exports = Package
