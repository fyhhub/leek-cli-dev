#! /usr/bin/env node
const importLocal = require('import-local')
console.log('%c 🍌 __filename: ', 'font-size:20px;background-color: #7F2B82;color:#fff;', __filename);
if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 leek-cli本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}