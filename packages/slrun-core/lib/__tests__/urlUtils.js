const { isPrefix, join, relative } = require('../urlUtils')

describe('isPrefix', () => {
  it('should work with root basePath', () => {
    expect(isPrefix('/', '/')).toBe(true)
    expect(isPrefix('/', '/a')).toBe(true)
    expect(isPrefix('/', '/a/')).toBe(true)
  })
  it('should work with non-root basePath', () => {
    expect(isPrefix('/a', '/a')).toBe(true)
    expect(isPrefix('/a', '/a/b')).toBe(true)
    expect(isPrefix('/a', '/a/b/')).toBe(true)
  })
  it('should return false if unmatched basePath', () => {
    expect(isPrefix('/a', '/ab')).toBe(false)
    expect(isPrefix('/ab', '/a')).toBe(false)
    expect(isPrefix('/a', '/')).toBe(false)
  })
  it('should work with query string', () => {
    expect(isPrefix('/', '/?a=b')).toBe(true)
    expect(isPrefix('/a', '/a?b=c')).toBe(true)
  })
})

describe('join', () => {
  it('should work with root basePath', () => {
    expect(join('/', '/')).toBe('/')
    expect(join('/', '/a')).toBe('/a')
    expect(join('/', '/a/')).toBe('/a/')
  })
  it('should work with non-root basePath', () => {
    expect(join('/a', '/')).toBe('/a/')
    expect(join('/a', '/b')).toBe('/a/b')
    expect(join('/a', '/b/')).toBe('/a/b/')
  })
  it('should work with query string', () => {
    expect(join('/', '/?a=b')).toBe('/?a=b')
    expect(join('/a', '/?b=c')).toBe('/a/?b=c')
    expect(join('/a', '/b?c=d')).toBe('/a/b?c=d')
  })
})

describe('relative', () => {
  it('should work with root basePath', () => {
    expect(relative('/', '/')).toBe('/')
    expect(relative('/', '/a')).toBe('/a')
    expect(relative('/', '/a/')).toBe('/a/')
  })
  it('should work with non-root basePath', () => {
    expect(relative('/a', '/a')).toBe('/')
    expect(relative('/a', '/a/b')).toBe('/b')
    expect(relative('/a', '/a/b/')).toBe('/b/')
  })
  it('should return null if unmatched basePath', () => {
    expect(relative('/a', '/ab')).toBeNull()
    expect(relative('/a', '/')).toBeNull()
  })
  it('should work with query string', () => {
    expect(relative('/', '/?a=b')).toBe('/?a=b')
    expect(relative('/a', '/a?b=c')).toBe('/?b=c')
    expect(relative('/a', '/a/b?c=d')).toBe('/b?c=d')
  })
})
