const { getModulePath, getFunctionName, getResourcePath } = require('../pathParser')

describe('getModulePath', () => {
  it('should work with root path', () => {
    expect(getModulePath({ path: '/' })).toBe('/')
    expect(getModulePath({ path: '/~a' })).toBe('/')
    expect(getModulePath({ path: '/!' })).toBe('/')
  })
  it('should work with non-root path', () => {
    expect(getModulePath({ path: '/a' })).toBe('/a')
    expect(getModulePath({ path: '/a/~b' })).toBe('/a')
    expect(getModulePath({ path: '/a/!' })).toBe('/a')
  })
})

describe('getFunctionName', () => {
  it('should work with named export', () => {
    expect(getFunctionName({ path: '/~a' })).toBe('a')
    expect(getFunctionName({ path: '/a/~b' })).toBe('b')
    expect(getFunctionName({ path: '/a/~b/!' })).toBe('b')
  })
  it('should work with default export', () => {
    expect(getFunctionName({ path: '/' })).toBeNull()
    expect(getFunctionName({ path: '/a' })).toBeNull()
    expect(getFunctionName({ path: '/a/!' })).toBeNull()
  })
})

describe('getResourcePath', () => {
  it('should work with root resource path', () => {
    expect(getResourcePath({ path: '/!' })).toBe('/')
    expect(getResourcePath({ path: '/!/' })).toBe('/')
    expect(getResourcePath({ path: '/a/!' })).toBe('/')
    expect(getResourcePath({ path: '/a/!/' })).toBe('/')
  })
  it('should work with non-root resource path', () => {
    expect(getResourcePath({ path: '/!/a' })).toBe('/a')
    expect(getResourcePath({ path: '/a/!/b' })).toBe('/b')
  })
  it('should return null if no resource path', () => {
    expect(getResourcePath({ path: '/' })).toBeNull()
    expect(getResourcePath({ path: '/a' })).toBeNull()
    expect(getResourcePath({ path: '/a/~b' })).toBeNull()
  })
})
