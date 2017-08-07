const path = require('path')
const parseProcessArgv = require('yargs-parser')

module.exports = function parseOptions (processArgv) {
  const argv = parseProcessArgv(processArgv, {
    alias: {
      proxy: 'p',
      static: 's',
      function: 'f'
    }
  })
  const { name = path.basename(process.cwd()) } = argv
  return {
    name,
    entries: parseEntries(argv)
  }
}

function parseEntries (argv) {
  return Object.keys(argv)
    .map((key) => {
      const values = isArray(argv[key]) ? argv[key] : [argv[key]]
      if (key === 'proxy') {
        return values.map((value) => createUrlEntry(value, 'PROXY'))
      }
      if (key === 'static') {
        return values.map((value) => createPathEntry(value, 'STATIC'))
      }
      if (key === 'function') {
        return values.map((value) => createPathEntry(value, 'FUNCTION'))
      }
      return null
    })
    .reduce((entries, subEntries) => {
      if (subEntries) {
        subEntries.forEach((subEntry) => {
          if (subEntry) {
            entries.push(subEntry)
          }
        })
      }
      return entries
    }, [])
}

function createUrlEntry (value, mode) {
  if (isNumber(value)) {
    return { mode, path: '/', base: normalizeUrl(`127.0.0.1:${value}`) }
  }
  const parts = value.split(':')
  if (parts.length === 1) {
    return { mode, path: '/', base: normalizeUrl(parts[0]) }
  }
  return { mode, path: normalizeEntryPath(parts[0]), base: normalizeUrl(parts[1]) }
}

function createPathEntry (value, mode) {
  const parts = value.split(':')
  if (parts.length === 1) {
    return { mode, path: '/', base: normalizePath(parts[0]) }
  }
  return { mode, path: normalizeEntryPath(parts[0]), base: normalizePath(parts[1]) }
}

function isArray (value) {
  return Object.prototype.toString.call(value) === '[object Array]'
}

function isNumber (value) {
  return typeof value === 'number'
}

function normalizeEntryPath (path) {
  return path.indexOf('/') ? `/${path}` : path
}

function normalizeUrl (url) {
  return url.indexOf('http') ? `http://${url}` : url
}

function normalizePath (pathSegment) {
  return path.resolve(pathSegment)
}
