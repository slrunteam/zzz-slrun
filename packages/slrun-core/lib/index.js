const urlUtils = require('./urlUtils')
const createProxyMiddleware = require('./proxy')
const createStaticMiddleware = require('./static')
const createFunctionMiddleware = require('./function')

module.exports = Object.assign(createExecutor, { __test__: findEntry, createEntries, createMiddleware })

function createExecutor (options) {
  const entries = createEntries(options)
  return Object.assign(executor, { upgrade })
  function executor (req, res, next) {
    if (!req.url.indexOf('/__slrun__')) {
      next()
      return
    }
    const entry = findEntry(entries, req.url)
    if (!entry) {
      next()
      return
    }
    // BD: the below code is just a quick hack to rewrite the url, it is better if all middlewares can handle baseDir like ecstatic
    const originalUrl = req.url
    req.url = urlUtils.relative(entry.path, req.url)
    const originalSetHeader = res.setHeader
    res.setHeader = (name, value) => {
      return originalSetHeader.call(res, name, name.toLowerCase() === 'location' ? urlUtils.join(entry.path, value) : value)
    }
    entry.middleware(req, res, (err) => {
      req.url = originalUrl
      res.setHeader = originalSetHeader
      next(err)
    })
  }
  function upgrade (req, socket, head) {
    const entry = findEntry(entries, req.url)
    if (!entry || !entry.middleware.upgrade) {
      return
    }
    entry.middleware.upgrade(req, socket, head)
  }
}

function findEntry (entries, url) {
  return entries.find((entry) => urlUtils.isPrefix(entry.path, url))
}

function createEntries (options) {
  const entries = options.entries.map((entry) => Object.assign({}, entry, { middleware: createMiddleware(entry) }))
  entries.sort((e1, e2) => (e1.path > e2.path) ? -1 : (e1.path < e2.path) ? 1 : 0)
  return entries
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
