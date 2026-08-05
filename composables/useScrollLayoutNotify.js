/** Ms of quiet after the last layout notification before scroll is considered settled. */
const SCROLL_SETTLE_QUIET_MS = 500

let scrollSettleTimer = null
let scrollSystemLocked = false
let scrollSystemLockedY = 0

export function isScrollSystemLocked() {
  return scrollSystemLocked
}

export function lockScrollSystem(scrollY = 0) {
  if (!import.meta.client) return

  scrollSystemLockedY = scrollY

  try {
    const nuxtApp = useNuxtApp()
    nuxtApp.$lenis?.stop?.()
    nuxtApp.$lenis?.scrollTo?.(scrollY, { immediate: true })
  } catch {
    // Lenis may not be initialized yet.
  }

  window.scrollTo(0, scrollY)

  if (!scrollSystemLocked) {
    scrollSystemLocked = true
    document.documentElement.classList.add('is-scroll-system-locked')
    document.body.classList.add('is-scroll-system-locked')
  }

  document.documentElement.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

export function unlockScrollSystem() {
  if (!import.meta.client || !scrollSystemLocked) return

  let keepLenisStopped = false
  try {
    keepLenisStopped = useState('videosScrollLocked', () => false).value === true
  } catch {
    keepLenisStopped = false
  }

  scrollSystemLocked = false
  document.documentElement.classList.remove('is-scroll-system-locked')
  document.body.classList.remove('is-scroll-system-locked')

  document.documentElement.style.overflow = keepLenisStopped ? 'hidden' : ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = keepLenisStopped ? 'hidden' : ''

  try {
    const nuxtApp = useNuxtApp()
    nuxtApp.$lenis?.scrollTo?.(scrollSystemLockedY, { immediate: true })
    if (keepLenisStopped) {
      nuxtApp.$lenis?.stop?.()
    } else {
      nuxtApp.$lenis?.start?.()
    }
  } catch {
    // Lenis may not be initialized yet.
  }

  window.scrollTo(0, scrollSystemLockedY)
}

function waitForLayoutPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

export function waitForScrollLayoutPaint() {
  return waitForLayoutPaint()
}

function runScrollSystemSettle() {
  if (!import.meta.client) return

  scrollSettleTimer = null

  try {
    const nuxtApp = useNuxtApp()
    nuxtApp.$lenis?.resize?.()
    nuxtApp.$warmupLenisScrollTrigger?.()
  } catch {
    // Lenis / warmup may not be initialized yet.
  }

  document.dispatchEvent(new CustomEvent('crows:scroll-system-ready'))

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      unlockScrollSystem()
    })
  })
}

export async function syncScrollAfterLayoutChange() {
  if (!import.meta.client) return

  await nextTick()
  await waitForLayoutPaint()
  flushScrollSystemSettle()
  scheduleScrollSystemSettle()
}

export function scheduleScrollSystemSettle() {
  if (!import.meta.client) return

  clearTimeout(scrollSettleTimer)
  scrollSettleTimer = setTimeout(runScrollSystemSettle, SCROLL_SETTLE_QUIET_MS)
}

export function flushScrollSystemSettle() {
  if (!import.meta.client) return
  clearTimeout(scrollSettleTimer)
  scrollSettleTimer = null
  runScrollSystemSettle()
}

export function notifyScrollLayoutChanged() {
  if (!import.meta.client) return
  document.dispatchEvent(new CustomEvent('crows:scroll-layout-changed'))
  scheduleScrollSystemSettle()
}

export function scheduleScrollLayoutNotifications() {
  if (!import.meta.client) return

  nextTick(() => {
    requestAnimationFrame(() => {
      notifyScrollLayoutChanged()
      setTimeout(notifyScrollLayoutChanged, 150)
      setTimeout(notifyScrollLayoutChanged, 350)
      setTimeout(notifyScrollLayoutChanged, 600)
    })
  })
}
