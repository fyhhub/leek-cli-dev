const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')
function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/'
}
function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return;
  }
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)
  return axios.get(npmInfoUrl).then(res => {
    if (res.status === 200) {
      return res.data
    }
    return null
  }).catch(err => {
    return Promise.reject(err)
  })
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getNpmSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a))
}

async function getNpmSemVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getNpmSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length) {
    return newVersions[0]
  }
}

async function getNpmLatestVerison(npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0]
  }
}
module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemVersion,
  getDefaultRegistry,
  getNpmLatestVerison
};