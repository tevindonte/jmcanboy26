/**
 * Click-to-activate for interactive sections (3D/camera)
 * - All start INACTIVE with "Click to explore" overlay
 * - Click activates, scroll away or click outside deactivates
 */
export default class InteractiveSectionController {
  constructor () {
    this.activeSection = null
    this.sections = document.querySelectorAll('[data-section][data-interactive]')
    this.init()
  }

  init () {
    this.sections.forEach((section) => this.setupSection(section))
    this.setupClickOutside()
    this.setupIntersectionObserver()
  }

  setupSection (section) {
    section.classList.add('interactive-section')
    if (!section.querySelector('.interactive-overlay')) {
      const overlay = document.createElement('div')
      overlay.className = 'interactive-overlay'
      overlay.innerHTML = '<span class="interactive-hint">Click to explore</span>'
      overlay.setAttribute('aria-hidden', 'true')
      section.appendChild(overlay)
    }

    section.addEventListener('click', (e) => this.onSectionClick(e, section))
  }

  onSectionClick (e, section) {
    const overlay = section.querySelector('.interactive-overlay')
    if (!overlay) return

    if (section.classList.contains('section--active')) {
      return
    }

    this.deactivateAll()
    this.activate(section)
  }

  activate (section) {
    this.activeSection = section
    section.classList.add('section--active')
    const overlay = section.querySelector('.interactive-overlay')
    if (overlay) overlay.classList.add('hidden')

    const iframe = section.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'section-activate', section: section.dataset.section }, '*')
    }
  }

  deactivate (section) {
    if (this.activeSection === section) this.activeSection = null
    section.classList.remove('section--active')
    const overlay = section.querySelector('.interactive-overlay')
    if (overlay) overlay.classList.remove('hidden')

    const iframe = section.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'section-deactivate', section: section.dataset.section }, '*')
    }
  }

  deactivateAll () {
    this.sections.forEach((s) => this.deactivate(s))
  }

  setupClickOutside () {
    document.addEventListener('click', (e) => {
      if (!this.activeSection) return
      if (this.activeSection.contains(e.target)) return
      this.deactivate(this.activeSection)
    })
  }

  setupIntersectionObserver () {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target
          if (!section.hasAttribute('data-interactive')) return
          if (!entry.isIntersecting && this.activeSection === section) {
            this.deactivate(section)
          }
        })
      },
      { threshold: 0.1 }
    )
    this.sections.forEach((el) => observer.observe(el))
  }
}
