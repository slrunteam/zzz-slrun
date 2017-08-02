const crossSpawn = require('cross-spawn')

module.exports = function spawn (command, args, options) {
  return new Promise((resolve, reject) =>
    crossSpawn(command, args, options)
    .on('close', resolve)
    .on('error', reject)
  )
}
