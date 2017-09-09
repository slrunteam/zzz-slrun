const isFunction = require('lodash.isfunction')
const { parseArgs } = require('./argParser')

module.exports = { loadFunction, runFunction, runMiddleware }

function loadFunction (modulePath, functionName) {
  const moduleToRun = require(modulePath)
  const functionToRun = functionName ? moduleToRun[functionName] : (moduleToRun.default || moduleToRun)
  if (!isFunction(functionToRun)) {
    throw new Error(`Function not found for modulePath [${modulePath}] and functionName [${functionName}]`)
  }
  return functionToRun
}

async function runFunction (functionToRun, req) {
  return functionToRun.apply(null, parseArgs(req))
}

async function runMiddleware (middleware, resourcePath, req, res, next) {
  const queryIndex = req.url.indexOf('?')
  const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : ''
  req.url = `${resourcePath}${queryString}`
  return middleware(req, res, next)
}
