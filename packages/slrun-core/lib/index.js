const { startsWith, relative, resolve } = require('./urlPath')
const createProxyMiddleware = require('./proxy')
const createStaticMiddleware = require('./static')
const createFunctionMiddleware = require('./function')

module.exports = function createExecutor (context) {
  const entries = context.entries.map((entry) => Object.assign({}, entry, { middleware: createMiddleware(entry) }))
  entries.sort((e1, e2) => (e1.path > e2.path) ? -1 : (e1.path < e2.path) ? 1 : 0)
  return Object.assign(executor, { upgrade })
  function executor (req, res, next) {
    const entry = entries.find((entry) => startsWith(req.url, entry.path))
    if (!entry) {
      next()
      return
    }
    // BD: the below code is just a quick hack to rewrite the url, it is better if all the middlewares can handle
    // baseDir like ecstatic
    req.url = relative(entry.path, req.url)
    const currentSetHeader = res.setHeader
    res.setHeader = (name, value) => {
      return currentSetHeader.call(res, name, name.toLowerCase() === 'location' ? resolve(entry.path, value) : value)
    }
    entry.middleware(req, res, (err) => {
      res.setHeader = currentSetHeader
      next(err)
    })
  }
  function upgrade (req, socket, head) {
    const entry = entries.find((entry) => startsWith(req.url, entry.path))
    if (!entry || !entry.middleware.upgrade) {
      return
    }
    entry.middleware.upgrade(req, socket, head)
  }
}

function createMiddleware (entry) {
  if (entry.mode === 'PROXY') {
    return createProxyMiddleware(entry)
  }
  if (entry.mode === 'STATIC') {
    return createStaticMiddleware(entry)
  }
  if (entry.mode === 'FUNCTION') {
    return createFunctionMiddleware(entry)
  }
  throw new Error(`Unknown mode ${entry.mode}`)
}
