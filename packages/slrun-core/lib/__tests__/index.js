jest.mock('../proxy', () => jest.fn(() => jest.fn(() => 'proxy-middleware')))
jest.mock('../static', () => jest.fn(() => jest.fn(() => 'static-middleware')))
jest.mock('../function', () => jest.fn(() => jest.fn(() => 'function-middleware')))

const urlUtils = require('../urlUtils')
const createProxyMiddleware = require('../proxy')
const createStaticMiddleware = require('../static')
const createFunctionMiddleware = require('../function')
const createExecutor = require('..')

const { __test__: findEntry, createEntries, createMiddleware } = createExecutor
const options = {
  entries: [
    { mode: 'PROXY', path: '/a/b' },
    { mode: 'STATIC', path: '/b' },
    { mode: 'FUNCTION', path: '/a' }
  ]
}

describe('createExecutor', () => {
  const res = 'res'
  const next = jest.fn()
  const socket = 'socket'
  const head = 'head'
  const upgrade = jest.fn()
  it('should skip if url starts with /__slrun__', () => {
    const executor = createExecutor(options)
    executor({ url: '/__slrun__/a' }, res, next)
    expect(next.mock.calls.length).toBe(1)
    expect(next.mock.calls[0].length).toBe(0)
  })
  it('should skip if entry not found', () => {
    const executor = createExecutor(options)
    executor({ url: '/c' }, res, next)
    expect(next.mock.calls.length).toBe(1)
    expect(next.mock.calls[0]).toEqual([])
  })
  it('should call middleware', () => {
    const middleware = jest.fn()
    createProxyMiddleware.mockImplementationOnce(() => middleware)
    const executor = createExecutor(options)
    const req = { url: '/a/b/c' }
    executor(req, res, next)
    expect(middleware.mock.calls.length).toBe(1)
    expect(middleware.mock.calls[0][0]).toEqual(req)
    expect(middleware.mock.calls[0][1]).toEqual(res)
  })
  it('should change req.url before middleware', () => {
    const relative = jest.spyOn(urlUtils, 'relative')
    const executor = createExecutor(options)
    const req = { url: '/a/b/c' }
    executor(req, res, next)
    expect(relative.mock.calls.length).toBe(1)
    expect(relative.mock.calls[0]).toEqual(['/a/b', '/a/b/c'])
    expect(req.url).toBe('/c')
  })
  it('should change req.url back if middleware skips', () => {
    createProxyMiddleware.mockImplementationOnce(() => (_req, _res, _next) => { _next() })
    const executor = createExecutor(options)
    const req = { url: '/a/b/c' }
    executor(req, res, next)
    expect(req.url).toBe('/a/b/c')
  })
  it('should change res.setHeader before middleware', () => {
    const setHeader = jest.fn()
    const resWithSetHeader = { setHeader }
    const executor = createExecutor(options)
    executor({ url: '/a/b/c' }, resWithSetHeader, next)
    resWithSetHeader.setHeader('a', 'b')
    resWithSetHeader.setHeader('location', '/d')
    expect(setHeader.mock.calls.length).toBe(2)
    expect(setHeader.mock.calls[0]).toEqual(['a', 'b'])
    expect(setHeader.mock.calls[1]).toEqual(['location', '/a/b/d'])
  })
  it('should change res.setHeader back if middleware skips', () => {
    createProxyMiddleware.mockImplementationOnce(() => (_req, _res, _next) => { _next() })
    const setHeader = jest.fn()
    const resWithSetHeader = { setHeader }
    const executor = createExecutor(options)
    executor({ url: '/a/b/c' }, resWithSetHeader, next)
    resWithSetHeader.setHeader('a', 'b')
    resWithSetHeader.setHeader('location', '/d')
    expect(setHeader.mock.calls.length).toBe(2)
    expect(setHeader.mock.calls[0]).toEqual(['a', 'b'])
    expect(setHeader.mock.calls[1]).toEqual(['location', '/d'])
  })
  it('should pass error from middleware', () => {
    createProxyMiddleware.mockImplementationOnce(() => (_req, _res, _next) => { _next('error') })
    const executor = createExecutor(options)
    executor({ url: '/a/b/c' }, res, next)
    expect(next.mock.calls.length).toBe(1)
    expect(next.mock.calls[0]).toEqual(['error'])
  })
  it('should create upgrade', () => {
    const executor = createExecutor(options)
    expect(executor.upgrade).toBeDefined()
  })
  it('should call middleware upgrade if available', () => {
    createProxyMiddleware.mockImplementationOnce(() => ({ upgrade }))
    const executor = createExecutor(options)
    const upgradeReq = { url: '/a/b/c' }
    executor.upgrade(upgradeReq, socket, head)
    expect(upgrade.mock.calls.length).toBe(1)
    expect(upgrade.mock.calls[0]).toEqual([upgradeReq, socket, head])
  })
  it('should skip upgrade if entry not found', () => {
    createProxyMiddleware.mockImplementationOnce(() => ({ upgrade }))
    const executor = createExecutor(options)
    executor.upgrade({ url: '/c' }, socket, head)
    expect(upgrade.mock.calls.length).toBe(0)
  })
  it('should skip upgrade if middleware does not have upgrade', () => {
    createProxyMiddleware.mockImplementationOnce(() => ({ upgrade }))
    const executor = createExecutor(options)
    executor.upgrade({ url: '/a/d' }, socket, head)
    expect(upgrade.mock.calls.length).toBe(0)
  })
})

describe('findEntry', () => {
  const entries = createEntries(options)
  it('should check entry path and url', () => {
    const isPrefix = jest.spyOn(urlUtils, 'isPrefix')
    const entry = findEntry(entries, '/a/b/c')
    expect(isPrefix.mock.calls.length).toBe(2)
    expect(isPrefix.mock.calls[0]).toEqual(['/b', '/a/b/c'])
    expect(isPrefix.mock.calls[1]).toEqual(['/a/b', '/a/b/c'])
    expect(entry).toEqual(entries[1])
  })
  it('should return undefined if entry not found', () => {
    const isPrefix = jest.spyOn(urlUtils, 'isPrefix')
    const entry = findEntry(entries, '/c')
    expect(isPrefix.mock.calls.length).toBe(3)
    expect(isPrefix.mock.calls[0]).toEqual(['/b', '/c'])
    expect(isPrefix.mock.calls[1]).toEqual(['/a/b', '/c'])
    expect(isPrefix.mock.calls[2]).toEqual(['/a', '/c'])
    expect(entry).toBeUndefined()
  })
})

describe('createEntries', () => {
  it('should create entries with middlewares', () => {
    const entries = createEntries(options)
    expect(entries.length).toBe(3)
    expect(createProxyMiddleware.mock.calls.length).toBe(1)
    expect(createProxyMiddleware.mock.calls[0]).toEqual([options.entries[0]])
    expect(entries.find((entry) => entry.mode === 'PROXY').middleware()).toBe('proxy-middleware')
    expect(createStaticMiddleware.mock.calls.length).toBe(1)
    expect(createStaticMiddleware.mock.calls[0]).toEqual([options.entries[1]])
    expect(entries.find((entry) => entry.mode === 'STATIC').middleware()).toBe('static-middleware')
    expect(createFunctionMiddleware.mock.calls.length).toBe(1)
    expect(createFunctionMiddleware.mock.calls[0]).toEqual([options.entries[2]])
    expect(entries.find((entry) => entry.mode === 'FUNCTION').middleware()).toBe('function-middleware')
  })
  it('should order entries by path descending', () => {
    const entries = createEntries({
      entries: options.entries.concat(options.entries)
    })
    for (let i = 0; i < entries.length - 1; ++i) {
      expect(entries[i].path >= entries[i + 1].path).toBe(true)
    }
  })
})

describe('createMiddleware', () => {
  it('should create a proxy middleware with mode PROXY', () => {
    const entry = { mode: 'PROXY' }
    const middleware = createMiddleware(entry)
    expect(middleware()).toBe('proxy-middleware')
    expect(createProxyMiddleware.mock.calls.length).toBe(1)
    expect(createProxyMiddleware.mock.calls[0]).toEqual([entry])
  })
  it('should create a static middleware with mode STATIC', () => {
    const entry = { mode: 'STATIC' }
    const middleware = createMiddleware(entry)
    expect(middleware()).toBe('static-middleware')
    expect(createStaticMiddleware.mock.calls.length).toBe(1)
    expect(createStaticMiddleware.mock.calls[0]).toEqual([entry])
  })
  it('should create a function middleware with mode FUNCTION', () => {
    const entry = { mode: 'FUNCTION' }
    const middleware = createMiddleware(entry)
    expect(middleware()).toBe('function-middleware')
    expect(createFunctionMiddleware.mock.calls.length).toBe(1)
    expect(createFunctionMiddleware.mock.calls[0]).toEqual([entry])
  })
  it('should throw an error if unknown mode', () => {
    expect(() => createMiddleware({ mode: 'UNKNOWN' })).toThrow(/Unknown mode/)
  })
})
