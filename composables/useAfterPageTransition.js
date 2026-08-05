import {
  scheduleScrollSystemSettle,
  waitForScrollLayoutPaint,
} from '~/composables/useScrollLayoutNotify'

/**
 * Run layout-sensitive setup after preloader + page transition have finished
 * and the browser has painted a stable frame.
 */
export function useAfterPageTransition(callback) {
  if (!import.meta.client) return

  const isTransitioning = useState('pageTransitioning', () => false)
  let ran = false
  let active = true

  async function run() {
    if (!active || ran) return
    ran = true
    await waitForScrollLayoutPaint()
    if (!active) return
    await callback()
    if (!active) return
    scheduleScrollSystemSettle()
  }

  function start() {
    if (isTransitioning.value) {
      document.addEventListener('page-transition-complete', () => run(), { once: true })
      return
    }

    run()
  }

  onMounted(() => {
    if (document.body.classList.contains('preloader-complete')) {
      start()
      return
    }

    document.addEventListener('preloader-complete', start, { once: true })
  })

  onUnmounted(() => {
    active = false
  })
}
