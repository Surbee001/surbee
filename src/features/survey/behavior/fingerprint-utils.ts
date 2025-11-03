import type { DeviceFingerprint } from '../types'

/**
 * Generate a comprehensive device fingerprint with automation detection
 */
export function generateEnhancedFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    return { userAgent: 'ssr' }
  }

  const nav = navigator as any

  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      w: window.screen.width,
      h: window.screen.height,
      dpr: window.devicePixelRatio,
      depth: window.screen.colorDepth,
    },
    hardware: {
      cores: nav.hardwareConcurrency,
      memory: nav.deviceMemory,
    },
    // Automation detection
    webDriver: detectWebDriver(),
    automation: detectAutomation(),
    plugins: getPluginsList(),
    canvasFingerprint: generateCanvasFingerprint(),
    webglFingerprint: generateWebGLFingerprint(),
    fonts: detectFonts(),
    // Touch support
    touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    maxTouchPoints: nav.maxTouchPoints || 0,
  }
}

/**
 * Detect WebDriver (Selenium, Puppeteer, etc.)
 */
function detectWebDriver(): boolean {
  const nav = navigator as any

  // Check for webdriver property
  if (nav.webdriver === true) return true

  // Check for common automation signatures
  if (window.document.documentElement.getAttribute('webdriver')) return true
  if (nav.plugins?.length === 0) return true
  if (!nav.languages || nav.languages.length === 0) return true

  // Check for specific automation frameworks
  if (window.hasOwnProperty('callPhantom')) return true
  if (window.hasOwnProperty('_phantom')) return true
  if (window.hasOwnProperty('__nightmare')) return true

  return false
}

/**
 * Detect various automation tools and headless browsers
 */
function detectAutomation(): boolean {
  const nav = navigator as any
  const ua = nav.userAgent.toLowerCase()

  // Check user agent for automation signatures
  const automationSignatures = [
    'headless',
    'phantom',
    'selenium',
    'webdriver',
    'bot',
    'crawler',
    'spider',
    'scraper',
  ]

  if (automationSignatures.some(sig => ua.includes(sig))) return true

  // Check for Chrome headless specific properties
  if (ua.includes('chrome')) {
    if (!window.chrome || !window.chrome.runtime) {
      // Chrome without chrome.runtime is suspicious
      return true
    }
  }

  // Check for missing expected properties
  if (!nav.plugins || nav.plugins.length === 0) {
    // Real browsers usually have some plugins
    return true
  }

  // Check permissions API inconsistencies
  if (nav.permissions && nav.permissions.query) {
    // Automation tools often have permission quirks
    // This is a heuristic and might need adjustment
  }

  return false
}

/**
 * Get list of browser plugins
 */
function getPluginsList(): string[] {
  if (!navigator.plugins) return []

  const plugins: string[] = []
  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i]
    if (plugin?.name) {
      plugins.push(plugin.name)
    }
  }

  return plugins
}

/**
 * Generate canvas fingerprint
 */
function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    canvas.width = 200
    canvas.height = 50

    // Draw text with specific styling
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Canvas fingerprint', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Canvas fingerprint', 4, 17)

    // Get canvas data and hash it
    const dataURL = canvas.toDataURL()
    return simpleHash(dataURL)
  } catch (e) {
    return ''
  }
}

/**
 * Generate WebGL fingerprint
 */
function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) return ''

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return simpleHash(`${vendor}~${renderer}`)
  } catch (e) {
    return ''
  }
}

/**
 * Detect available fonts
 */
function detectFonts(): string[] {
  // Common fonts to test
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Helvetica', 'Calibri',
  ]

  const available: string[] = []
  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  // Measure widths with base fonts
  const baseWidths: Record<string, number> = {}
  baseFonts.forEach(font => {
    ctx.font = `${testSize} ${font}`
    baseWidths[font] = ctx.measureText(testString).width
  })

  // Test each font
  testFonts.forEach(font => {
    let detected = false
    baseFonts.forEach(baseFont => {
      ctx.font = `${testSize} '${font}', ${baseFont}`
      const width = ctx.measureText(testString).width
      if (width !== baseWidths[baseFont]) {
        detected = true
      }
    })
    if (detected) {
      available.push(font)
    }
  })

  return available
}

/**
 * Simple string hashing function
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Detect if DevTools is open
 */
export function detectDevTools(): boolean {
  const threshold = 160
  const widthThreshold = window.outerWidth - window.innerWidth > threshold
  const heightThreshold = window.outerHeight - window.innerHeight > threshold

  return widthThreshold || heightThreshold
}

/**
 * Hash clipboard content (for privacy and comparison)
 */
export function hashClipboardContent(text: string): string {
  return simpleHash(text)
}
