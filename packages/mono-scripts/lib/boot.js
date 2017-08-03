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
    const packageBinPath = path.join(packagePath, 'node_modules', '.bin')
    await fs.remove(packageBinPath)
    await fs.ensureDir(packageBinPath)
    const bins = commonBins.concat((binsByPackage[packageName] || []))
    for (const bin of bins) {
      const binParts = bin.split('/')
      const binPath = path.join(packageBinPath, binParts[binParts.length - 1])
      await fs.remove(binPath)
      const rootBinPath = binParts.length === 1 ? path.resolve('node_modules', '.bin', bin)
        : path.resolve('node_modules', bin)
      if (fs.existsSync(rootBinPath)) {
        fs.symlinkSync(rootBinPath, binPath, 'file')
      }
    }
    console.log(`Linked binaries [${bins.join(', ')}] to ${packageDir}/${packageName}/node_modules`)
  }
  if (packageNamesToLink.length) {
    console.log(`Linked packages [${packageNamesToLink.join(', ')}] to ${packageDir}/node_modules`)
  }
}
