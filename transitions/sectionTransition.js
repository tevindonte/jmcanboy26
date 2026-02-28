import gsap from 'gsap'
import { defaultSectionTransition } from './animations/sectionTransition.js'

function getVerticalBlock (sectionId) {
  const target = document.querySelector(`[data-section="${sectionId}"]`)
  if (!target) return null
  return target.classList.contains('horizontal-scroll-item')
    ? target.closest('.horizontal-scroll-section')
    : target
}

/**
 * Execute section transition - animate from current to next
 * @param {string} fromSectionId
 * @param {string} toSectionId
 * @returns {Promise<void>}
 */
export async function executeTransition (fromSectionId, toSectionId) {
  const currentBlock = getVerticalBlock(fromSectionId)
  const nextBlock = getVerticalBlock(toSectionId)

  if (!currentBlock || !nextBlock || currentBlock === nextBlock) {
    return
  }

  const tl = defaultSectionTransition(currentBlock, nextBlock)
  if (!tl) return

  return new Promise((resolve) => {
    tl.eventCallback('onComplete', () => {
      gsap.set([currentBlock, nextBlock], { clearProps: 'all' })
      resolve()
    })
  })
}
