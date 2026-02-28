import gsap from 'gsap'

/**
 * Section transition animation - Codrops-inspired dual animation
 * Animate current section out and next section in simultaneously
 */
export async function defaultSectionTransition (currentSection, nextSection) {
  if (!currentSection || !nextSection) return

  gsap.set(nextSection, {
    clipPath: 'inset(100% 0% 0% 0%)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    zIndex: 10,
    willChange: 'transform, clip-path',
    visibility: 'visible'
  })

  gsap.set(currentSection, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    zIndex: 11,
    willChange: 'transform'
  })

  const tl = gsap.timeline()

  tl.to(currentSection, {
    y: '-30vh',
    opacity: 0.6,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)

  tl.fromTo(nextSection,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1,
      ease: 'power2.inOut'
    }, 0
  )

  return tl
}
