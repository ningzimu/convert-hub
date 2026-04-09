import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

function normalizeStore(data) {
  if (!data || typeof data !== 'object') {
    return { links: {} }
  }

  if (!data.links || typeof data.links !== 'object') {
    return { links: {} }
  }

  return data
}

export class ShortLinkStore {
  constructor(filePath) {
    this.filePath = filePath
    this.state = { links: {} }
  }

  async initialize() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })

    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      this.state = normalizeStore(JSON.parse(raw))
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }

      await this.persist()
    }
  }

  async persist() {
    await fs.writeFile(this.filePath, JSON.stringify(this.state, null, 2), 'utf8')
  }

  generateKey() {
    return crypto.randomBytes(4).toString('base64url').slice(0, 7)
  }

  async create({ longUrl, shortKey }) {
    const desiredKey = shortKey && /^[A-Za-z0-9_-]+$/.test(shortKey) ? shortKey : null
    let key = desiredKey || this.generateKey()

    while (this.state.links[key] && !desiredKey) {
      key = this.generateKey()
    }

    if (this.state.links[key]) {
      const error = new Error('short key already exists')
      error.code = 'DUPLICATE_KEY'
      throw error
    }

    this.state.links[key] = {
      url: longUrl,
      createdAt: new Date().toISOString()
    }

    await this.persist()

    return key
  }

  get(shortKey) {
    return this.state.links[shortKey]?.url || ''
  }
}
