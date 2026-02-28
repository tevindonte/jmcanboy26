import { Renderer, Camera, Transform, Plane } from 'ogl'
import NormalizeWheel from 'normalize-wheel'

import debounce from 'lodash/debounce'

import { lerp } from 'utils/math'

import Image1 from 'images/1.jpg'
import Image2 from 'images/2.png'
import Image3 from 'images/3.jpg'
import Image4 from 'images/4.jpg'
import Image5 from 'images/5.gif'
import Image6 from 'images/6.jpg'
import Image7 from 'images/7.gif'
import Image8 from 'images/8.jpg'
import Image9 from 'images/9.jpg'
import Image10 from 'images/10.jpg'
import Image11 from 'images/11.jpg'

import Media from './Media'
import ScrollController from './ScrollController'
import InteractiveSectionController from './InteractiveSectionController'
import PremiumScrollEffects from './PremiumScrollEffects'
import HeavySectionLoader, { initPerformanceToggle } from './HeavySectionLoader'

export default class App {
  constructor () {
    document.documentElement.classList.remove('no-js')
    document.documentElement.classList.remove('loading')
    document.documentElement.classList.add('loaded')

    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0
    }

    this.onCheckDebounce = debounce(this.onCheck, 200)

    this.createRenderer()
    this.createCamera()
    this.createScene()

    this.onResize()

    this.createGeometry()
    this.createMedias()

    this.update()

    this.addEventListeners()

    this.createPreloader()

    HeavySectionLoader()
    initPerformanceToggle()
    this.premiumScroll = new PremiumScrollEffects()
    this.scrollController = new ScrollController({ lenis: this.premiumScroll.lenis })
    this.interactiveController = new InteractiveSectionController()
    this.setupCardClickNavigation()
  }

  createPreloader () {
    Array.from(this.mediasImages).forEach(({ image: source }) => {
      const image = new Image()

      this.loaded = 0

      image.src = source
      image.onload = _ => {
        this.loaded += 1

        if (this.loaded === this.mediasImages.length) {
          document.documentElement.classList.remove('loading')
          document.documentElement.classList.add('loaded')
        }
      }
    })
  }

  createRenderer () {
    this.renderer = new Renderer({ alpha: true })

    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)

    document.getElementById('gallery-section').appendChild(this.gl.canvas)
  }

  createCamera () {
    this.camera = new Camera(this.gl)
    this.camera.fov = 35
    this.camera.position.z = 14
  }

  createScene () {
    this.scene = new Transform()
  }

  createGeometry () {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    })
  }

  createMedias () {
    this.mediasImages = [
      { image: Image1, text: 'About me' },
      { image: Image2, text: 'Business' },
      { image: Image3, text: 'Professions' },
      { image: Image4, text: 'Social Media Design' },
      { image: Image5, text: 'Motion Design' },
      { image: Image6, text: 'Logo Design' },
      { image: Image7, text: 'Intro Design' },
      { image: Image8, text: 'Digital Design' },
      { image: Image9, text: 'Model' },
      { image: Image10, text: 'Photography' },
      { image: Image11, text: 'Contact' },
      { image: Image1, text: 'About me' },
      { image: Image2, text: 'Business' },
      { image: Image3, text: 'Professions' },
      { image: Image4, text: 'Social Media Design' },
      { image: Image5, text: 'Motion Design' },
      { image: Image6, text: 'Logo Design' },
      { image: Image7, text: 'Intro Design' },
      { image: Image8, text: 'Digital Design' },
      { image: Image9, text: 'Model' },
      { image: Image10, text: 'Photography' },
      { image: Image11, text: 'Contact' },
    ]

    this.medias = this.mediasImages.map(({ image, text }, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text,
        viewport: this.viewport
      })

      return media
    })
  }

  /**
   * Events.
   */
  onTouchDown (event) {
    this.isDown = true
    this.hasMoved = false
    this.pointerStartX = event.touches ? event.touches[0].clientX : event.clientX
    this.pointerStartY = event.touches ? event.touches[0].clientY : event.clientY

    this.scroll.position = this.scroll.current
    this.start = this.pointerStartX
  }

  onTouchMove (event) {
    if (!this.isDown) return

    const x = event.touches ? event.touches[0].clientX : event.clientX
    const y = event.touches ? event.touches[0].clientY : event.clientY
    const distX = Math.abs(x - this.pointerStartX)
    const distY = Math.abs(y - this.pointerStartY)
    if (distX > 8 || distY > 8) this.hasMoved = true

    const distance = (this.start - x) * 0.01
    this.scroll.target = this.scroll.position + distance
  }

  onTouchUp () {
    this.isDown = false
    this.onCheck()
  }

  onWheel (event) {
    const normalized = NormalizeWheel(event)
    const speed = normalized.pixelY

    this.scroll.target += speed * 0.005

    this.onCheckDebounce()
  }

  /**
   * Hero card index (0-11) -> data-section target for navigation
   */
  cardToSectionMap () {
    return {
      0: '6',    // About me
      1: '7',    // Business
      2: '8',    // Professions
      3: '8',    // Social Media Design
      4: 'motion', // Motion Design
      5: '12',   // Logo Design
      6: '11',   // Intro Design
      7: '13',   // Digital Design
      8: '15',   // Model
      9: '16',   // Photography
      10: '20'   // Contact
    }
  }

  onGalleryClick (event) {
    if (!this.medias || !this.medias.length) return
    if (this.hasMoved) return
    const rect = this.gl.canvas.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) return

    const width = this.medias[0].width
    const worldX = (event.clientX - rect.left) / rect.width * this.viewport.width - this.viewport.width / 2
    const cardIndex = Math.round((worldX + this.scroll.current) / width) % 12
    const cardIndexClamped = Math.max(0, Math.min(10, cardIndex < 11 ? cardIndex : 10))

    const cardCenterX = (cardIndexClamped + 0.5) * width - this.scroll.current
    const clickOffsetFromCenter = Math.abs(worldX - cardCenterX)
    if (clickOffsetFromCenter > width * 0.35) return

    const targetSection = this.cardToSectionMap()[cardIndexClamped]
    if (!targetSection) return

    setTimeout(() => {
      if (this.hasMoved) return
      this.scrollController.navigateToSection(targetSection)
    }, 150)
  }

  setupCardClickNavigation () {
    const canvas = this.gl.canvas
    canvas.style.cursor = 'pointer'
    canvas.addEventListener('click', (e) => this.onGalleryClick(e))
  }

  onCheck () {
    const { width } = this.medias[0]
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    const item = width * itemIndex

    if (this.scroll.target < 0) {
      this.scroll.target = -item
    } else {
      this.scroll.target = item
    }
  }

  /**
   * Resize.
   */
  onResize () {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    this.renderer.setSize(this.screen.width, this.screen.height)

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.viewport = {
      height,
      width
    }

    if (this.medias) {
      this.medias.forEach(media => media.onResize({
        screen: this.screen,
        viewport: this.viewport
      }))
    }
  }

  /**
   * Update.
   */
  update () {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'right'
    } else {
      this.direction = 'left'
    }

    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, this.direction))
    }

    this.renderer.render({
      scene: this.scene,
      camera: this.camera
    })

    this.scroll.last = this.scroll.current

    window.requestAnimationFrame(this.update.bind(this))
  }

  /**
   * Listeners.
   */
  addEventListeners () {
    window.addEventListener('resize', this.onResize.bind(this))

    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))

    window.addEventListener('mousedown', this.onTouchDown.bind(this))
    window.addEventListener('mousemove', this.onTouchMove.bind(this))
    window.addEventListener('mouseup', this.onTouchUp.bind(this))

    window.addEventListener('touchstart', this.onTouchDown.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchUp.bind(this))
  }
}

new App()
