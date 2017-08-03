const { createProxyServer } = require('http-proxy')

module.exports = function createProxyMiddleware (entry) {
  const proxy = createProxyServer({ target: entry.base })
  return Object.assign(proxy.web.bind(proxy), { upgrade: proxy.ws.bind(proxy) })
}
