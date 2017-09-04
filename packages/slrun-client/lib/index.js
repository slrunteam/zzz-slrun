require('ws')
require('primus-msgpack')
const http = require('http')
const express = require('express')
const createTunnel = require('reverse-tunnel-ssh')
const { EventEmitter2 } = require('eventemitter2')
const Primus = require('primus')
const substream = require('substream')
const bodyParser = require('body-parser')

const localhost = '127.0.0.1'
const jsonParser = bodyParser.json()

module.exports = function createClient (options) {
  const { name, executor, apiClient, tunnelAuth, dashboardUrl, decorators = {} } = options
  const client = new EventEmitter2()
  createDashboardClient(client, dashboardUrl)
  const app = express()
  const httpServer = http.createServer(app)
  setUpAPIs(app, httpServer, client, executor)
  if (decorators.client) {
    decorators.client(client)
  }
  createSSHTunnel(client, name, apiClient, tunnelAuth, decorators)
  return client
}

function createDashboardClient (client, dashboardUrl) {
  if (!dashboardUrl) {
    return
  }
  const PrimusSocket = Primus.createSocket({
    transformer: 'websockets',
    parser: 'msgpack',
    plugin: { substream }
  })
  const dashboardClient = new PrimusSocket(dashboardUrl)
  Object.assign(client, { dashboardClient })
  dashboardClient.on('open', () => {
    console.log('started connection')
    reportService(client)
  })
  client.on('create-service', () => reportService(client))
  dashboardClient.on('end', () => {
    console.log('stopped connection')
  })
  dashboardClient.on('reconnect', () => {
    console.log('attempting to reconnect')
  })
  dashboardClient.on('error', (err) => {
    console.error(err)
  })
}

function reportService (client) {
  if (!client.service) {
    return
  }
  const { dashboardClient, service: { id, url, clientKey }, localPort } = client
  dashboardClient.substream('REPORT_SERVICE').write({ id, url, localPort, clientKey })
}

function setUpAPIs (app, httpServer, client, executor) {
  Object.assign(client, { app, httpServer, requests: [] })
  app.get('/__slrun__/requests', (req, res) => {
    if (!client.service || client.service.clientKey !== req.query.clientKey) {
      res.status(403).end()
      return
    }
    res.json(client.requests)
  })
  app.post('/__slrun__/requests', (req, res) => {
    if (!client.service || client.service.clientKey !== req.query.clientKey) {
      res.status(403).end()
      return
    }
    jsonParser(req, res, () => {
      client.requests.push(req.body)
      res.json('OK')
    })
  })
  app.use((req, res, next) => {
    if (!req.url.indexOf('/__slrun__')) {
      next()
      return
    }
    executor(req, res, next)
  })
  httpServer.on('upgrade', executor.upgrade)
}

function createSSHTunnel (client, name, apiClient, tunnelAuth, decorators) {
  const { httpServer } = client
  httpServer.listen(0, localhost, async () => {
    const localPort = httpServer.address().port
    const sshPoint = (await apiClient.sshPoints.get('/random')).data
    const tunnelConfig = Object.assign({
      dstHost: '0.0.0.0',
      dstPort: 0,
      srcHost: localhost,
      srcPort: localPort,
      // BD: must set this to use keyboard-interactive, see below
      tryKeyboard: !!tunnelAuth.password
    }, sshPoint, tunnelAuth)
    const tunnel = createTunnel(tunnelConfig, (err) => {
      if (err) {
        throw err
      }
    })
    // BD: Mac OS X uses the keyboard-interactive mechanism to display a password prompt
    // https://github.com/mscdex/ssh2/issues/238
    if (tunnelAuth.password) {
      tunnel.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
        if (prompts[0].prompt.indexOf('Password:') !== -1) {
          finish([tunnelAuth.password])
        }
      })
    }
    Object.assign(client, { localPort, tunnel })
    client.emit('create-tunnel')
    createService(client, name, apiClient, sshPoint, decorators)
  })
}

function createService (client, name, apiClient, sshPoint, decorators) {
  const { tunnel } = client
  tunnel.on('forward-in', async (remotePort) => {
    const serviceOptions = { name, sshPoint, remotePort }
    try {
      const service = (await apiClient.services.post('/register', decorators.serviceOptions ? decorators.serviceOptions(serviceOptions) : serviceOptions)).data
      Object.assign(client, { service })
      client.emit('create-service')
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })
}
