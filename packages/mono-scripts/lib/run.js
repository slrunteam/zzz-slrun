// BD: inspired from https://github.com/shokai/lerna-run
const path = require('path')

const find = require('./find')
const spawn = require('./spawn')

module.exports = async function run (config, argv) {
  const { packageDir } = config
  const command = argv[0]
  const args = argv.slice(1)
  const packageNames = find(config.packageDir)
  for (const packageName of packageNames) {
    const exitCode = await spawn(command, args, {
      cwd: path.resolve(packageDir, packageName),
      stdio: ['pipe', process.stdout, process.stderr],
      env: process.env
    })
    if (exitCode) {
      return exitCode
    }
  }
  return 0
}
