import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { ShortLinkStore } from '../../../backend/lib/shortlinks.mjs'

async function createTempStorePath() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'convert-hub-shortlinks-'))
  return {
    tempDir,
    storePath: path.join(tempDir, 'shortlinks.json')
  }
}

test('initialize creates an empty store file when none exists', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await store.initialize()

    const raw = await fs.readFile(storePath, 'utf8')
    const parsed = JSON.parse(raw)

    assert.deepEqual(parsed, { links: {} })
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('initialize normalizes invalid store shape to an empty links object', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await fs.writeFile(storePath, JSON.stringify({ links: 'invalid' }), 'utf8')
    await store.initialize()

    assert.deepEqual(store.state, { links: {} })
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('create stores a valid custom short key and get resolves the long URL', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await store.initialize()

    const key = await store.create({
      longUrl: 'https://example.com/subscription',
      shortKey: 'my_custom_key'
    })

    assert.equal(key, 'my_custom_key')
    assert.equal(store.get('my_custom_key'), 'https://example.com/subscription')
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('create rejects duplicate custom short keys with DUPLICATE_KEY', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await store.initialize()
    await store.create({ longUrl: 'https://example.com/a', shortKey: 'dup_key' })

    await assert.rejects(
      store.create({ longUrl: 'https://example.com/b', shortKey: 'dup_key' }),
      (error) => error?.code === 'DUPLICATE_KEY'
    )
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('create falls back to generated key when custom short key contains invalid characters', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await store.initialize()
    store.generateKey = () => 'auto_key_1'

    const key = await store.create({
      longUrl: 'https://example.com/invalid-shortkey',
      shortKey: 'not valid!'
    })

    assert.equal(key, 'auto_key_1')
    assert.equal(store.get('auto_key_1'), 'https://example.com/invalid-shortkey')
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('create retries generated key when collision happens', async () => {
  const { tempDir, storePath } = await createTempStorePath()
  const store = new ShortLinkStore(storePath)

  try {
    await store.initialize()
    store.generateKey = () => 'fixed'
    await store.create({ longUrl: 'https://example.com/first' })

    let attempts = 0
    store.generateKey = () => {
      attempts += 1
      return attempts === 1 ? 'fixed' : 'second'
    }

    const key = await store.create({ longUrl: 'https://example.com/second' })
    assert.equal(key, 'second')
    assert.equal(store.get('second'), 'https://example.com/second')
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})
