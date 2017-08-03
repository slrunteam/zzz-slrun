module.exports = { startsWith, relative, resolve }

function startsWith (path, prefix) {
  if (path.indexOf(prefix)) {
    return false
  }
  if (path.length === prefix.length || prefix === '/') {
    return true
  }
  const nextChar = path.charAt(prefix.length)
  return nextChar === '/' || nextChar === '?'
}

function relative (base, path) {
  if (!startsWith(path, base)) {
    return null
  }
  const relativePath = path.substring(base.length)
  return relativePath.indexOf('/') ? `/${relativePath}` : relativePath
}

function resolve (base, path) {
  const lastPath = path.indexOf('/') ? path : path.substring(1)
  return `${base}${base !== '/' && lastPath && lastPath.indexOf('?') ? '/' : ''}${lastPath}`
}
