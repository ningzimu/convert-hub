import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEngineRequestHeaders, buildEngineRequestPath } from '../../../backend/lib/proxy.mjs'

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

test('buildEngineRequestPath adds the default remote config for /api/sub requests', () => {
  const path = buildEngineRequestPath('/api/sub?target=clash&url=https%3A%2F%2Fexample.com%2Fsub', {
    remoteConfigUrl: 'https://raw.githubusercontent.com/ningzimu/rule_scripts/refs/heads/main/config/acl4ssr_modify.ini'
  })

  const parsed = new URL(path, 'http://127.0.0.1')
  assert.equal(parsed.pathname, '/sub')
  assert.equal(parsed.searchParams.get('target'), 'clash')
  assert.equal(parsed.searchParams.get('url'), 'https://example.com/sub')
  assert.equal(
    parsed.searchParams.get('config'),
    'https://raw.githubusercontent.com/ningzimu/rule_scripts/refs/heads/main/config/acl4ssr_modify.ini'
  )
})

test('buildEngineRequestPath keeps explicit config values and leaves other api paths alone', () => {
  assert.equal(
    buildEngineRequestPath('/api/sub?target=clash&config=https%3A%2F%2Fexample.com%2Fcustom.ini', {
      remoteConfigUrl: 'https://example.com/default.ini'
    }),
    '/sub?target=clash&config=https%3A%2F%2Fexample.com%2Fcustom.ini'
  )

  assert.equal(
    buildEngineRequestPath('/api/version', {
      remoteConfigUrl: 'https://example.com/default.ini'
    }),
    '/version'
  )
})
