import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { applyEngineProfileOverrides, buildEngineProfileOverrides } from '../../../backend/lib/engine-profile.mjs'

test('buildEngineProfileOverrides maps cache environment variables to toml values', () => {
  const overrides = buildEngineProfileOverrides({
    ENGINE_ENABLE_CACHE: 'false',
    ENGINE_CACHE_SUBSCRIPTION: '0',
    ENGINE_CACHE_CONFIG: '300',
    ENGINE_CACHE_RULESET: '1800',
    ENGINE_SERVE_CACHE_ON_FETCH_FAIL: 'true',
    ENGINE_UPDATE_RULESET_ON_REQUEST: 'true'
  })

  assert.deepEqual(overrides, {
    enable_cache: 'false',
    cache_subscription: '0',
    cache_config: '300',
    cache_ruleset: '1800',
    serve_cache_on_fetch_fail: 'true',
    update_ruleset_on_request: 'true'
  })
})

test('buildEngineProfileOverrides rejects invalid values', () => {
  assert.throws(
    () => buildEngineProfileOverrides({ ENGINE_ENABLE_CACHE: 'maybe' }),
    /invalid ENGINE_ENABLE_CACHE value/
  )

  assert.throws(
    () => buildEngineProfileOverrides({ ENGINE_CACHE_SUBSCRIPTION: '-1' }),
    /invalid ENGINE_CACHE_SUBSCRIPTION value/
  )

  assert.throws(
    () => buildEngineProfileOverrides({ ENGINE_UPDATE_RULESET_ON_REQUEST: 'sometimes' }),
    /invalid ENGINE_UPDATE_RULESET_ON_REQUEST value/
  )
})

test('applyEngineProfileOverrides updates pref.toml before the engine starts', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'convert-hub-engine-profile-'))
  const profilePath = path.join(tempDir, 'pref.toml')

  try {
    await fs.writeFile(profilePath, [
      'enable_cache = true',
      'cache_subscription = 60',
      'cache_config = 300',
      'cache_ruleset = 1800',
      'update_ruleset_on_request = false',
      ''
    ].join('\n'), 'utf8')

    const updatedKeys = await applyEngineProfileOverrides({
      workingDirectory: tempDir,
      env: {
        ENGINE_ENABLE_CACHE: 'false',
        ENGINE_CACHE_SUBSCRIPTION: '0',
        ENGINE_SERVE_CACHE_ON_FETCH_FAIL: 'true',
        ENGINE_UPDATE_RULESET_ON_REQUEST: 'true'
      }
    })

    const content = await fs.readFile(profilePath, 'utf8')

    assert.deepEqual(updatedKeys, [
      'enable_cache',
      'cache_subscription',
      'serve_cache_on_fetch_fail',
      'update_ruleset_on_request'
    ])
    assert.match(content, /^enable_cache = false$/m)
    assert.match(content, /^cache_subscription = 0$/m)
    assert.match(content, /^cache_config = 300$/m)
    assert.match(content, /^serve_cache_on_fetch_fail = true$/m)
    assert.match(content, /^update_ruleset_on_request = true$/m)
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})
