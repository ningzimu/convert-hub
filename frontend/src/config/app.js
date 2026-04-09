const runtimeConfig = window.__CONFIG__ || {}

const trimTrailingSlash = (value) => String(value || '').replace(/\/$/, '')

export const appConfig = {
  productName: 'Convert Hub',
  productTagline: '一体化订阅转换工作台',
  description: '',
  engineBaseUrl: trimTrailingSlash(runtimeConfig.ENGINE_BASE_URL || '/api'),
  shortenerEndpoint: trimTrailingSlash(runtimeConfig.SHORTENER_API_URL || '/s/short'),
  defaultRemoteConfig: runtimeConfig.REMOTE_CONFIG_URL || process.env.VUE_APP_SUBCONVERTER_REMOTE_CONFIG || '',
  configUploadEndpoint: process.env.VUE_APP_CONFIG_UPLOAD_BACKEND
    ? `${trimTrailingSlash(process.env.VUE_APP_CONFIG_UPLOAD_BACKEND)}/sub.php`
    : ''
}
