import * as axios from 'axios'

const options = {
  // CN: the server-side needs a full url to work
  baseURL: process.server ? `http://localhost:${process.env.PORT || 3000}/api` : '/api'
}

export default axios.create(options)
