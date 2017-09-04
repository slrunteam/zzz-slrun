#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')

const monoScripts = require('.')

runScript().catch(console.error)

async function runScript () {
  const rootPackageInfo = await fs.readJson(path.resolve('package.json'))
  const config = rootPackageInfo.config.monoScripts || rootPackageInfo.config.mono
  const exitCode = await monoScripts(process.argv.slice(2), config)
  process.exit(exitCode || 0)
}
