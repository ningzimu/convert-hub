import http from 'node:http'

const STRIPPED_ENGINE_REQUEST_HEADERS = new Set([
  'referer',
  'upgrade-insecure-requests',
  'x-real-ip'
])

function shouldStripEngineRequestHeader(name) {
  const normalized = name.toLowerCase()
  return normalized.startsWith('x-forwarded-') || STRIPPED_ENGINE_REQUEST_HEADERS.has(normalized)
}

export function buildEngineRequestHeaders(headers, { host, port }) {
  const sanitized = {}

  for (const [name, value] of Object.entries(headers)) {
    if (shouldStripEngineRequestHeader(name)) {
      continue
    }

    sanitized[name] = value
  }

  return {
    ...sanitized,
    host: `${host}:${port}`
  }
}

export function proxyToEngine(request, response, { host, port }) {
  const proxyRequest = http.request(
    {
      hostname: host,
      port,
      method: request.method,
      path: request.url.replace(/^\/api/, '') || '/',
      headers: buildEngineRequestHeaders(request.headers, { host, port })
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers)
      proxyResponse.pipe(response)
    }
  )

  proxyRequest.on('error', () => {
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: 'conversion engine unavailable' }))
  })

  request.pipe(proxyRequest)
}
