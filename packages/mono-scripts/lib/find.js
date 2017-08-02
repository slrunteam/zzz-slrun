const path = require('path')
const fs = require('fs')

module.exports = function find (packageDir) {
  return fs.readdirSync(path.resolve(packageDir))
  .filter((childName) => fs.statSync(path.resolve(packageDir, childName)).isDirectory())
  .filter((childName) => fs.existsSync(path.resolve(packageDir, childName, 'package.json')))
}
