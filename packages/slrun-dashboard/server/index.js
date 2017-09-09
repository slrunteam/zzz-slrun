require('ws')
require('primus-msgpack')
const path = require('path')
const http = require('http')
const express = require('express')
const Primus = require('primus')
const substream = require('substream')
const axios = require('axios')
const bodyParser = require('body-parser')

const nuxtConfig = require('../nuxt.config.js')

module.exports = function createServer (options = {}) {
  const isProd = process.env.NODE_ENV === 'production'
  const { rootDir, decorators = {} } = options
  const app = express()
  const config = Object.assign({}, nuxtConfig, {
    dev: !isProd,
    rootDir
  })
  const { Nuxt, Builder } = isProd ? require('nuxt-start') : require('nuxt')
  const nuxt = new Nuxt(config)
  const httpServer = http.createServer(app)
  const primus = new Primus(httpServer, {
    transformer: 'websockets',
    parser: 'msgpack',
    plugin: { substream }
  })
  primus.save(path.join(__dirname, '../static/socket-client.js'))
  const serviceBySparkId = {}
  primus.on('connection', (spark) => {
    console.log('started connection')
    spark.substream('REPORT_SERVICE').on('data', (service) => { serviceBySparkId[spark.id] = service })
    spark.substream('REPORT_REQUEST').on('data', ({ serviceId, request }) => {
      primus.forEach((sparkToBroadcast) => {
        sparkToBroadcast.substream(`REQUEST@${serviceId}`).write(request)
      })
    })
  })
  primus.on('disconnection', (spark) => {
    console.log('stopped connection')
    delete serviceBySparkId[spark.id]
  })
  if (decorators.dashboard) {
    decorators.dashboard(app, httpServer)
  }
  app.get('/api/services', (req, res) => {
    const services = Object.keys(serviceBySparkId).map((sparkId) => serviceBySparkId[sparkId])
    services.sort((s1, s2) => (s1.id < s2.id) ? -1 : (s1.id > s2.id) ? 1 : 0)
    res.json(services)
  })
  app.get('/api/services/:id', async (req, res, next) => {
    const sparkIdForService = Object.keys(serviceBySparkId).find(
      (sparkId) => serviceBySparkId[sparkId].id === req.params.id)
    if (!sparkIdForService) {
      next()
      return
    }
    const service = serviceBySparkId[sparkIdForService]
    const requests = (await axios.get(`http://127.0.0.1:${service.localPort}/__slrun__/requests`, { params: { clientKey: service.clientKey } })).data
    res.json(Object.assign({}, service, { requests }))
  })
  app.post('/api/replay', bodyParser.json(), async (req, res) => {
    const replayOptions = Object.assign({ maxRedirects: 0, validateStatus: false }, req.body)
    await axios.request(replayOptions)
    res.send('OK')
  })
  app.use(nuxt.render)
  if (config.dev) {
    const builder = new Builder(nuxt)
    builder.build().catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
  return { app, httpServer, primus }
}
