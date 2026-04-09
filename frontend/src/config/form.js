import { appConfig } from './app'

export function createDefaultFormState() {
  return {
    sourceSubUrl: '',
    clientType: 'clash',
    customBackend: appConfig.engineBaseUrl,
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
      surge: {
        doh: false
      },
      clash: {
        doh: false
      },
      singbox: {
        ipv6: false
      }
    }
  }
}
