jest.mock('path', () => ({
  join: jest.fn(() => 'joined-path')
}))
jest.mock('../pathParser', () => ({
  getModulePath: jest.fn(() => 'module-path'),
  getFunctionName: jest.fn(() => 'function-name'),
  getResourcePath: jest.fn(() => null)
}))
jest.mock('../funcUtils', () => ({
  loadFunction: jest.fn(() => 'function'),
  runFunction: jest.fn(() => 'result'),
  runMiddleware: jest.fn()
}))

const path = require('path')
const { getModulePath, getFunctionName, getResourcePath } = require('../pathParser')
const { loadFunction, runFunction, runMiddleware } = require('../funcUtils')
const fuxy = require('..')

describe('fuxy', () => {
  const baseDir = 'base-dir'
  const fuxyMiddleware = fuxy({ baseDir })
  const req = 'req'
  const res = { json: jest.fn() }
  const next = jest.fn()
  it('should call getModulePath', async () => {
    await fuxyMiddleware(req, res, next)
    expect(getModulePath.mock.calls.length).toBe(1)
    expect(getModulePath.mock.calls[0]).toEqual(['req'])
  })
  it('should join baseDir and modulePath', async () => {
    await fuxyMiddleware(req, res, next)
    expect(path.join.mock.calls.length).toBe(1)
    expect(path.join.mock.calls[0]).toEqual([baseDir, 'module-path'])
  })
  it('should call getFunctionName', async () => {
    await fuxyMiddleware(req, res, next)
    expect(getFunctionName.mock.calls.length).toBe(1)
    expect(getFunctionName.mock.calls[0]).toEqual(['req'])
  })
  it('should call loadFunction', async () => {
    await fuxyMiddleware(req, res, next)
    expect(loadFunction.mock.calls.length).toBe(1)
    expect(loadFunction.mock.calls[0]).toEqual(['joined-path', 'function-name'])
  })
  it('should call getResourcePath', async () => {
    await fuxyMiddleware(req, res, next)
    expect(getResourcePath.mock.calls.length).toBe(1)
    expect(getResourcePath.mock.calls[0]).toEqual(['req'])
  })
  it('should call runFunction if there is no resourcePath', async () => {
    await fuxyMiddleware(req, res, next)
    expect(runMiddleware.mock.calls.length).toBe(0)
    expect(runFunction.mock.calls.length).toBe(1)
    expect(runFunction.mock.calls[0]).toEqual(['function', req])
  })
  it('should call runMiddleware if there is resourcePath', async () => {
    getResourcePath.mockImplementationOnce(() => 'resource-path')
    await fuxyMiddleware(req, res, next)
    expect(runFunction.mock.calls.length).toBe(0)
    expect(runMiddleware.mock.calls.length).toBe(1)
    expect(runMiddleware.mock.calls[0]).toEqual(['function', 'resource-path', req, res, next])
  })
  it('should return result as json', async () => {
    await fuxyMiddleware(req, res, next)
    expect(res.json.mock.calls.length).toBe(1)
    expect(res.json.mock.calls[0]).toEqual(['result'])
  })
  it('should call next if error', async () => {
    loadFunction.mockImplementationOnce(() => { throw new Error('reason') })
    await fuxyMiddleware(req, res, next)
    expect(next.mock.calls.length).toBe(1)
    expect(next.mock.calls[0][0]).toMatchObject({ message: 'reason' })
  })
})
