const serviceById = {}

module.exports = { create, findById }

function create (options) {
  const { name, sshPoint, remotePort } = options
  const id = name
  const service = {
    id,
    sshPoint,
    url: `http://${id}.lvh.me:3000`,
    remoteUrl: `http://${sshPoint.host}:${remotePort}`
  }
  serviceById[service.id] = service
  return service
}

function findById (id) {
  return serviceById[id]
}
