const path = require('path')
const { getModulePath, getFunctionName, getResourcePath } = require('./pathParser')
const { loadFunction, runFunction, runMiddleware } = require('./funcUtils')

module.exports = function fuxy (options) {
  const { baseDir } = options
  return async (req, res, next) => {
    try {
      const functionToRun = loadFunction(path.join(baseDir, getModulePath(req)), getFunctionName(req))
      const resourcePath = getResourcePath(req)
      const isMiddlewareFunction = !!resourcePath
      if (isMiddlewareFunction) {
        await runMiddleware(functionToRun, resourcePath, req, res, next)
        return
      }
      res.json(await runFunction(functionToRun, req))
    } catch (err) {
      next(err)
    }
  }
}
