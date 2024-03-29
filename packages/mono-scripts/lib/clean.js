const path = require('path')
const fs = require('fs-extra')

const find = require('./find')

module.exports = async function clean (config) {
  const { packageDir } = config
  const packageNames = find(packageDir)
  for (const packageName of packageNames) {
    const packagePath = path.resolve(packageDir, packageName)
    // remove LICENSE
    await fs.remove(path.join(packagePath, 'LICENSE'))
    // modify package.json to remove repository, author, license and dependencies
    const packageInfo = await fs.readJson(path.join(packagePath, 'package.json'))
    delete packageInfo.repository
    delete packageInfo.author
    delete packageInfo.license
    delete packageInfo.dependencies
    await fs.writeJson(path.join(packagePath, 'package.json'), packageInfo, { spaces: 2 })
  }
}
