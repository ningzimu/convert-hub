import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSubscriptionUrl } from '../../../frontend/src/utils/subscription.js'

function createForm(overrides = {}) {
  return {
    sourceSubUrl: 'https://example.com/sub',
    clientType: 'clash',
    customBackend: '/api',
    remoteConfig: '',
    excludeRemarks: '',
    includeRemarks: '',
    filename: '',
    rename: '',
    devid: '',
    interval: '',
    emoji: true,
    nodeList: false,
    tls13: false,
    udp: true,
    xudp: false,
    tfo: false,
    sort: false,
    expand: true,
    scv: false,
    fdn: false,
    appendType: true,
    insert: false,
    new_name: true,
    tpl: {
      surge: { doh: false },
      clash: { doh: false },
      singbox: { ipv6: false }
    },
    ...overrides
  }
}

test('buildSubscriptionUrl encodes Surge presets as target+ver query params', () => {
  const originalWindow = global.window
  global.window = { location: { origin: 'http://127.0.0.1:8090', search: '' } }

  try {
    const url = buildSubscriptionUrl(createForm({ clientType: 'surge&ver=4' }))
    const parsed = new URL(url)

    assert.equal(parsed.searchParams.get('target'), 'surge')
    assert.equal(parsed.searchParams.get('ver'), '4')
  } finally {
    global.window = originalWindow
  }
})
