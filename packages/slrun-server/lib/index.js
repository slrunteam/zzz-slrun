const { createProxyServer } = require('http-proxy')
const uuid = require('uuid/v4')
const axios = require('axios')
const onFinished = require('on-finished')
const roundTo = require('round-to')

module.exports = function createServer (options) {
  const serviceHandler = createServiceHandler(options)
  const upgradeHandler = createUpgradeHandler(options)
  return { serviceHandler, upgradeHandler }
}

function createServiceHandler (options) {
  const { api, decorators = {} } = options
  return async (req, res, next) => {
    const createdAt = new Date()
    const startTime = process.hrtime()
    if (!req.path.indexOf('/__slrun__')) {
      next()
      return
    }
    if (req.subdomains.length !== 1) {
      next()
      return
    }
    const service = await api.services.findById(req.subdomains[0])
    if (!service) {
      next()
      return
    }
    setUpReqRes(req, res, service, decorators, createdAt, startTime)
    createProxyServer({ target: service.remoteUrl }).web(req, res, next)
  }
}

function setUpReqRes (req, res, service, decorators, createdAt, startTime) {
  const requestId = uuid()
  req.headers['slrun-service'] = service.id
  res.set('slrun-service', service.id)
  req.headers['slrun-request'] = requestId
  res.set('slrun-request', requestId)
  res.set('Access-Control-Allow-Headers', '*')
  res.set('Access-Control-Allow-Origin', '*')
  const chunks = []
  req.on('data', (chunk) => { chunks.push(chunk) })
  const originalWrite = res.write
  let size = 0
  res.write = function (chunk) {
    size += chunk.length
    originalWrite.apply(res, arguments)
  }
  onFinished(res, () => reportRequest(req, res, service, requestId, createdAt, startTime, chunks, size, decorators))
}

async function reportRequest (req, res, service, requestId, createdAt, startTime, chunks, size, decorators) {
  const diffTime = process.hrtime(startTime)
  const time = roundTo(diffTime[0] * 1e3 + diffTime[1] * 1e-6, 0)
  const { method, originalUrl: url } = req
  const headers = Object.assign({}, req.headers)
  const body = chunks.length ? Buffer.concat(chunks).toString() : undefined
  delete headers['slrun-service']
  delete headers['slrun-request']
  const { statusCode } = res
  if (decorators.server) {
    await decorators.server(service, res)
  }
  axios.post(`${service.remoteUrl}/__slrun__/requests`, {
    id: requestId,
    createdAt,
    reqMethod: method,
    reqUrl: url,
    reqHeaders: headers,
    reqBody: body,
    resStatusCode: statusCode,
    resSize: size,
    resTime: time
  }, { params: { clientKey: service.clientKey } })
}

function createUpgradeHandler (options) {
  const { api } = options
  return async (req, socket, head) => {
    const domain = req.headers.host.split(':')[0]
    const subdomains = domain.split('.').slice(0, -2)
    if (subdomains.length !== 1) {
      return
    }
    const service = await api.services.findById(subdomains[0])
    if (!service) {
      return
    }
    createProxyServer({ target: service.remoteUrl }).ws(req, socket, head)
  }
}
