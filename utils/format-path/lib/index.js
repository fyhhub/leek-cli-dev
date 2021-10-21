
const path = require('path')

/**
 * mac和window路径处理
 * @param {*} p 
 * @returns 
 */
function formatPath(p) {
  if (p) {
    const sep = path.sep
    if (sep === '/') {
      return p
    } else {
      return p.replace(/\\/g, '/')
    }
  }
  return p
}

module.exports = formatPath;

