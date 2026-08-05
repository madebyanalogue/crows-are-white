let gsapPromise = null

function getGsap() {
  if (!gsapPromise) {
    gsapPromise = import('gsap').then(({ default: gsap }) => gsap)
  }
  return gsapPromise
}

export function useHeroTitleMouseEffect({
  enabled,
  sectionRef,
  cardRef,
  mediasRef,
  imageCount,
}) {
  const activeImageIndex = ref(0)
  let gsapContext = null
  let resetTimeout = null
  let removeMouseMove = null
  let cycleIndex = 0

  function cleanup() {
    window.clearTimeout(resetTimeout)
    resetTimeout = null
    removeMouseMove?.()
    removeMouseMove = null
    gsapContext?.revert()
    gsapContext = null
    cycleIndex = 0
    activeImageIndex.value = 0
  }

  async function initEffect() {
    cleanup()

    if (!import.meta.client || !enabled.value || imageCount.value < 1) return

    await nextTick()

    const section = sectionRef?.value
    const card = cardRef.value
    const medias = mediasRef.value
    if (!section || !card || !medias) return

    const gsap = await getGsap()
    if (!gsap) return

    gsapContext = gsap.context(() => {
      gsap.set(card, {
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
      })

      const xTo = gsap.quickTo(card, 'x', { duration: 1, ease: 'power4' })
      const yTo = gsap.quickTo(card, 'y', { duration: 1, ease: 'power4' })
      const rotationTo = gsap.quickTo(card, 'rotation', { duration: 1, ease: 'power4' })
      const xToMedias = gsap.quickTo(medias, 'xPercent', { duration: 0.6, ease: 'power2' })
      const yToMedias = gsap.quickTo(medias, 'yPercent', { duration: 0.7, ease: 'power2' })

      let oldPosX = 0
      let oldPosY = 0
      let incr = 0
      const cycleThreshold = Math.max(window.innerWidth / 8, 120)

      const handleMouseMove = (event) => {
        const posX = event.clientX
        const posY = event.clientY
        const deltaX = posX - oldPosX
        const deltaY = posY - oldPosY
        const clampValueX = gsap.utils.clamp(-8, 8, deltaX / 2)
        const clampValueY = gsap.utils.clamp(-8, 8, deltaY / 2)
        const sectionTop = section.getBoundingClientRect().top

        rotationTo(deltaX / 4)
        xTo(posX - window.innerWidth / 2)
        yTo(posY - sectionTop - section.offsetHeight / 2)
        xToMedias(-clampValueX)
        yToMedias(-clampValueY)

        oldPosX = posX
        oldPosY = posY

        incr += Math.abs(deltaX) + Math.abs(deltaY)
        if (incr > cycleThreshold && imageCount.value > 1) {
          incr = 0
          cycleIndex += 1
          activeImageIndex.value = cycleIndex % imageCount.value
        }

        window.clearTimeout(resetTimeout)
        resetTimeout = window.setTimeout(() => {
          rotationTo(0)
          xToMedias(0)
          yToMedias(0)
        }, 66)
      }

      section.addEventListener('mousemove', handleMouseMove)
      removeMouseMove = () => section.removeEventListener('mousemove', handleMouseMove)
    }, section)
  }

  watch([enabled, imageCount], () => {
    initEffect()
  })

  onMounted(() => {
    initEffect()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    activeImageIndex,
  }
}
