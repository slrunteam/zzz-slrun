const express = require('express')

const fuxy = require('..')

module.exports = startServer()

function startServer () {
  const app = express()
  app.use(fuxy({
    baseDir: __dirname
  }))
  app.listen(3000)
  return app
}
