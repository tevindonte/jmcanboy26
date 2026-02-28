/**
 * ScrollController - Smooth scroll animations & horizontal scroll indicators
 * - Vertical: section transitions + scroll snap
 * - Horizontal: GSAP-animated scroll, custom scrollbar, hint, dots
 */
import gsap from 'gsap'
import NormalizeWheel from 'normalize-wheel'
import { executeTransition } from '../transitions/sectionTransition.js'

export default class ScrollController {
  constructor (options = {}) {
    this.lenis = options.lenis || null
    this.horizontalSections = document.querySelectorAll('.horizontal-scroll-section')
    this.isTransitioning = false
    this.currentSectionId = null
    this.init()
  }

  init () {
    this.setupVerticalSmoothScroll()
    this.horizontalSections.forEach((section) => this.setupHorizontalSection(section))
    this.setupPopState()
    this.scrollToHashOnLoad()
    this.setCurrentSectionFromScroll()
    if (this.lenis) {
      this.lenis.on('scroll', () => this.setCurrentSectionFromScroll())
    } else {
      window.addEventListener('scroll', () => this.setCurrentSectionFromScroll(), { passive: true })
    }
  }

  getCurrentSectionId () {
    const sections = document.querySelectorAll('[data-section]')
    const vh = window.innerHeight
    let best = null
    let bestDist = Infinity
    sections.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const dist = Math.abs(center - vh / 2)
      if (rect.top < vh && rect.bottom > 0 && dist < bestDist) {
        bestDist = dist
        best = el.dataset.section
      }
    })
    return best
  }

  setCurrentSectionFromScroll () {
    const id = this.getCurrentSectionId()
    if (id) this.currentSectionId = id
  }

  scrollToHashOnLoad () {
    const hash = window.location.hash
    if (hash) {
      const match = hash.match(/#section-(\w+)/)
      if (match) {
        requestAnimationFrame(() => {
          setTimeout(() => this.navigateToSection(match[1], true), 100)
        })
      }
    }
  }

  getBlockForSection (sectionId) {
    if (!sectionId) return null
    const target = document.querySelector(`[data-section="${sectionId}"]`)
    if (!target) return null
    return target.classList.contains('horizontal-scroll-item')
      ? target.closest('.horizontal-scroll-section')
      : target
  }

  async navigateToSection (sectionId, isInitialLoad = false) {
    if (this.isTransitioning) return
    const target = document.querySelector(`[data-section="${sectionId}"]`)
    if (!target) return

    const parent = target.closest('.horizontal-scroll-section')
    const fromBlock = this.getBlockForSection(this.currentSectionId)
    const toBlock = this.getBlockForSection(sectionId)

    if (fromBlock && toBlock && fromBlock !== toBlock && !isInitialLoad) {
      this.isTransitioning = true
      try {
        await executeTransition(this.currentSectionId, sectionId)
      } catch (e) {
        console.warn('Transition error:', e)
      }
      this.isTransitioning = false
    }

    const scrollTarget = parent || target
    if (parent) {
      // horizontal scroll - handled below
    } else if (this.lenis) {
      this.lenis.scrollTo(scrollTarget, { offset: 0 })
    } else {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (parent) {
      const items = parent.querySelectorAll('.horizontal-scroll-item')
      const index = Array.from(items).indexOf(target)
      const itemWidth = items[0]?.offsetWidth || parent.clientWidth
      gsap.to(parent, {
        scrollLeft: index * itemWidth,
        duration: isInitialLoad ? 0.5 : 0.8,
        ease: 'power2.out'
      })
    }

    this.currentSectionId = sectionId
    history.replaceState({ section: sectionId }, '', `#section-${sectionId}`)
  }

  setupVerticalSmoothScroll () {
    document.documentElement.style.scrollBehavior = 'smooth'
    document.documentElement.style.scrollPaddingTop = '0'
  }

  setupHorizontalSection (section) {
    const track = section.querySelector('.horizontal-content-track')
    const items = section.querySelectorAll('.horizontal-scroll-item')

    if (!track || !items.length) return

    // Add indicators markup
    this.addScrollIndicators(section, items)

    // Custom scrollbar styling class
    section.classList.add('horizontal-scroll-section--styled')

    // GSAP smooth wheel scroll
    section.addEventListener('wheel', (e) => this.onHorizontalWheel(e, section), { passive: false })

    // Track scroll for indicators
    section.addEventListener('scroll', () => this.updateIndicators(section))

    // Initial indicator state
    this.updateIndicators(section)
  }

  onHorizontalWheel (e, section) {
    const track = section.querySelector('.horizontal-content-track')
    const items = section.querySelectorAll('.horizontal-scroll-item')

    if (!track || !items.length) return

    // Only handle wheel when section is in view
    const rect = section.getBoundingClientRect()
    if (rect.top > window.innerHeight || rect.bottom < 0) return

    const normalized = NormalizeWheel(e)
    const deltaY = normalized.pixelY
    const deltaX = normalized.pixelX
    const delta = deltaX !== 0 ? deltaX : deltaY
    if (Math.abs(delta) < 2) return

    const itemWidth = items[0].offsetWidth
    const maxScroll = Math.max(0, track.scrollWidth - section.clientWidth)
    const scrollLeft = section.scrollLeft

    // Allow vertical scroll when at boundaries: at start + scroll up, or at end + scroll down
    if (scrollLeft <= 5 && delta < 0) return
    if (scrollLeft >= maxScroll - 5 && delta > 0) return

    let targetScroll = scrollLeft + delta
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll))

    // Snap to nearest item
    const itemIndex = Math.round(targetScroll / itemWidth)
    targetScroll = itemIndex * itemWidth
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll))

    e.preventDefault()

    gsap.to(section, {
      scrollLeft: targetScroll,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true
    })

    // Hide hint on first scroll
    const hint = section.querySelector('.scroll-hint')
    if (hint && !hint.classList.contains('hidden')) {
      hint.classList.add('hidden')
    }
  }

  addScrollIndicators (section, items) {
    section.style.position = 'relative'
    section.classList.add('horizontal-scroll--grab')

    // Scroll progress bar
    const progressBar = document.createElement('div')
    progressBar.className = 'scroll-progress-bar'
    progressBar.innerHTML = '<div class="scroll-progress-fill"></div>'
    section.appendChild(progressBar)

    // Scroll hint
    const hint = document.createElement('div')
    hint.className = 'scroll-hint'
    hint.innerHTML = `
      <span class="scroll-hint-text">Scroll Right</span>
      <svg class="scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 4l8 8-8 8"/>
      </svg>
    `
    section.appendChild(hint)

    // Progress dots
    const dotsWrap = document.createElement('div')
    dotsWrap.className = 'scroll-dots'
    items.forEach((_, i) => {
      const dot = document.createElement('span')
      dot.className = 'dot' + (i === 0 ? ' active' : '')
      dot.dataset.index = i
      dot.setAttribute('aria-label', `Go to section ${i + 1}`)
      dotsWrap.appendChild(dot)
    })
    section.appendChild(dotsWrap)

    // Edge arrow
    const edgeArrow = document.createElement('div')
    edgeArrow.className = 'scroll-edge-arrow'
    edgeArrow.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 4l8 8-8 8"/>
      </svg>
    `
    section.appendChild(edgeArrow)

    // Dot click to scroll
    dotsWrap.querySelectorAll('.dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index, 10)
        const itemWidth = items[0].offsetWidth
        const targetScroll = index * itemWidth

        gsap.to(section, {
          scrollLeft: targetScroll,
          duration: 0.6,
          ease: 'power2.out'
        })

        hint.classList.add('hidden')
      })
    })
  }

  updateIndicators (section) {
    const track = section.querySelector('.horizontal-content-track')
    const items = section.querySelectorAll('.horizontal-scroll-item')
    const scrollWidth = track ? track.scrollWidth - section.clientWidth : 0
    const scrolled = section.scrollLeft
    const progress = scrollWidth > 0 ? (scrolled / scrollWidth) * 100 : 0

    // Progress bar (if exists)
    const progressFill = section.querySelector('.scroll-progress-fill')
    if (progressFill) progressFill.style.width = `${progress}%`

    // Dots
    const dots = section.querySelectorAll('.scroll-dots .dot')
    const itemWidth = items[0]?.offsetWidth || 1
    const activeIndex = Math.round(scrolled / itemWidth)
    const clampedIndex = Math.min(activeIndex, dots.length - 1)

    dots.forEach((d, i) => d.classList.toggle('active', i === clampedIndex))

    // Edge arrow visibility
    const edgeArrow = section.querySelector('.scroll-edge-arrow')
    const hasMoreRight = scrolled < scrollWidth - 5
    if (edgeArrow) {
      edgeArrow.classList.toggle('visible', hasMoreRight)
      edgeArrow.classList.toggle('at-end', !hasMoreRight)
    }

    // History
    this.updateHistory(section, clampedIndex)
  }

  updateHistory (section, itemIndex) {
    const item = section.querySelectorAll('.horizontal-scroll-item')[itemIndex]
    const sectionId = item?.dataset?.section
    if (sectionId) {
      const hash = `#section-${sectionId}`
      if (window.location.hash !== hash) {
        history.replaceState({ section: sectionId }, '', hash)
      }
    }
  }

  setupPopState () {
    window.addEventListener('popstate', () => {
      const hash = window.location.hash
      if (hash) {
        const match = hash.match(/#section-(\w+)/)
        if (match) {
          this.navigateToSection(match[1], true)
        }
      }
    })
  }
}
