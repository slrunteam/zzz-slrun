jest.mock('http-proxy', () => ({
  createProxyServer: jest.fn(() => {
    return {
      web: jest.fn(() => 'web middleware'),
      ws: jest.fn(() => 'websocket upgrade')
    }
  })
}))
const httpProxy = require('http-proxy')

const createProxyMiddleware = require('../proxy')

describe('createProxyMiddleware', () => {
  it('should return a http-proxy middleware', () => {
    const middleware = createProxyMiddleware({ base: 'base-url-to-proxy' })
    expect(middleware()).toBe('web middleware')
    expect(middleware.upgrade()).toBe('websocket upgrade')
    expect(httpProxy.createProxyServer.mock.calls.length).toBe(1)
    expect(httpProxy.createProxyServer.mock.calls[0][0].target).toBe('base-url-to-proxy')
  })
})
