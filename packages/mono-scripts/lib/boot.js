const path = require('path')
const fs = require('fs-extra')
const find = require('./find')

module.exports = async function boot (config) {
  const { packageDir, bins: binsByPackage } = config
  const packageNames = find(packageDir)
  const packageContainerPath = path.resolve(packageDir, 'node_modules')
  await fs.remove(packageContainerPath)
  await fs.ensureDir(packageContainerPath)
  const commonBins = binsByPackage['*']
  const packageNamesToLink = []
  for (const packageName of packageNames) {
    const packagePath = path.resolve(packageDir, packageName)
    await linkPackage(packageName, packagePath, packageContainerPath, packageNamesToLink)
    const bins = commonBins.concat((binsByPackage[packageName] || []))
    await linkBins(bins, packagePath)
    console.log(`Linked binaries [${bins.join(', ')}] to ${packageDir}/${packageName}/node_modules`)
  }
  if (packageNamesToLink.length) {
    console.log(`Linked packages [${packageNamesToLink.join(', ')}] to ${packageDir}/node_modules`)
  }
}

async function linkPackage (packageName, packagePath, packageContainerPath, packageNamesToLink) {
  const packageInfo = await fs.readJson(path.join(packagePath, 'package.json'))
  if (packageInfo.private) {
    return
  }
  packageNamesToLink.push(packageName)
  fs.symlinkSync(packagePath, path.join(packageContainerPath, packageName), 'dir')
}

async function linkBins (bins, packagePath) {
  const packageDepPath = path.join(packagePath, 'node_modules')
  const packageBinPath = path.join(packageDepPath, '.bin')
  await fs.remove(packageDepPath)
  await fs.ensureDir(packageBinPath)
  for (const bin of bins) {
    linkBinModule(bin, packageDepPath)
    linkBin(bin, packageBinPath)
  }
}

function linkBinModule (bin, packageDepPath) {
  const rootBinModulePath = path.resolve('node_modules', bin)
  if (fs.existsSync(rootBinModulePath)) {
    fs.symlinkSync(rootBinModulePath, path.join(packageDepPath, bin), 'dir')
  }
}

function linkBin (bin, packageBinPath) {
  const rootBinPath = path.resolve('node_modules', '.bin', bin)
  if (fs.existsSync(rootBinPath)) {
    fs.symlinkSync(rootBinPath, path.join(packageBinPath, bin), 'file')
  }
  if (path.extname(bin) !== '.cmd') {
    linkBin(`${bin}.cmd`, packageBinPath)
  }
}
