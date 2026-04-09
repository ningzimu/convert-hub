export function resolveAbsoluteEndpoint(value) {
  if (!value) {
    return ''
  }

  return value.startsWith('/') ? `${window.location.origin}${value}` : value
}

export function normalizeSourceUrls(value) {
  return value.replace(/(\n|\r|\n\r)/g, '|')
}

export function buildSubscriptionUrl(form) {
  const backend = resolveAbsoluteEndpoint(form.customBackend)
  const params = new URLSearchParams()

  if (String(form.clientType || '').startsWith('surge')) {
    params.set('target', 'surge')
    const surgeParams = new URLSearchParams(String(form.clientType).split('?').join('&'))
    if (surgeParams.get('ver')) {
      params.set('ver', surgeParams.get('ver'))
    }
  } else {
    params.set('target', form.clientType)
  }
  params.set('url', normalizeSourceUrls(form.sourceSubUrl))
  params.set('insert', String(form.insert))
  params.set('emoji', String(form.emoji))
  params.set('list', String(form.nodeList))
  params.set('xudp', String(form.xudp))
  params.set('udp', String(form.udp))
  params.set('tfo', String(form.tfo))
  params.set('expand', String(form.expand))
  params.set('scv', String(form.scv))
  params.set('fdn', String(form.fdn))

  if (form.remoteConfig) params.set('config', form.remoteConfig)
  if (form.excludeRemarks) params.set('exclude', form.excludeRemarks)
  if (form.includeRemarks) params.set('include', form.includeRemarks)
  if (form.filename) params.set('filename', form.filename)
  if (form.rename) params.set('rename', form.rename)
  if (form.interval) params.set('interval', String(form.interval * 86400))
  if (form.devid) params.set('dev_id', form.devid)
  if (form.appendType) params.set('append_type', String(form.appendType))
  if (form.tls13) params.set('tls13', String(form.tls13))
  if (form.sort) params.set('sort', String(form.sort))

  if (form.clientType.includes('surge') && form.tpl.surge.doh) {
    params.set('surge.doh', 'true')
  }

  if (form.clientType === 'clash') {
    if (form.tpl.clash.doh) {
      params.set('clash.doh', 'true')
    }
    params.set('new_name', String(form.new_name))
  }

  if (form.clientType === 'singbox' && form.tpl.singbox.ipv6) {
    params.set('singbox.ipv6', '1')
  }

  return `${backend}/sub?${params.toString()}`
}

export async function resolveImportUrl(input) {
  if (input.includes('target=')) {
    return input
  }

  const response = await fetch(input, {
    method: 'GET',
    redirect: 'follow'
  })

  return response.url
}

export function hydrateFormFromUrl(form, rawUrl) {
  const url = new URL(rawUrl)
  const params = new URLSearchParams(url.search)
  const backendPath = url.pathname.endsWith('/sub')
    ? url.pathname.slice(0, -4) || ''
    : ''

  form.customBackend = `${url.origin}${backendPath}`

  if (params.get('target')) {
    const target = params.get('target')
    if (target === 'surge' && params.get('ver')) {
      form.clientType = `${target}&ver=${params.get('ver')}`
    } else if (target === 'surge') {
      form.clientType = 'surge&ver=4'
    } else {
      form.clientType = target
    }
  }

  if (params.get('url')) form.sourceSubUrl = params.get('url')
  if (params.get('insert')) form.insert = params.get('insert') === 'true'
  if (params.get('config')) form.remoteConfig = params.get('config')
  if (params.get('exclude')) form.excludeRemarks = params.get('exclude')
  if (params.get('include')) form.includeRemarks = params.get('include')
  if (params.get('filename')) form.filename = params.get('filename')
  if (params.get('rename')) form.rename = params.get('rename')
  if (params.get('interval')) form.interval = Math.ceil(Number(params.get('interval')) / 86400)
  if (params.get('dev_id')) form.devid = params.get('dev_id')
  if (params.get('append_type')) form.appendType = params.get('append_type') === 'true'
  if (params.get('tls13')) form.tls13 = params.get('tls13') === 'true'
  if (params.get('xudp')) form.xudp = params.get('xudp') === 'true'
  if (params.get('sort')) form.sort = params.get('sort') === 'true'
  if (params.get('emoji')) form.emoji = params.get('emoji') === 'true'
  if (params.get('list')) form.nodeList = params.get('list') === 'true'
  if (params.get('udp')) form.udp = params.get('udp') === 'true'
  if (params.get('tfo')) form.tfo = params.get('tfo') === 'true'
  if (params.get('expand')) form.expand = params.get('expand') === 'true'
  if (params.get('scv')) form.scv = params.get('scv') === 'true'
  if (params.get('fdn')) form.fdn = params.get('fdn') === 'true'
  if (params.get('surge.doh')) form.tpl.surge.doh = params.get('surge.doh') === 'true'
  if (params.get('clash.doh')) form.tpl.clash.doh = params.get('clash.doh') === 'true'
  if (params.get('new_name')) form.new_name = params.get('new_name') === 'true'
  if (params.get('singbox.ipv6')) form.tpl.singbox.ipv6 = params.get('singbox.ipv6') === '1'
}
