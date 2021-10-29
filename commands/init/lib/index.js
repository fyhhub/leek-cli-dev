const Command = require('@leek-cli-dev/command')
const log = require('@leek-cli-dev/log')
const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'
class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }

  exec() {
    try {
      // 1. 准备阶段
      this.prepare()
      // 2. 下载模板
      // 3. 安装模板
    } catch (e) {
      log.error(e.message)
    }
  }

  async prepare() {
    // 1. 判断目录是否为空
    const localPath = process.cwd()
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false
      if (!this.force) {
        // 询问是否继续创建
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          message: '当前文件夹不为空，是否继续创建项目',
          name: 'ifContinue'
        })).ifContinue

        if (!ifContinue) return
      }

      // 强制清空
      if (ifContinue || this.force) {
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          message: '是否确认清空当前目录下的文件',
          name: 'confirmDelete'
        })
        confirmDelete && fse.emptyDirSync(localPath)
      }
    }

    // 2. 是否启动强制更新
    return this.getProjectInfo()
    // 3. 选择创建项目或组件
    // 4. 获取项目基本信息
  }

  async getProjectInfo() {
    const projectInfo = {}
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT
        },
        {
          name: '组件',
          value: TYPE_COMPONENT
        }
      ]
    });
    log.verbose('type', type)
    // 获取项目信息
    if (type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: '',
          validate: function(v) {
            const done = this.async();
            setTimeout(function() {
              if (!(/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v))) {
                // 1.输入的首字符必须为英文字符
                // 2.尾字符必须为英文或者数字，不能为字符
                // 3.字符仅允许"-_"
                done('请输入合法的项目名称');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: v => {
            return v
          }
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '',
          validate: v => {
            return !!semver.valid(v)
          },
          filter: v => {
            if (!!semver.valid(v)) {
              return semver.valid(v)
            } else {
              return v
            }
          }
        }
      ])
      log.verbose('projectInfo', o)
    }
    if (type === TYPE_COMPONENT) {

    }
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath)
    fileList = fileList.filter(file => (
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ))
    return !fileList || fileList.length <= 0
  }
}
function init(argv) {
  return new InitCommand(argv)
}

module.exports = init

module.exports.InitCommand = InitCommand