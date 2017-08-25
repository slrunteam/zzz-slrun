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
  const PrimusSocket = Primus.createSocket({
    transformer: 'websockets',
    parser: 'msgpack',
    plugin: { substream }
  })
  const dashboardClient = dashboardUrl ? new PrimusSocket(dashboardUrl) : null
  if (dashboardClient) {
    dashboardClient.on('open', () => {
      console.log('started connection')
      reportService()
    })
    client.on('create-service', reportService)
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
  const app = express()
  const requests = []
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
      requests.push(req.body)
      res.json('OK')
    })
  })
  if (decorators.client) {
    decorators.client(app)
  }
  app.use(executor)
  const httpServer = http.createServer(app)
  httpServer.on('upgrade', executor.upgrade)
  Object.assign(client, { app, httpServer, dashboardClient, requests })
  httpServer.listen(0, localhost, async () => {
    const sshPoint = (await apiClient.sshPoints.get('/random')).data
    const localPort = httpServer.address().port
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
    Object.assign(client, { tunnel })
    client.emit('create-tunnel')
    // BD: Mac OS X uses the keyboard-interactive mechanism to display a password prompt
    // https://github.com/mscdex/ssh2/issues/238
    if (tunnelAuth.password) {
      tunnel.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
        if (prompts[0].prompt.indexOf('Password:') !== -1) {
          finish([tunnelAuth.password])
        }
      })
    }
    tunnel.on('forward-in', async (remotePort) => {
      const serviceOptions = { name, sshPoint, remotePort }
      const service = (await apiClient.services.post('/', decorators.serviceOptions ? decorators.serviceOptions(serviceOptions) : serviceOptions)).data
      Object.assign(client, { service, localPort })
      client.emit('create-service')
    })
    // BD: TODO reconnect when tunnel is closed
  })
  return client
  function reportService () {
    if (dashboardClient && client.service) {
      const { service: { id, url, clientKey }, localPort } = client
      dashboardClient.substream('REPORT_SERVICE').write({ id, url, localPort, clientKey })
    }
  }
}
