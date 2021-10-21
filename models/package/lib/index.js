const { isObject } = require('@leek-cli-dev/utils')
const formatPath = require('@leek-cli-dev/format-path')
const pkgDir = require('pkg-dir')
const path = require('path')
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
    // package 存储路径
    // this.storePath = options.storePath
    // package名称
    this.packageName = options.packageName
    // package版本
    this.packageVersion = options.version
  }

  exists() {

  }

  install() {

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
