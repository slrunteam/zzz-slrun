const createServer = require('.')

const { httpServer } = createServer()
httpServer.listen(process.env.PORT || 3000)
