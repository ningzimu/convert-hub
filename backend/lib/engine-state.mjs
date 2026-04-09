export class EngineState {
  constructor(mode = 'embedded') {
    this.mode = mode
    this.status = mode === 'embedded' ? 'starting' : 'checking'
    this.message = mode === 'embedded' ? 'engine is warming up' : 'checking external engine'
    this.version = ''
    this.updatedAt = new Date().toISOString()
  }

  markStarting(message = 'engine is warming up') {
    this.status = 'starting'
    this.message = message
    this.updatedAt = new Date().toISOString()
  }

  markReady(version = '') {
    this.status = 'ready'
    this.message = 'engine ready'
    this.version = version
    this.updatedAt = new Date().toISOString()
  }

  markError(message = 'engine unavailable') {
    this.status = 'error'
    this.message = message
    this.updatedAt = new Date().toISOString()
  }

  snapshot() {
    return {
      mode: this.mode,
      status: this.status,
      message: this.message,
      version: this.version,
      updatedAt: this.updatedAt
    }
  }
}
