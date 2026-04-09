import test from 'node:test'
import assert from 'node:assert/strict'
import { EngineRuntime } from '../../../backend/lib/runtime.mjs'

test('waitForReady honors a custom startup timeout before polling the engine', async () => {
  const runtime = new EngineRuntime({
    binaryPath: '/tmp/fake-engine',
    host: '127.0.0.1',
    port: 25500,
    workingDirectory: '/tmp',
    readyTimeoutMs: 10,
    pollIntervalMs: 1
  })

  runtime.process = { exitCode: null }

  const originalDateNow = Date.now
  const originalFetch = global.fetch
  const originalSetTimeout = global.setTimeout
  const timeSequence = [0, 20, 40000]
  let fetchCalls = 0

  Date.now = () => timeSequence.shift() ?? 20
  global.fetch = async () => {
    fetchCalls += 1
    return { ok: false }
  }
  global.setTimeout = (callback) => {
    callback()
    return 0
  }

  try {
    await assert.rejects(runtime.waitForReady(), /engine startup timed out/)
    assert.equal(fetchCalls, 0)
  } finally {
    Date.now = originalDateNow
    global.fetch = originalFetch
    global.setTimeout = originalSetTimeout
  }
})
