const pkg = require('../package.json')
const path = require('path')
const log = require('@leek-cli-dev/log')
const init = require('@leek-cli-dev/init')
const exec = require('@leek-cli-dev/exec')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const commander = require('commander')
const { getNpmSemVersion } = require('@leek-cli-dev/get-npm-info')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const')
let args;
let config;
const program = new commander.Command()
async function core() {
  try {
    await prepare()
    registerCommand()
  } catch (e) {
    log.error(e.message)
    if (program.debug) {
      console.log(e)
    }
  }
}
async function prepare() {
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目（覆盖已有项目目录）')
    .action(exec)

  program
    .on('option:debug', function() {
      process.env.LOG_LEVEL = program.debug ? 'verbose' : 'info'
      log.level = process.env.LOG_LEVEL
    })

  program
    .on('option:targetPath', function() {
      process.env.CLI_TARGET_PATH = program.targetPath;
    })

  program
    .on('command:*', function(obj) {
      const availableCommands = program.commands.map(cmd => cmd.name())
      console.log(colors.red('未知的命令：' + obj[0]));
      if (availableCommands.length > 0) {
        console.log(colors.red('可用的命令：' + availableCommands.join(',')));
      }
    })

  program
    .parse(process.argv)

  // 未输入内容，打印帮助内容
  if (program.args && program.args.length < 1) {
    program.outputHelp()
  }
}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version
  const npmName = pkg.name
  const lastVersion = await getNpmSemVersion(currentVersion, npmName)
  if (lastVersion && !semver.gte(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}, 当前版本：${currentVersion}，最新版本：${lastVersion}
    更新命令: npm install -g ${npmName}
    `))
  }
}

function checkEnv() {
  const dotEnv = require('dotenv')
  const dotEnvPath = path.resolve(userHome, '.env')
  if (pathExists(dotEnvPath)) {
    dotEnv.config({
      path: dotEnvPath
    })
  }
  config = createDefaultConfig()
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
  return cliConfig
}

function checkPkgVersion() {
  log.info('cli', pkg.version)
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestNodeVersion = LOWEST_NODE_VERSION;
  // node版本检查
  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`@leek-cli-dev 需要安装 v${lowestNodeVersion}以上版本`))
  }
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'))
  }
}
module.exports = core