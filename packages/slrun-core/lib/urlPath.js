module.exports = { startsWith, relative, resolve }

function startsWith (urlPath, prefix) {
  if (urlPath.indexOf(prefix)) {
    return false
  }
  if (urlPath.length === prefix.length || prefix === '/') {
    return true
  }
  const nextChar = urlPath.charAt(prefix.length)
  return nextChar === '/' || nextChar === '?'
}

function relative (base, urlPath) {
  if (!startsWith(urlPath, base)) {
    return null
  }
  const relativePath = urlPath.substring(base.length)
  return relativePath.indexOf('/') ? `/${relativePath}` : relativePath
}

function resolve (base, urlPath) {
  const lastPath = urlPath.indexOf('/') ? urlPath : urlPath.substring(1)
  return `${base}${base !== '/' && lastPath && lastPath.indexOf('?') ? '/' : ''}${lastPath}`
}
