const axios = require('axios')
const createExecutor = require('slrun-core')
const createClient = require('slrun-client')
const parseOptions = require('slrun-client/lib/parseOptions')

const config = require('./config')

const apiBaseUrl = 'http://127.0.0.1:3000/api'
const apiClient = {
  sshPoints: axios.create({ baseURL: `${apiBaseUrl}/ssh-points` }),
  services: axios.create({ baseURL: `${apiBaseUrl}/services` })
}
const tunnelAuth = {
  username: config.SSH_USERNAME,
  password: config.SSH_PASSWORD
}
const dashboardUrl = config.DASHBOARD_URL

module.exports = startClient()

function startClient () {
  const { name, entries } = parseOptions(process.argv.slice(2))
  const executor = createExecutor({ entries })
  const client = createClient({ name, executor, apiClient, tunnelAuth, dashboardUrl })
  client.on('create-service', () => {
    console.log(client.service)
  })
  return client
}
