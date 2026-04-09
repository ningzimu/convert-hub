import http from 'node:http'

export function proxyToEngine(request, response, { host, port }) {
  const proxyRequest = http.request(
    {
      hostname: host,
      port,
      method: request.method,
      path: request.url.replace(/^\/api/, '') || '/',
      headers: {
        ...request.headers,
        host: `${host}:${port}`
      }
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
