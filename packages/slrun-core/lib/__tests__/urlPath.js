const { startsWith, relative, resolve } = require('../urlPath')

describe('startsWith', () => {
  it('should work with root prefix', () => {
    expect(startsWith('/', '/')).toBe(true)
    expect(startsWith('/abc', '/')).toBe(true)
    expect(startsWith('/abc/', '/')).toBe(true)
  })
  it('should work with non-root prefix', () => {
    expect(startsWith('/abc', '/abc')).toBe(true)
    expect(startsWith('/abc/xyz', '/abc')).toBe(true)
    expect(startsWith('/abc/xyz/', '/abc')).toBe(true)
  })
  it('should work with unmatched prefix', () => {
    expect(startsWith('/abcd', '/abc')).toBe(false)
    expect(startsWith('/', '/abc')).toBe(false)
  })
  it('should work with query string', () => {
    expect(startsWith('/?foo=bar', '/')).toBe(true)
    expect(startsWith('/abc?foo=bar', '/abc')).toBe(true)
  })
})

describe('relative', () => {
  it('should work with root base', () => {
    expect(relative('/', '/')).toBe('/')
    expect(relative('/', '/abc')).toBe('/abc')
    expect(relative('/', '/abc/')).toBe('/abc/')
  })
  it('should work with non-root base', () => {
    expect(relative('/abc', '/abc')).toBe('/')
    expect(relative('/abc', '/abc/xyz')).toBe('/xyz')
    expect(relative('/abc', '/abc/xyz/')).toBe('/xyz/')
  })
  it('should work with unmatched base', () => {
    expect(relative('/abc', '/abcd')).toBeNull()
    expect(relative('/abc', '/')).toBeNull()
  })
  it('should work with query string', () => {
    expect(relative('/', '/?foo=bar')).toBe('/?foo=bar')
    expect(relative('/abc', '/abc?foo=bar')).toBe('/?foo=bar')
    expect(relative('/abc', '/abc/xyz?foo=bar')).toBe('/xyz?foo=bar')
  })
})

describe('resolve', () => {
  it('should work with root base', () => {
    expect(resolve('/', '/')).toBe('/')
    expect(resolve('/', '/abc')).toBe('/abc')
    expect(resolve('/', '/abc/')).toBe('/abc/')
  })
  it('should work with non-root base', () => {
    expect(resolve('/abc', '/')).toBe('/abc')
    expect(resolve('/abc', '/xyz')).toBe('/abc/xyz')
    expect(resolve('/abc', '/xyz/')).toBe('/abc/xyz/')
  })
  it('should work with query string', () => {
    expect(resolve('/', '/?foo=bar')).toBe('/?foo=bar')
    expect(resolve('/abc', '/?foo=bar')).toBe('/abc?foo=bar')
    expect(resolve('/abc', '/xyz?foo=bar')).toBe('/abc/xyz?foo=bar')
  })
})
