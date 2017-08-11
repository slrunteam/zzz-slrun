const path = require('path')
const fs = require('fs-extra')

const find = require('./find')

module.exports = async function boot (config) {
  const { packageDir, bins: binsByPackage } = config
  const packageNames = find(packageDir)
  const packageContainerPath = path.resolve(packageDir, 'node_modules')
  await fs.remove(packageContainerPath)
  let ensurePackageContainerPath = false
  const commonBins = binsByPackage['*']
  const packageNamesToLink = []
  for (const packageName of packageNames) {
    const packagePath = path.resolve(packageDir, packageName)
    const packageInfo = await fs.readJson(path.join(packagePath, 'package.json'))
    if (!packageInfo.private) {
      packageNamesToLink.push(packageName)
      if (!ensurePackageContainerPath) {
        await fs.ensureDir(packageContainerPath)
        ensurePackageContainerPath = true
      }
      fs.symlinkSync(packagePath, path.join(packageContainerPath, packageName), 'dir')
    }
    const packageDepPath = path.join(packagePath, 'node_modules')
    const packageBinPath = path.join(packageDepPath, '.bin')
    await fs.remove(packageDepPath)
    await fs.ensureDir(packageBinPath)
    const bins = commonBins.concat((binsByPackage[packageName] || []))
    for (const bin of bins) {
      const rootBinModulePath = path.resolve('node_modules', bin)
      if (fs.existsSync(rootBinModulePath)) {
        fs.symlinkSync(rootBinModulePath, path.join(packageDepPath, bin), 'dir')
      }
      const rootBinPath = path.resolve('node_modules', '.bin', bin)
      const binPath = path.join(packageBinPath, bin)
      if (fs.existsSync(rootBinPath)) {
        fs.symlinkSync(rootBinPath, binPath, 'file')
      }
      const rootBinPathCmd = `${rootBinPath}.cmd`
      const binPathCmd = `${binPath}.cmd`
      if (fs.existsSync(rootBinPathCmd)) {
        fs.symlinkSync(rootBinPathCmd, binPathCmd, 'file')
      }
    }
    console.log(`Linked binaries [${bins.join(', ')}] to ${packageDir}/${packageName}/node_modules`)
  }
  if (packageNamesToLink.length) {
    console.log(`Linked packages [${packageNamesToLink.join(', ')}] to ${packageDir}/node_modules`)
  }
}
