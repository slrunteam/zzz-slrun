const uuid = require('uuid/v4')

const serviceById = {}

module.exports = { create, findById }

function create (options) {
  const { name, sshPoint, remotePort } = options
  const id = name
  const clientKey = uuid()
  const service = {
    id,
    sshPoint,
    url: `http://${id}.lvh.me:3000`,
    remoteUrl: `http://${sshPoint.host}:${remotePort}`,
    clientKey
  }
  serviceById[service.id] = service
  return service
}

function findById (id) {
  return serviceById[id]
}
