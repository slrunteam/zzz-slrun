const path = require('path')

module.exports = async function monoScripts (argv, config) {
  const command = require(path.join(__dirname, argv[0]))
  return command(config, argv.slice(1))
}
