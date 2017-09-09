const spawn = require('cross-spawn')

module.exports = { run, runInBackground }

function run (command, args, options = {}) {
  return new Promise((resolve, reject) =>
    spawn(command, args, Object.assign({ stdio: ['pipe', process.stdout, process.stderr], env: process.env }, options))
      .on('close', resolve)
      .on('error', reject)
  )
}

function runInBackground (command, args, options = {}) {
  spawn(command, args, Object.assign({ detached: true, stdio: 'ignore' }, options))
    .unref()
}
