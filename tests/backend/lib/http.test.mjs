import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { readRequestBody, sendJson, sendText, serveStaticFile } from '../../../backend/lib/http.mjs'

function createMockResponse() {
  return {
    statusCode: null,
    headers: null,
    body: null,
    writeHead(statusCode, headers) {
      this.statusCode = statusCode
      this.headers = headers
    },
    end(body) {
      this.body = body
    }
  }
}

test('readRequestBody concatenates streamed chunks into utf8 text', async () => {
  const request = {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from('hello ')
      yield Buffer.from('world')
    }
  }

  const body = await readRequestBody(request)
  assert.equal(body, 'hello world')
})

test('sendJson writes json content type and serialized payload', () => {
  const response = createMockResponse()
  const payload = { ok: true, message: 'ready' }

  sendJson(response, 201, payload)

  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8')
  assert.equal(response.body, JSON.stringify(payload))
  assert.equal(Number(response.headers['Content-Length']), Buffer.byteLength(response.body))
})

test('sendText writes plain text by default and accepts a custom content type', () => {
  const defaultResponse = createMockResponse()
  sendText(defaultResponse, 200, 'plain text')
  assert.equal(defaultResponse.headers['Content-Type'], 'text/plain; charset=utf-8')
  assert.equal(defaultResponse.body, 'plain text')

  const customResponse = createMockResponse()
  sendText(customResponse, 200, '{"ok":true}', 'application/javascript; charset=utf-8')
  assert.equal(customResponse.headers['Content-Type'], 'application/javascript; charset=utf-8')
})

test('serveStaticFile sets known mime type by extension and sends file content', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'convert-hub-http-'))
  const filePath = path.join(tempDir, 'app.css')
  const response = createMockResponse()

  try {
    await fs.writeFile(filePath, 'body { color: red; }', 'utf8')
    await serveStaticFile(response, filePath)

    assert.equal(response.statusCode, 200)
    assert.equal(response.headers['Content-Type'], 'text/css; charset=utf-8')
    assert.equal(String(response.body), 'body { color: red; }')
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('serveStaticFile falls back to application/octet-stream for unknown extension', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'convert-hub-http-'))
  const filePath = path.join(tempDir, 'payload.binx')
  const response = createMockResponse()

  try {
    await fs.writeFile(filePath, 'binary-like-data', 'utf8')
    await serveStaticFile(response, filePath)

    assert.equal(response.statusCode, 200)
    assert.equal(response.headers['Content-Type'], 'application/octet-stream')
    assert.equal(String(response.body), 'binary-like-data')
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})
