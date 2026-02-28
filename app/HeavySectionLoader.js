/**
 * Option 1 + 3: Lazy-load heavy 3D sections + Performance mode toggle
 * - Lazy: load GLB/PLY iframes only when section is ~1 viewport away
 * - Performance mode: replace 3D with placeholder, never load
 * - Loading overlay: shows "Loading 3D… X%" until iframe posts 3d-load-complete
 */
const STORAGE_KEY = 'portfolio-lite'
const ROOT_MARGIN = '100vh'

export function isPerformanceMode () {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setPerformanceMode (on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {}
}

function isInOrNearViewport (el, extraMargin = 0) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  const vw = window.innerWidth
  const margin = extraMargin || vh
  return rect.top < vh + margin &&
    rect.bottom > -margin &&
    rect.left < vw + margin &&
    rect.right > -margin
}

function setLoadingPercent (placeholder, pct) {
  const percentEl = placeholder.querySelector('.heavy-3d-percent')
  const fillEl = placeholder.querySelector('.heavy-3d-progress-fill')
  const p = Math.min(100, Math.round((pct ?? 0) * 100))
  if (percentEl) percentEl.textContent = String(p)
  if (fillEl) fillEl.style.width = `${p}%`
}

function showLitePlaceholder (placeholder) {
  const text = placeholder.querySelector('.heavy-3d-loading-text')
  const progressBar = placeholder.querySelector('.heavy-3d-progress-bar')
  const label = placeholder.getAttribute('data-label') || '3D'
  if (text) text.textContent = `${label} – skipped (Light mode)`
  if (progressBar) progressBar.style.display = 'none'
}

export default function initHeavySectionLoader () {
  const lite = isPerformanceMode()
  const sections = document.querySelectorAll('[data-heavy-3d]')

  sections.forEach((section) => {
    const placeholder = section.querySelector('.heavy-3d-placeholder')
    const iframe = section.querySelector('iframe[data-src]')
    if (!iframe || !placeholder) return

    const src = iframe.getAttribute('data-src')
    if (!src) return

    if (lite) {
      showLitePlaceholder(placeholder)
      placeholder.classList.add('visible')
      iframe.style.display = 'none'
      return
    }

    setLoadingPercent(placeholder, 0)
    placeholder.classList.add('visible')

    const hideOverlay = () => {
      placeholder.classList.remove('visible')
    }

    const handleMessage = (e) => {
      if (e.source !== iframe.contentWindow) return
      const d = e.data
      if (d?.type === '3d-load-progress') setLoadingPercent(placeholder, d.progress)
      if (d?.type === '3d-load-complete') {
        window.removeEventListener('message', handleMessage)
        hideOverlay()
      }
    }
    window.addEventListener('message', handleMessage)

    const load = () => {
      if (iframe.src) return
      iframe.src = src
      // Overlay hides when iframe posts 3d-load-complete
    }

    const checkViewport = () => {
      if (isInOrNearViewport(section, window.innerHeight)) {
        load()
        return true
      }
      return false
    }

    if (checkViewport()) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            load()
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    )
    observer.observe(section)

    const horizontalParent = section.closest('.horizontal-scroll-section')
    if (horizontalParent) {
      const onScrollOrResize = () => {
        if (checkViewport()) {
          horizontalParent.removeEventListener('scroll', onScrollOrResize)
          window.removeEventListener('resize', onScrollOrResize)
        }
      }
      horizontalParent.addEventListener('scroll', onScrollOrResize, { passive: true })
      window.addEventListener('resize', onScrollOrResize)
    }
  })
}

export function initPerformanceToggle () {
  const cb = document.getElementById('perfMode')
  if (!cb) return

  cb.checked = isPerformanceMode()

  cb.addEventListener('change', () => {
    setPerformanceMode(cb.checked)
    window.location.reload()
  })
}
