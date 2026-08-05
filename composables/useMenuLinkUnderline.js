const DURATION = 0.45

let gsapPromise = null

function getGsap() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapPromise) {
    gsapPromise = import('gsap').then(({ default: gsap }) => gsap)
  }
  return gsapPromise
}

export function useMenuLinkUnderline(linkRef, hoverLineRef) {
  let gsap = null
  let tween = null
  let linkEl = null

  function resetHoverLine() {
    if (!gsap || !hoverLineRef.value) return
    gsap.set(hoverLineRef.value, {
      scaleX: 0,
      transformOrigin: '0% 50%',
    })
  }

  function onEnter() {
    if (!gsap || !hoverLineRef.value) return
    tween?.kill()
    gsap.set(hoverLineRef.value, { transformOrigin: '0% 50%' })
    tween = gsap.to(hoverLineRef.value, {
      scaleX: 1,
      duration: DURATION,
      ease: 'power2.out',
    })
  }

  function onLeave() {
    if (!gsap || !hoverLineRef.value) return
    tween?.kill()
    gsap.set(hoverLineRef.value, { transformOrigin: '100% 50%' })
    tween = gsap.to(hoverLineRef.value, {
      scaleX: 0,
      duration: DURATION,
      ease: 'power2.inOut',
    })
  }

  function resolveLinkEl() {
    const ref = linkRef.value
    return ref?.$el ?? ref ?? null
  }

  async function setup() {
    gsap = await getGsap()
    if (!gsap || !hoverLineRef.value) return

    linkEl = resolveLinkEl()
    if (!linkEl) return

    resetHoverLine()
    linkEl.addEventListener('mouseenter', onEnter)
    linkEl.addEventListener('mouseleave', onLeave)
  }

  function teardown() {
    tween?.kill()
    tween = null
    if (linkEl) {
      linkEl.removeEventListener('mouseenter', onEnter)
      linkEl.removeEventListener('mouseleave', onLeave)
      linkEl = null
    }
  }

  onMounted(async () => {
    await nextTick()
    setup()
  })

  onUnmounted(() => {
    teardown()
  })

  return {
    resetHoverLine,
  }
}
