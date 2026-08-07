import { onUnmounted, shallowRef, watch } from 'vue'
import { waitForScrollLayoutPaint } from '~/composables/useScrollLayoutNotify'

function waitForElementSize(element, { maxFrames = 30 } = {}) {
  if (!element) return Promise.resolve(false)

  return new Promise((resolve) => {
    let frames = 0

    const check = () => {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        resolve(true)
        return
      }

      frames += 1
      if (frames >= maxFrames) {
        resolve(false)
        return
      }

      requestAnimationFrame(check)
    }

    check()
  })
}

/**
 * Vue/Nuxt wrapper around Flickity.
 * @param {import('vue').Ref<HTMLElement|null>} elementRef
 * @param {Partial<object> | (() => Partial<object>)} config
 */
export function useFlickity(elementRef, config = {}) {
  const flickity = shallowRef(null)
  const ready = ref(false)
  let initPromise = null
  let resizeObserver = null
  let active = true

  function resize() {
    if (!flickity.value || !elementRef.value?.offsetHeight) return
    flickity.value.resize()
  }

  async function init() {
    if (!import.meta.client || flickity.value || !elementRef.value) return flickity.value
    if (initPromise) return initPromise

    initPromise = (async () => {
      await waitForScrollLayoutPaint()
      if (!active || !elementRef.value || flickity.value) return null

      await waitForElementSize(elementRef.value)
      if (!active || !elementRef.value || flickity.value) return null

      const [{ default: Flickity }] = await Promise.all([
        import('flickity'),
        import('flickity/dist/flickity.min.css'),
      ])

      if (!active || !elementRef.value || flickity.value) return null

      await waitForElementSize(elementRef.value)
      if (!active || !elementRef.value || flickity.value) return null

      const options = typeof config === 'function' ? config() : config
      const { onReady, ...flickityOptions } = options
      const instance = new Flickity(elementRef.value, flickityOptions)

      onReady?.(instance)
      flickity.value = instance
      ready.value = true

      requestAnimationFrame(() => {
        instance.resize()
      })

      return instance
    })().finally(() => {
      initPromise = null
    })

    return initPromise
  }

  function destroy() {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (flickity.value) {
      flickity.value.destroy()
      flickity.value = null
    }
    ready.value = false
  }

  function reload() {
    if (!flickity.value) return
    flickity.value.reloadCells()
    flickity.value.resize()
  }

  function observeSize() {
    if (!import.meta.client || typeof ResizeObserver === 'undefined') return

    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(() => {
      if (elementRef.value?.offsetHeight > 0) resize()
    })

    if (elementRef.value) resizeObserver.observe(elementRef.value)
  }

  async function refreshLayout() {
    if (!active || !elementRef.value) return

    await waitForScrollLayoutPaint()
    await waitForElementSize(elementRef.value)

    if (!active || !elementRef.value) return

    if (!flickity.value) {
      await init()
      return
    }

    reload()
  }

  watch(
    elementRef,
    (el) => {
      if (el) {
        observeSize()
        nextTick(() => init())
        return
      }
      destroy()
    },
    { flush: 'post', immediate: true },
  )

  if (import.meta.client) {
    useAfterPageTransition(() => refreshLayout())

    const onScrollSystemReady = () => {
      refreshLayout()
    }

    onMounted(() => {
      document.addEventListener('crows:scroll-system-ready', onScrollSystemReady)
    })

    onUnmounted(() => {
      document.removeEventListener('crows:scroll-system-ready', onScrollSystemReady)
    })
  }

  onUnmounted(() => {
    active = false
    destroy()
  })

  return {
    flickity,
    ready,
    init,
    destroy,
    reload,
    resize,
    refreshLayout,
  }
}
