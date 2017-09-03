jest.mock('fuxy', () => jest.fn(() => 'fuxy-middleware'))
const fuxy = require('fuxy')

const createFunctionMiddleware = require('../function')

describe('createFunctionMiddleware', () => {
  it('should return a fuxy middleware', () => {
    const middleware = createFunctionMiddleware({ base: 'path-to-base-dir' })
    expect(middleware).toBe('fuxy-middleware')
    expect(fuxy.mock.calls.length).toBe(1)
    expect(fuxy.mock.calls[0][0]).toEqual({ baseDir: 'path-to-base-dir' })
  })
})
