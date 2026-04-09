import test from 'node:test'
import assert from 'node:assert/strict'
import { EngineState } from '../../../backend/lib/engine-state.mjs'

test('embedded engine state starts as starting and can transition to ready', () => {
  const state = new EngineState('embedded')

  assert.equal(state.snapshot().status, 'starting')

  state.markReady('subconverter v0.9.9 backend')
  const snapshot = state.snapshot()

  assert.equal(snapshot.status, 'ready')
  assert.equal(snapshot.version, 'subconverter v0.9.9 backend')
  assert.equal(snapshot.message, 'engine ready')
})

test('engine state can report startup errors with message', () => {
  const state = new EngineState('embedded')
  state.markError('startup timed out')

  const snapshot = state.snapshot()

  assert.equal(snapshot.status, 'error')
  assert.equal(snapshot.message, 'startup timed out')
})
