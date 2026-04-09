import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'

export class EngineRuntime {
  constructor({ binaryPath, host, port, workingDirectory, readyTimeoutMs = 180000, pollIntervalMs = 500 }) {
    this.binaryPath = binaryPath
    this.host = host
    this.port = port
    this.workingDirectory = workingDirectory
    this.readyTimeoutMs = readyTimeoutMs
    this.pollIntervalMs = pollIntervalMs
    this.process = null
  }

  async start() {
    await fs.access(this.binaryPath)
    this.process = spawn(this.binaryPath, [], {
      cwd: this.workingDirectory,
      env: {
        ...process.env,
        PORT: String(this.port)
      },
      stdio: 'inherit'
    })

    this.process.on('exit', (code, signal) => {
      console.error(`engine exited with code=${code} signal=${signal}`)
    })

    await this.waitForReady()
  }

  async stop() {
    if (!this.process) {
      return
    }

    this.process.kill('SIGTERM')
  }

  async waitForReady() {
    const deadline = Date.now() + this.readyTimeoutMs
    const target = `http://${this.host}:${this.port}/version`

    while (Date.now() < deadline) {
      if (this.process?.exitCode !== null && this.process?.exitCode !== undefined) {
        throw new Error(`engine exited before becoming ready (exit code ${this.process.exitCode})`)
      }

      try {
        const response = await fetch(target)
        if (response.ok) {
          return
        }
      } catch (error) {
        // Engine is still starting.
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs))
    }

    throw new Error('engine startup timed out')
  }
}
