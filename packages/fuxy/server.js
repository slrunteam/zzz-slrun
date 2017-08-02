const path = require('path')
const express = require('express')

const fuxy = require('.')

module.exports = startServer()

function startServer () {
  const app = express()
  app.use(fuxy({
    baseDir: path.join(__dirname, 'example')
  }))
  app.listen(3000)
  return app
}
