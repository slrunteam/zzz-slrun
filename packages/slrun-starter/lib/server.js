const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const createServer = require('slrun-server')

const api = require('./api')

module.exports = startServer()

function startServer () {
  const { serviceHandler, upgradeHandler } = createServer({ api })
  const app = express()
  app.use(serviceHandler)
  app.use(bodyParser.json())
  app.get('/api/ssh-points/random', (req, res) => res.json(api.sshPoints.getRandom()))
  app.post('/api/services', (req, res) => res.json(api.services.create(req.body)))
  const httpServer = http.createServer(app)
  httpServer.on('upgrade', upgradeHandler)
  httpServer.listen(3000)
  return { app, httpServer }
}
