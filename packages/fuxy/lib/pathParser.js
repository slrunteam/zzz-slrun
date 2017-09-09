module.exports = { getModulePath, getFunctionName, getResourcePath }

function getModulePath (req) {
  const hasFunctionName = !!getFunctionName(req)
  const functionPathParts = getFunctionPathParts(parsePath(req.path))
  return getModulePathParts(functionPathParts, hasFunctionName).join('/') || '/'
}

function getFunctionName (req) {
  const functionPathParts = getFunctionPathParts(parsePath(req.path))
  const functionNamePart = functionPathParts[functionPathParts.length - 1]
  return functionNamePart.charAt(0) === '~' ? functionNamePart.substring(1) : null
}

function getResourcePath (req) {
  const pathParts = parsePath(req.path)
  const middlewareIndex = getMiddlewareIndex(pathParts)
  return middlewareIndex !== -1 ? `/${pathParts.slice(middlewareIndex + 1, pathParts.length).join('/')}` : null
}

function parsePath (path) {
  return path.split('/')
}

function getFunctionPathParts (pathParts) {
  const middlewareIndex = getMiddlewareIndex(pathParts)
  return middlewareIndex !== -1 ? pathParts.slice(0, middlewareIndex) : pathParts
}

function getMiddlewareIndex (pathParts) {
  return pathParts.findIndex((part) => part === '!')
}

function getModulePathParts (functionPathParts, hasFunctionName) {
  return hasFunctionName ? functionPathParts.slice(0, functionPathParts.length - 1) : functionPathParts
}
