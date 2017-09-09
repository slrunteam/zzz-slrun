module.exports = { isPrefix, join, relative }

function isPrefix (basePath, urlPath) {
  return !getMainPath(urlPath).indexOf(getMainPath(basePath))
}

function join (basePath, urlPath) {
  return `${getMainPath(basePath)}${urlPath.substring(1)}`
}

function relative (basePath, urlPath) {
  if (!isPrefix(basePath, urlPath)) {
    return null
  }
  const relativePath = urlPath.substring(basePath.length)
  return relativePath.indexOf('/') ? `/${relativePath}` : relativePath
}

function getMainPath (urlPath) {
  const parts = urlPath.split('?')[0].split('/')
  if (parts[parts.length - 1].length) {
    parts.push('')
  }
  return parts.join('/')
}
