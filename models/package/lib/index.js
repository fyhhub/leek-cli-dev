const { isObject } = require('@leek-cli-dev/utils')
const formatPath = require('@leek-cli-dev/format-path')
const pkgDir = require('pkg-dir')
const path = require('path')
const pathExists = require('path-exists').sync
const npminstall = require('npminstall')
const fse = require('fs-extra')
const { getDefaultRegistry, getNpmLatestVerison } = require('@leek-cli-dev/get-npm-info')
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
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVerison(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  // 判断package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  async install() {
    await this.prepare()
    return npminstall({
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

  async update() {
    await this.prepare()
    // 1. 获取最新版本号
    const latestPackageVersion = await getNpmLatestVerison(this.packageName)
    // 2. 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(this.packageName)
    if (!pathExists(latestFilePath)) {
      return npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
    }
  }
  
  // 获取入口文件路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1. 获取package.json目录 - pkg-dir
      const dir = pkgDir.sync(targetPath)
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
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
