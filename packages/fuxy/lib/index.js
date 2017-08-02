const path = require('path')
const mime = require('mime-types')

const { parsePath, parseArgs } = require('./reqParser')

module.exports = function fuxy (options) {
  const { baseDir } = options
  return async (req, res, next) => {
    try {
      const { modulePath, functionName, reqPath } = parsePath(req)
      const moduleToRun = require(path.join(baseDir, modulePath))
      const functionToRun = functionName ? moduleToRun[functionName] : (moduleToRun.default || moduleToRun)
      if (reqPath) {
        const queryIndex = req.url.indexOf('?')
        const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : ''
        req.url = `${reqPath}${queryString}`
        res.set({
          'Content-Type': mime.lookup(reqPath) || 'text/plain'
        })
        functionToRun(req, res, next)
        return
      }
      const args = parseArgs(req)
      const result = await functionToRun.apply(null, args)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
