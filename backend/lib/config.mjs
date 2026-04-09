import path from 'node:path'
import fs from 'node:fs'

const rootDir = process.cwd()
const publicDir = path.join(rootDir, 'public')
const frontendDistDir = path.join(rootDir, 'frontend', 'dist')
const defaultRemoteConfigUrl = 'https://raw.githubusercontent.com/ningzimu/rule_scripts/refs/heads/main/config/acl4ssr_modify.ini'

export const config = {
  port: Number(process.env.PORT || process.env.WEB_PORT || 8080),
  engineMode: process.env.ENGINE_MODE || 'embedded',
  enginePort: Number(process.env.ENGINE_PORT || 25500),
  engineHost: process.env.ENGINE_HOST || '127.0.0.1',
  engineReadyTimeoutMs: Number(process.env.ENGINE_READY_TIMEOUT_MS || 180000),
  engineBinaryPath: process.env.ENGINE_BINARY_PATH || path.join(rootDir, 'runtime', 'engine', 'subconverter'),
  engineWorkingDirectory: process.env.ENGINE_WORKING_DIRECTORY || path.join(rootDir, 'runtime', 'engine'),
  shortLinkStorePath: process.env.SHORTLINK_STORE_PATH || path.join(rootDir, 'data', 'shortlinks.json'),
  remoteConfigUrl: process.env.REMOTE_CONFIG_URL || defaultRemoteConfigUrl,
  staticDir: fs.existsSync(publicDir) ? publicDir : frontendDistDir,
  staticConfig: {
    ENGINE_BASE_URL: '/api',
    SHORTENER_API_URL: '/s/short'
  }
}
