jest.mock('ecstatic', () => jest.fn(() => 'ecstatic middleware'))
const ecstatic = require('ecstatic')

const createStaticMiddleware = require('../static')

describe('createStaticMiddleware', () => {
  it('should return an ecstatic middleware', () => {
    const middleware = createStaticMiddleware({ base: 'path-to-base-dir' })
    expect(middleware).toBe('ecstatic middleware')
    expect(ecstatic.mock.calls.length).toBe(1)
    expect(ecstatic.mock.calls[0][0].root).toBe('path-to-base-dir')
    expect(ecstatic.mock.calls[0][0].showDir).toBe(false)
    expect(ecstatic.mock.calls[0][0].cache).toBe(0)
  })
})
