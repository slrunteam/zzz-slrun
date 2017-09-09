jest.mock('../argParser', () => ({
  parseArgs: jest.fn(() => ['arg1', 'arg2'])
}))

const path = require('path')
const { loadFunction, runFunction, runMiddleware } = require('../funcUtils')
const { parseArgs } = require('../argParser')

describe('loadFunction', () => {
  it('should work with default export', () => {
    expect(loadFunction(path.resolve('example/hello'), null)()).toBe('Hello, World!')
    expect(loadFunction(path.resolve('example/math'), null)(1, 2)).toBe('(x = 1, y = 2)')
  })
  it('should work with named export', () => {
    expect(loadFunction(path.resolve('example/math'), 'add')(1, 2)).toBe(3)
    expect(loadFunction(path.resolve('example/math'), 'default')(1, 2)).toBe('(x = 1, y = 2)')
  })
  it('should throw error if not function', () => {
    expect(loadFunction.bind(null, path.resolve('example/hello'), 'a')).toThrow(/Function not found/)
    expect(loadFunction.bind(null, path.resolve('example/math'), 'a')).toThrow(/Function not found/)
  })
})

describe('runFunction', () => {
  const functionToRun = jest.fn(() => 'result')
  const req = 'req'
  it('should parse req args', async () => {
    await runFunction(functionToRun, req)
    expect(parseArgs.mock.calls.length).toBe(1)
    expect(parseArgs.mock.calls[0]).toEqual(['req'])
  })
  it('should use req args', async () => {
    await runFunction(functionToRun, req)
    expect(functionToRun.mock.calls.length).toBe(1)
    expect(functionToRun.mock.calls[0]).toEqual(['arg1', 'arg2'])
  })
  it('should return the result', async () => {
    const result = await runFunction(functionToRun, req)
    expect(result).toBe('result')
  })
  it('should work with async function', async () => {
    functionToRun.mockImplementationOnce(() => Promise.resolve('asyncResult'))
    const result = await runFunction(functionToRun, req)
    expect(result).toBe('asyncResult')
  })
})

describe('runMiddleware', () => {
  const middleware = jest.fn(() => 'result')
  const fullPath = '/a/b/c'
  const resourcePath = '/b/c'
  const req = {}
  const res = 'res'
  const next = 'next'
  beforeEach(() => {
    req.url = fullPath
  })
  it('should change req.url with querystring', async () => {
    req.url = `${fullPath}?query`
    await runMiddleware(middleware, resourcePath, req, res, next)
    expect(req.url).toBe(`${resourcePath}?query`)
  })
  it('should change req.url without querystring', async () => {
    await runMiddleware(middleware, resourcePath, req, res, next)
    expect(req.url).toBe(resourcePath)
  })
  it('should call middleware with req, res, next', async () => {
    await runMiddleware(middleware, resourcePath, req, res, next)
    expect(middleware.mock.calls.length).toBe(1)
    expect(middleware.mock.calls[0]).toEqual([req, res, next])
  })
  it('should return the result', async () => {
    const result = await runMiddleware(middleware, resourcePath, req, res, next)
    expect(result).toBe('result')
  })
  it('should work with async function', async () => {
    middleware.mockImplementationOnce(() => Promise.resolve('asyncResult'))
    const result = await runMiddleware(middleware, resourcePath, req, res, next)
    expect(result).toBe('asyncResult')
  })
})
