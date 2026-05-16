import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEngineRequestHeaders } from '../../../backend/lib/proxy.mjs'

test('buildEngineRequestHeaders strips proxy chain headers before calling the engine', () => {
  const headers = buildEngineRequestHeaders({
    host: 'convert-hub.ningzimu.com',
    'user-agent': 'clash-verge/v2.4.7',
    referer: 'https://convert-hub.ningzimu.com/s/iiNmAw',
    'upgrade-insecure-requests': '1',
    'x-real-ip': '127.0.0.1',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'convert-hub.ningzimu.com:80',
    'x-forwarded-proto': 'http'
  }, {
    host: '127.0.0.1',
    port: 25500
  })

  assert.deepEqual(headers, {
    host: '127.0.0.1:25500',
    'user-agent': 'clash-verge/v2.4.7'
  })
})
