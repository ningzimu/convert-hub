import axios from 'axios'

export async function fetchSystemStatus() {
  const response = await axios.get('/api/system/status')
  return response.data
}

export async function createShortLink(endpoint, longUrl, shortKey) {
  if (endpoint.startsWith('/')) {
    const response = await axios.post(endpoint, {
      longUrl: btoa(longUrl),
      shortKey: shortKey && shortKey.trim() && shortKey.trim().indexOf('http') < 0 ? shortKey.trim() : ''
    })

    return response.data
  }

  const payload = new FormData()
  payload.append('longUrl', btoa(longUrl))

  if (shortKey && shortKey.trim() && shortKey.trim().indexOf('http') < 0) {
    payload.append('shortKey', shortKey.trim())
  }

  const response = await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/form-data; charset=utf-8'
    }
  })

  return response.data
}

export async function uploadRemoteConfig(endpoint, configText) {
  const payload = new FormData()
  payload.append('config', encodeURIComponent(configText))

  const response = await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/form-data; charset=utf-8'
    }
  })

  return response.data
}
