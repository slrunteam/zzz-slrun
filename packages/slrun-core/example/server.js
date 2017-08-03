const path = require('path')
const http = require('http')
const express = require('express')

const createExecutor = require('..')

module.exports = startServer()

function startServer () {
  const executor = createExecutor({
    entries: [
      { mode: 'PROXY', path: '/', base: 'http://127.0.0.1:3030' },
      { mode: 'STATIC', path: '/static', base: path.resolve('example/static') },
      { mode: 'FUNCTION', path: '/api', base: path.resolve('../fuxy/example') }
    ]
  })
  const app = express()
  app.use(executor)
  const httpServer = http.createServer(app)
  httpServer.on('upgrade', executor.upgrade)
  httpServer.listen(3000)
  return { app, httpServer }
}
