import fs from 'node:fs/promises'
import path from 'node:path'

const ENV_TO_TOML_KEY = {
  ENGINE_ENABLE_CACHE: 'enable_cache',
  ENGINE_CACHE_SUBSCRIPTION: 'cache_subscription',
  ENGINE_CACHE_CONFIG: 'cache_config',
  ENGINE_CACHE_RULESET: 'cache_ruleset',
  ENGINE_SERVE_CACHE_ON_FETCH_FAIL: 'serve_cache_on_fetch_fail',
  ENGINE_UPDATE_RULESET_ON_REQUEST: 'update_ruleset_on_request'
}

function parseBoolean(value) {
  const normalized = String(value).trim().toLowerCase()

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return 'true'
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return 'false'
  }

  return null
}

function parseNumber(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return String(Math.floor(parsed))
}

function parseTomlValue(key, value) {
  if (
    key === 'enable_cache' ||
    key === 'serve_cache_on_fetch_fail' ||
    key === 'update_ruleset_on_request'
  ) {
    return parseBoolean(value)
  }

  return parseNumber(value)
}

function setTomlKey(content, key, value) {
  const pattern = new RegExp(`^(${key}\\s*=\\s*).*$`, 'm')

  if (pattern.test(content)) {
    return content.replace(pattern, `$1${value}`)
  }

  return `${content.trimEnd()}\n${key} = ${value}\n`
}

export function buildEngineProfileOverrides(env = process.env) {
  const overrides = {}

  for (const [envName, key] of Object.entries(ENV_TO_TOML_KEY)) {
    if (env[envName] === undefined || env[envName] === '') {
      continue
    }

    const value = parseTomlValue(key, env[envName])

    if (value === null) {
      throw new Error(`invalid ${envName} value: ${env[envName]}`)
    }

    overrides[key] = value
  }

  return overrides
}

export async function applyEngineProfileOverrides({ workingDirectory, env = process.env }) {
  const overrides = buildEngineProfileOverrides(env)
  const entries = Object.entries(overrides)

  if (entries.length === 0) {
    return []
  }

  const profilePath = path.join(workingDirectory, 'pref.toml')
  let content = await fs.readFile(profilePath, 'utf8')

  for (const [key, value] of entries) {
    content = setTomlKey(content, key, value)
  }

  await fs.writeFile(profilePath, content, 'utf8')
  return entries.map(([key]) => key)
}
