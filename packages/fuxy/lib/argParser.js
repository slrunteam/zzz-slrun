module.exports = { parseArgs, __test__: { parseArg } }

function parseArgs (req) {
  const queryString = req.url.substring(req.path.length + 1)
  return queryString.split('&')
    .map((queryPart) => queryPart.substring(0, queryPart.indexOf('=')))
    .filter((key) => !!key)
    .map((key) => parseArg(key, req.query[key]))
}

function parseArg (key, value) {
  const type = key.split(':')[1]
  if (type === 'num' || type === 'number') {
    return parseNumber(value)
  }
  if (type === 'bool' || type === 'boolean') {
    return parseBoolean(value)
  }
  if (type === 'str' || type === 'string') {
    return `${value}`
  }
  if (type === 'json') {
    return JSON.parse(value)
  }
  return parseGeneral(value)
}

function parseNumber (value) {
  return isNumberValue(value) ? +value : null
}

function parseBoolean (value) {
  return ['true', 'false'].indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() === 'true' : null
}

function parseGeneral (value) {
  if (['true', 'false'].indexOf(value.toLowerCase()) !== -1) {
    return value.toLowerCase() === 'true'
  }
  return isNumberValue(value) ? +value : value
}

function isNumberValue (value) {
  return !isNaN(value)
}
