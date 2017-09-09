const path = require('path')
const fs = require('fs-extra')
const isBuiltinModule = require('is-builtin-module')
const detective = require('detective')
const chalk = require('chalk')

const find = require('./find')

module.exports = async function build (config) {
  const { packageDir, ignoreSrc = {} } = config
  const packageNames = find(packageDir)
  const licensePath = path.resolve('LICENSE')
  const rootPackageInfo = await fs.readJson(path.resolve('package.json'))
  const packageVersions = await getPackageVersions(packageDir, packageNames)
  const allDeps = {}
  for (const packageName of packageNames) {
    const packagePath = path.resolve(packageDir, packageName)
    await copyLicense(licensePath, packagePath)
    const deps = await findDeps(packageName, packagePath, ignoreSrc, allDeps, rootPackageInfo, packageVersions)
    await modifyPackageInfo(packagePath, packageDir, packageName, deps, rootPackageInfo, packageVersions)
  }
  const unusedDeps = Object.keys(rootPackageInfo.dependencies).filter((dep) => !allDeps[dep])
  if (unusedDeps.length) {
    console.warn(chalk.red(`Unused deps: ${unusedDeps.join(', ')}`))
  }
}

async function modifyPackageInfo (packagePath, packageDir, packageName, deps, rootPackageInfo, packageVersions) {
  const packageInfo = await fs.readJson(path.join(packagePath, 'package.json'))
  Object.assign(packageInfo, {
    repository: `${rootPackageInfo.repository}/tree/master/${packageDir}/${packageName}`,
    author: rootPackageInfo.author,
    license: rootPackageInfo.license,
    dependencies: deps.reduce((depVersions, dep) => {
      depVersions[dep] = rootPackageInfo.dependencies[dep] || `^${packageVersions[dep]}`
      return depVersions
    }, {})
  })
  await fs.writeJson(path.join(packagePath, 'package.json'), packageInfo, { spaces: 2 })
}

async function getPackageVersions (packageDir, packageNames) {
  const packageVersions = {}
  for (const packageName of packageNames) {
    const packagePath = path.resolve(packageDir, packageName)
    const packageInfo = await fs.readJson(path.join(packagePath, 'package.json'))
    packageVersions[packageName] = packageInfo.version
  }
  return packageVersions
}

async function copyLicense (licensePath, packagePath) {
  await fs.copy(licensePath, path.join(packagePath, 'LICENSE'))
}

async function findDeps (packageName, packagePath, ignoreSrc, allDeps, rootPackageInfo, packageVersions) {
  const deps = {}
  updateDeps(deps, packagePath, ignoreSrc[packageName], true)
  Object.keys(deps).forEach((dep) => { allDeps[dep] = true })
  const notFoundDeps = Object.keys(deps)
    .filter((dep) => !rootPackageInfo.dependencies[dep] && !rootPackageInfo.devDependencies[dep] &&
      !packageVersions[dep])
  if (notFoundDeps.length) {
    console.warn(chalk.red(`Not found deps for [${packageName}]: ${notFoundDeps.join(', ')}`))
  }
  const sortedDeps = Object.keys(deps).filter((dep) => rootPackageInfo.dependencies[dep] || packageVersions[dep])
  sortedDeps.sort()
  return sortedDeps
}

function updateDeps (deps, srcPath, namesToIgnore, isRoot) {
  fs.readdirSync(srcPath)
    .filter((childName) => !namesToIgnore || namesToIgnore.indexOf(childName) === -1)
    .filter((childName) => childName !== 'node_modules')
    .filter((childName) => childName.indexOf('.'))
    .forEach((childName) => {
      const childPath = path.join(srcPath, childName)
      if (fs.statSync(childPath).isDirectory()) {
        updateDeps(deps, childPath, namesToIgnore)
      } else if (!isRoot && path.extname(childPath) === '.js') {
        detective(fs.readFileSync(childPath))
          .map((dep) => dep.split('/')[0])
          .filter((dep) => dep.indexOf('.'))
          .filter((dep) => !isBuiltinModule(dep))
          .forEach((dep) => { deps[dep] = true })
      }
    })
}
