/**
 * Premium Scroll Experience
 * - Vertical section focus (scale, blur, opacity based on viewport center)
 * - Horizontal item focus (center item large/sharp, sides small/blurred)
 * - Scroll reveal (slide-up, stagger)
 * - Parallax (different scroll speeds)
 * - Lenis smooth momentum scroll
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const LERP = 0.1
const VERTICAL_FOCUS = {
  inView: { scale: 1, opacity: 1, blur: 0 },
  oneAway: { scale: 0.97, opacity: 0.7, blur: 3 },
  twoPlus: { scale: 0.94, opacity: 0.5, blur: 6 }
}
const HORIZONTAL_FOCUS = {
  center: { scale: 1, opacity: 1, blur: 0 },
  side: { scale: 0.85, opacity: 0.5, blur: 3 }
}
const REVEAL = { y: 60, duration: 1, stagger: 0.1, ease: 'power2.out' }

export default class PremiumScrollEffects {
  constructor () {
    this.lenis = null
    this.verticalSections = []
    this.init()
  }

  init () {
    this.addLenisCSS()
    this.setupLenis()
    this.setupVerticalFocus()
    this.setupHorizontalFocus()
    this.setupScrollReveal()
    this.setupParallax()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  addLenisCSS () {
    const style = document.createElement('style')
    style.textContent = `
      html.lenis, html.lenis body { height: auto; }
      .lenis.lenis-smooth { scroll-behavior: auto !important; }
      .lenis.lenis-stopped { overflow: hidden; }
      .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
    `
    document.head.appendChild(style)
  }

  setupLenis () {
    this.lenis = new Lenis({ lerp: LERP, smoothWheel: true })
    this.lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => this.lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    document.documentElement.classList.add('lenis', 'lenis-smooth')

    const lenis = this.lenis
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop (value) {
        if (arguments.length) lenis.scrollTo(value)
        return lenis.scroll
      }
    })
  }

  /** Expose for ScrollController to use */
  scrollTo (target) {
    if (this.lenis && target) {
      const el = typeof target === 'string' ? document.querySelector(target) : target
      if (el) this.lenis.scrollTo(el, { behavior: 'smooth' })
    }
  }

  setupVerticalFocus () {
    const sections = document.querySelectorAll(
      '.gallery-section, .model-section, .horizontal-scroll-section, ' +
      '.circling-section, .rotating-section, .marquee-svg-section, .footer-section'
    )
    this.verticalSections = Array.from(sections)

    const vh = window.innerHeight
    const updateFocus = () => {
      this.verticalSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height / 2
        const viewportCenter = vh / 2
        const distFromCenter = Math.abs(sectionCenter - viewportCenter)
        const viewportsAway = distFromCenter / vh

        let style
        if (viewportsAway < 0.5) style = VERTICAL_FOCUS.inView
        else if (viewportsAway < 1.5) style = VERTICAL_FOCUS.oneAway
        else style = VERTICAL_FOCUS.twoPlus

        gsap.to(section, {
          scale: style.scale,
          opacity: style.opacity,
          filter: `blur(${style.blur}px)`,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true
        })
      })
    }

    const onScroll = () => requestAnimationFrame(updateFocus)
    if (this.lenis) this.lenis.on('scroll', onScroll)
    else window.addEventListener('scroll', onScroll, { passive: true })
    updateFocus()
  }

  setupHorizontalFocus () {
    const sections = document.querySelectorAll('.horizontal-scroll-section')
    sections.forEach((section) => {
      const track = section.querySelector('.horizontal-content-track')
      const items = section.querySelectorAll('.horizontal-scroll-item')
      if (!track || !items.length) return

      const updateItems = () => {
        const rect = section.getBoundingClientRect()
        if (rect.top > window.innerHeight || rect.bottom < 0) return

        const scrollLeft = section.scrollLeft
        const sectionCenter = section.clientWidth / 2
        const itemWidth = items[0].offsetWidth

        items.forEach((item, i) => {
          const itemLeft = i * itemWidth
          const itemCenter = itemLeft + itemWidth / 2
          const distFromCenter = Math.abs((itemCenter - scrollLeft) - sectionCenter)
          const normalized = Math.min(distFromCenter / (section.clientWidth * 0.6), 1)

          const scale = VERTICAL_FOCUS.oneAway.scale + (1 - VERTICAL_FOCUS.oneAway.scale) * (1 - normalized)
          const opacity = HORIZONTAL_FOCUS.side.opacity + (1 - HORIZONTAL_FOCUS.side.opacity) * (1 - normalized)
          const blur = HORIZONTAL_FOCUS.side.blur * normalized

          gsap.to(item, {
            scale,
            opacity,
            filter: `blur(${blur}px)`,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: true
          })
        })
      }

      section.addEventListener('scroll', updateItems, { passive: true })
      updateItems()
    })
  }

  setupScrollReveal () {
    const revealEls = document.querySelectorAll('.reveal-element')
    if (!revealEls.length) return

    revealEls.forEach((el) => {
      gsap.set(el, { opacity: 0, y: REVEAL.y })
    })

    const sections = document.querySelectorAll(
      '[data-section]:not(.horizontal-scroll-item)'
    )
    sections.forEach((section) => {
      const children = section.querySelectorAll('.reveal-element')
      if (!children.length) return

      gsap.fromTo(children, 
        { opacity: 0, y: REVEAL.y },
        {
          opacity: 1,
          y: 0,
          duration: REVEAL.duration,
          stagger: REVEAL.stagger,
          ease: REVEAL.ease,
          scrollTrigger: {
            trigger: section,
            start: 'top 95%',
            end: 'top 30%',
            scrub: false,
            toggleActions: 'play none none none'
          }
        }
      )
    })
  }

  setupParallax () {
    const parallaxEls = document.querySelectorAll('.parallax')
    if (!parallaxEls.length) return

    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0.5
      const section = el.closest('[data-section]') || el.parentElement
      if (!section) return

      gsap.to(el, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
    })
  }
}
