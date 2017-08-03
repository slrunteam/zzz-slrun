const ecstatic = require('ecstatic')

module.exports = function createStaticMiddleware (entry) {
  return ecstatic({ root: entry.base, showDir: false, cache: 0 })
}
