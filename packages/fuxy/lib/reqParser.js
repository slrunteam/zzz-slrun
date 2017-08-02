module.exports = { parsePath, parseArgs, parseArg }

function parsePath (req) {
  const pathParts = req.path.split('/')
  const middlewareIndex = pathParts.findIndex((part) => part === '!')
  const reqPath = middlewareIndex !== -1 ? `/${pathParts.slice(middlewareIndex + 1, pathParts.length).join('/')}`
    : undefined
  const functionPathParts = middlewareIndex !== -1 ? pathParts.slice(0, middlewareIndex) : pathParts
  const functionNamePart = functionPathParts[functionPathParts.length - 1]
  if (functionNamePart.charAt(0) === '~') {
    return {
      modulePath: functionPathParts.slice(0, functionPathParts.length - 1).join('/') || '/',
      functionName: functionNamePart.substring(1),
      reqPath
    }
  }
  return { modulePath: functionPathParts.join('/') || '/', reqPath }
}

function parseArgs (req) {
  const queryString = req.url.substring(req.path.length + 1)
  const keys = queryString.split('&')
    .map((queryPart) => queryPart.substring(0, queryPart.indexOf('=')))
    .filter((key) => !!key)
  return keys.map((key) => parseArg(key, req.query[key]))
}

function parseArg (key, value) {
  const type = key.split(':')[1]
  if (type === 'num' || type === 'number') {
    return !isNaN(value) ? +value : null
  }
  if (type === 'bool' || type === 'boolean') {
    return ['true', 'false'].indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() === 'true' : null
  }
  if (type === 'str' || type === 'string') {
    return `${value}`
  }
  if (type === 'json') {
    return JSON.parse(value)
  }
  if (['true', 'false'].indexOf(value.toLowerCase()) !== -1) {
    return value.toLowerCase() === 'true'
  }
  return !isNaN(value) ? +value : value
}
