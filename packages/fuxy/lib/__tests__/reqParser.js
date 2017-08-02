const { parsePath, parseArgs, parseArg } = require('../reqParser')

describe('parsePath', () => {
  it('should work with root path and default export', () => {
    expect(parsePath({ path: '/' })).toEqual({ modulePath: '/' })
  })
  it('should work with root path, default export and root req path', () => {
    expect(parsePath({ path: '/!' })).toEqual({ modulePath: '/', reqPath: '/' })
    expect(parsePath({ path: '/!/' })).toEqual({ modulePath: '/', reqPath: '/' })
  })
  it('should work with root path, default export and non-root req path', () => {
    expect(parsePath({ path: '/!/abc' })).toEqual({ modulePath: '/', reqPath: '/abc' })
  })
  it('should work with root path and named export', () => {
    expect(parsePath({ path: '/~abc' })).toEqual({ modulePath: '/', functionName: 'abc' })
  })
  it('should work with root path, named export and root req path', () => {
    expect(parsePath({ path: '/~abc/!' })).toEqual({ modulePath: '/', functionName: 'abc', reqPath: '/' })
    expect(parsePath({ path: '/~abc/!/' })).toEqual({ modulePath: '/', functionName: 'abc', reqPath: '/' })
  })
  it('should work with root path, named export and non-root req path', () => {
    expect(parsePath({ path: '/~abc/!/xyz' })).toEqual({ modulePath: '/', functionName: 'abc', reqPath: '/xyz' })
  })
  it('should work with non-root path and default export', () => {
    expect(parsePath({ path: '/abc' })).toEqual({ modulePath: '/abc' })
  })
  it('should work with non-root path, default export and root req path', () => {
    expect(parsePath({ path: '/abc/!' })).toEqual({ modulePath: '/abc', reqPath: '/' })
    expect(parsePath({ path: '/abc/!/' })).toEqual({ modulePath: '/abc', reqPath: '/' })
  })
  it('should work with non-root path, default export and non-root req path', () => {
    expect(parsePath({ path: '/abc/!/xyz' })).toEqual({ modulePath: '/abc', reqPath: '/xyz' })
  })
  it('should work with non-root path and named export', () => {
    expect(parsePath({ path: '/abc/~xyz' })).toEqual({ modulePath: '/abc', functionName: 'xyz' })
  })
  it('should work with non-root path, named export and root req path', () => {
    expect(parsePath({ path: '/abc/~xyz/!' })).toEqual({ modulePath: '/abc', functionName: 'xyz', reqPath: '/' })
    expect(parsePath({ path: '/abc/~xyz/!/' })).toEqual({ modulePath: '/abc', functionName: 'xyz', reqPath: '/' })
  })
  it('should work with non-root path, named export and non-root req path', () => {
    expect(parsePath({ path: '/abc/~xyz/!/def' })).toEqual({ modulePath: '/abc', functionName: 'xyz', reqPath: '/def' })
  })
})

describe('parseArgs', () => {
  it('should keep argument order', () => {
    expect(parseArgs({ url: '/?x=1&y=2&z=3', path: '/', query: { x: '1', y: '2', z: '3' } })).toEqual([1, 2, 3])
    expect(parseArgs({ url: '/?x=1&y=2&z=3', path: '/', query: { z: '3', x: '1', y: '2' } })).toEqual([1, 2, 3])
    expect(parseArgs({ url: '/?x=1&y=2&z=3', path: '/', query: { y: '2', z: '3', x: '1' } })).toEqual([1, 2, 3])
  })
})

describe('parseArg', () => {
  it('should work with number type', () => {
    expect(parseArg('x:number', '1')).toBe(1)
    expect(parseArg('x:num', '1')).toBe(1)
    expect(parseArg('x:num', '-1')).toBe(-1)
    expect(parseArg('x:num', '0.1')).toBe(0.1)
    expect(parseArg('x:num', '.1')).toBe(0.1)
    expect(parseArg('x:num', 'a')).toBeNull()
  })
  it('should work with boolean type', () => {
    expect(parseArg('x:boolean', 'true')).toBe(true)
    expect(parseArg('x:bool', 'false')).toBe(false)
    expect(parseArg('x:bool', 'a')).toBeNull()
    expect(parseArg('x:bool', '1')).toBeNull()
    expect(parseArg('x:bool', 'tRuE')).toBe(true)
    expect(parseArg('x:bool', 'FaLsE')).toBe(false)
  })
  it('should work with string type', () => {
    expect(parseArg('x:string', 'a')).toBe('a')
    expect(parseArg('x:str', '1')).toBe('1')
    expect(parseArg('x:str', 'true')).toBe('true')
  })
  it('should work with json type', () => {
    expect(parseArg('x:json', '{"a":1,"b":2,"c":3}')).toEqual({ a: 1, b: 2, c: 3 })
    expect(parseArg('x:json', '[1,2,3]')).toEqual([1, 2, 3])
  })
  it('should work with no type', () => {
    expect(parseArg('x', 'true')).toBe(true)
    expect(parseArg('x', 'false')).toBe(false)
    expect(parseArg('x', 'tRuE')).toBe(true)
    expect(parseArg('x', 'FaLsE')).toBe(false)
    expect(parseArg('x', '1')).toBe(1)
    expect(parseArg('x', '-1')).toBe(-1)
    expect(parseArg('x', '0.1')).toBe(0.1)
    expect(parseArg('x', '.1')).toBe(0.1)
    expect(parseArg('x', 'a')).toBe('a')
  })
})
