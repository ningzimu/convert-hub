import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './lib/config.mjs'
import { sendJson, sendText, readRequestBody, serveStaticFile } from './lib/http.mjs'
import { proxyToEngine } from './lib/proxy.mjs'
import { EngineRuntime } from './lib/runtime.mjs'
import { ShortLinkStore } from './lib/shortlinks.mjs'
import { EngineState } from './lib/engine-state.mjs'

const engine = config.engineMode === 'embedded'
  ? new EngineRuntime({
      binaryPath: config.engineBinaryPath,
      host: config.engineHost,
      port: config.enginePort,
      workingDirectory: config.engineWorkingDirectory,
      readyTimeoutMs: config.engineReadyTimeoutMs
    })
  : null

const shortLinks = new ShortLinkStore(config.shortLinkStorePath)
const engineState = new EngineState(config.engineMode)

async function fetchEngineVersionText() {
  const response = await fetch(`http://${config.engineHost}:${config.enginePort}/version`)
  if (!response.ok) {
    throw new Error(`engine version request failed with status ${response.status}`)
  }

  return response.text()
}

async function bootstrapEmbeddedEngine() {
  if (!engine) {
    return
  }

  engineState.markStarting()

  try {
    await engine.start()
    const version = await fetchEngineVersionText()
    engineState.markReady(version.trim())
  } catch (error) {
    engineState.markError(error.message || 'engine startup failed')
    console.error(error)
  }
}

async function bootstrapExternalEngine() {
  try {
    const version = await fetchEngineVersionText()
    engineState.markReady(version.trim())
  } catch (error) {
    engineState.markError(error.message || 'external engine unavailable')
  }
}

function buildPublicOrigin(request) {
  const protoHeader = request.headers['x-forwarded-proto']
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || 'http'
  return `${protocol}://${request.headers.host}`
}

function parseShortLinkPayload(rawBody, contentType) {
  if (contentType.includes('application/json')) {
    const parsed = JSON.parse(rawBody || '{}')
    return {
      longUrl: parsed.longUrl || '',
      shortKey: parsed.shortKey || ''
    }
  }

  const params = new URLSearchParams(rawBody)
  return {
    longUrl: params.get('longUrl') || '',
    shortKey: params.get('shortKey') || ''
  }
}

function renderRuntimeConfig() {
  return `window.__CONFIG__ = ${JSON.stringify({
    ...config.staticConfig,
    REMOTE_CONFIG_URL: config.remoteConfigUrl
  }, null, 2)};\n`
}

async function handleShortLinkCreation(request, response) {
  const rawBody = await readRequestBody(request)
  const contentType = String(request.headers['content-type'] || '')
  const payload = parseShortLinkPayload(rawBody, contentType)
  const encodedLongUrl = payload.longUrl || ''

  if (!encodedLongUrl) {
    sendJson(response, 400, { Code: 0, Message: 'invalid parameters' })
    return
  }

  let longUrl = encodedLongUrl

  if (!encodedLongUrl.startsWith('http://') && !encodedLongUrl.startsWith('https://')) {
    try {
      const decoded = Buffer.from(encodedLongUrl, 'base64').toString('utf8')
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        longUrl = decoded
      }
    } catch (error) {
      longUrl = encodedLongUrl
    }
  }

  try {
    new URL(longUrl)
  } catch (error) {
    sendJson(response, 400, { Code: 0, Message: 'invalid long URL' })
    return
  }

  try {
    const key = await shortLinks.create({
      longUrl,
      shortKey: payload.shortKey
    })

    sendJson(response, 200, {
      Code: 1,
      ShortUrl: `${buildPublicOrigin(request)}/s/${key}`
    })
  } catch (error) {
    if (error.code === 'DUPLICATE_KEY') {
      sendJson(response, 200, {
        Code: 0,
        Message: 'short key already exists'
      })
      return
    }

    sendJson(response, 500, {
      Code: 0,
      Message: 'failed to create short URL'
    })
  }
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, 'http://127.0.0.1')

  if (requestUrl.pathname === '/healthz') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (requestUrl.pathname === '/config.js') {
    sendText(response, 200, renderRuntimeConfig(), 'application/javascript; charset=utf-8')
    return
  }

  if (requestUrl.pathname === '/api/system/status') {
    sendJson(response, 200, {
      engine: engineState.snapshot(),
      shortlinks: { status: 'ready' }
    })
    return
  }

  if (requestUrl.pathname.startsWith('/api')) {
    if (config.engineMode === 'embedded' && engineState.snapshot().status !== 'ready') {
      sendJson(response, 503, {
        error: 'conversion engine warming up',
        engine: engineState.snapshot()
      })
      return
    }

    proxyToEngine(request, response, {
      host: config.engineHost,
      port: config.enginePort
    })
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/s/short') {
    await handleShortLinkCreation(request, response)
    return
  }

  if ((request.method === 'GET' || request.method === 'HEAD') && requestUrl.pathname.startsWith('/s/')) {
    const shortKey = requestUrl.pathname.slice('/s/'.length)
    const longUrl = shortLinks.get(shortKey)

    if (!longUrl) {
      sendJson(response, 404, {
        Code: 0,
        Message: 'short URL not found'
      })
      return
    }

    response.writeHead(301, { Location: longUrl })
    response.end()
    return
  }

  const relativePath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname
  const filePath = path.join(config.staticDir, relativePath)

  try {
    const stats = await fs.stat(filePath)
    if (stats.isFile()) {
      await serveStaticFile(response, filePath)
      return
    }
  } catch (error) {
    // fall through to SPA index
  }

  await serveStaticFile(response, path.join(config.staticDir, 'index.html'))
}

async function bootstrap() {
  await shortLinks.initialize()

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error(error)
      sendJson(response, 500, { error: 'internal server error' })
    })
  })

  server.listen(config.port, () => {
    console.log(`convert hub listening on :${config.port}`)
  })

  if (engine) {
    void bootstrapEmbeddedEngine()
  } else {
    console.log(`using external engine at http://${config.engineHost}:${config.enginePort}`)
    void bootstrapExternalEngine()
  }

  const shutdown = async () => {
    if (engine) {
      await engine.stop()
    }
    server.close(() => process.exit(0))
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
