const fuxy = require('fuxy')

module.exports = function createFunctionMiddleware (entry) {
  return fuxy({ baseDir: entry.base })
}
