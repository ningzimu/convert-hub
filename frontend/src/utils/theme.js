export function detectDevice() {
  const ua = navigator.userAgent
  const isWindowsPhone = /(?:Windows Phone)/.test(ua)
  const isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
  const isAndroid = /(?:Android)/.test(ua)
  const isFirefox = /(?:Firefox)/.test(ua)
  const isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFirefox && /(?:Tablet)/.test(ua))
  const isIPhone = /(?:iPhone)/.test(ua) && !isTablet
  const isPc = !isIPhone && !isAndroid && !isSymbian && !isWindowsPhone

  return {
    isTablet,
    isIPhone,
    isAndroid,
    isPc
  }
}

export function applyThemePreference() {
  const localTheme = window.localStorage.getItem('localTheme')
  const lightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)')
  const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
  const body = document.body

  if (localTheme) {
    body.className = localTheme
    return body.className
  }

  if (new Date().getHours() >= 19 || new Date().getHours() < 7) {
    body.className = 'dark-mode'
  } else {
    body.className = 'light-mode'
  }

  if (lightMode && lightMode.matches) {
    body.className = 'light-mode'
  }

  if (darkMode && darkMode.matches) {
    body.className = 'dark-mode'
  }

  return body.className
}

export function toggleTheme() {
  const nextTheme = document.body.className === 'light-mode' ? 'dark-mode' : 'light-mode'
  document.body.className = nextTheme
  window.localStorage.setItem('localTheme', nextTheme)
  return nextTheme
}

export function observeThemePreference(onChange) {
  const lightMedia = window.matchMedia('(prefers-color-scheme: light)')
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
  const callback = (event) => {
    if (event.matches) {
      onChange()
    }
  }

  if (typeof darkMedia.addEventListener === 'function' || typeof lightMedia.addEventListener === 'function') {
    lightMedia.addEventListener('change', callback)
    darkMedia.addEventListener('change', callback)
  }

  return () => {
    if (typeof darkMedia.removeEventListener === 'function' || typeof lightMedia.removeEventListener === 'function') {
      lightMedia.removeEventListener('change', callback)
      darkMedia.removeEventListener('change', callback)
    }
  }
}
