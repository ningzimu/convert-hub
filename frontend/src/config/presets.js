import { appConfig } from './app'

export const CLIENT_PRESETS = [
  { label: 'Clash', value: 'clash' },
  { label: 'Surge 4/5', value: 'surge&ver=4' },
  { label: 'Sing-Box', value: 'singbox' },
  { label: 'V2Ray', value: 'v2ray' },
  { label: 'Trojan', value: 'trojan' },
  { label: 'ShadowsocksR', value: 'ssr' },
  { label: 'Mixed', value: 'mixed' },
  { label: 'Surfboard', value: 'surfboard' },
  { label: 'Quantumult', value: 'quan' },
  { label: 'Quantumult X', value: 'quanx' },
  { label: 'Loon', value: 'loon' },
  { label: 'Mellow', value: 'mellow' },
  { label: 'Surge 3', value: 'surge&ver=3' },
  { label: 'Surge 2', value: 'surge&ver=2' },
  { label: 'ClashR', value: 'clashr' },
  { label: 'Shadowsocks (SIP002)', value: 'ss' },
  { label: 'Shadowsocks Android (SIP008)', value: 'sssub' },
  { label: 'ShadowsocksD', value: 'ssd' },
  { label: '自动识别', value: 'auto' }
]

const ACL4SSR_CONFIG_FILES = [
  'ACL4SSR.ini',
  'ACL4SSR_AdblockPlus.ini',
  'ACL4SSR_BackCN.ini',
  'ACL4SSR_Mini.ini',
  'ACL4SSR_Mini_Fallback.ini',
  'ACL4SSR_Mini_MultiMode.ini',
  'ACL4SSR_Mini_NoAuto.ini',
  'ACL4SSR_NoApple.ini',
  'ACL4SSR_NoAuto.ini',
  'ACL4SSR_NoAuto_NoApple.ini',
  'ACL4SSR_NoAuto_NoApple_NoMicrosoft.ini',
  'ACL4SSR_NoMicrosoft.ini',
  'ACL4SSR_Online.ini',
  'ACL4SSR_Online_AdblockPlus.ini',
  'ACL4SSR_Online_Full.ini',
  'ACL4SSR_Online_Full_AdblockPlus.ini',
  'ACL4SSR_Online_Full_Google.ini',
  'ACL4SSR_Online_Full_MultiMode.ini',
  'ACL4SSR_Online_Full_Netflix.ini',
  'ACL4SSR_Online_Full_NoAuto.ini',
  'ACL4SSR_Online_Mini.ini',
  'ACL4SSR_Online_Mini_AdblockPlus.ini',
  'ACL4SSR_Online_Mini_Fallback.ini',
  'ACL4SSR_Online_Mini_MultiCountry.ini',
  'ACL4SSR_Online_Mini_MultiMode.ini',
  'ACL4SSR_Online_Mini_NoAuto.ini',
  'ACL4SSR_Online_MultiCountry.ini',
  'ACL4SSR_Online_NoAuto.ini',
  'ACL4SSR_Online_NoReject.ini',
  'ACL4SSR_WithChinaIp.ini',
  'ACL4SSR_WithChinaIp_WithGFW.ini',
  'ACL4SSR_WithGFW.ini'
]

const ACL4SSR_RAW_BASE_URL = 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config'

const ACL4SSR_REMOTE_OPTIONS = ACL4SSR_CONFIG_FILES.map((file) => ({
  label: file.replace('.ini', ''),
  value: `${ACL4SSR_RAW_BASE_URL}/${file}`
}))

export const REMOTE_PROFILE_GROUPS = [
  {
    label: '默认模板',
    options: [
      { label: 'Convert Hub 默认模板', value: appConfig.defaultRemoteConfig }
    ]
  },
  {
    label: 'ACL4SSR 全量模板',
    options: ACL4SSR_REMOTE_OPTIONS
  }
]
