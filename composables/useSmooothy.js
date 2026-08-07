import { onUnmounted, ref, shallowRef, watch } from 'vue'
import gsap from 'gsap'

/**
 * Vue/Nuxt wrapper around smooothy Core.
 * @param {import('vue').Ref<HTMLElement|null>} elementRef
 * @param {Partial<object> | (() => Partial<object>)} config
 */
export function useSmooothy(elementRef, config = {}) {
  const slider = shallowRef(null)
  const ready = ref(false)
  let tickerFn = null
  let initPromise = null
  let updatesPaused = false
  let visualFrozen = false

  async function init() {
    if (!import.meta.client || slider.value || !elementRef.value) return slider.value
    if (initPromise) return initPromise

    initPromise = (async () => {
      const { default: Core } = await import('smooothy')
      if (!elementRef.value || slider.value) return null

      const options = typeof config === 'function' ? config() : config
      const { onReady, ...coreOptions } = options
      const instance = new Core(elementRef.value, coreOptions)

      onReady?.(instance)

      tickerFn = () => instance.update()
      gsap.ticker.add(tickerFn)
      slider.value = instance
      ready.value = true
      return instance
    })().finally(() => {
      initPromise = null
    })

    return initPromise
  }

  function blockResize() {
    const instance = slider.value
    if (!instance || instance.__crowsResizeBlocked) return
    instance.__crowsOriginalResize = instance.resize.bind(instance)
    instance.resize = () => {}
    instance.__crowsResizeBlocked = true
  }

  function unblockResize() {
    const instance = slider.value
    if (!instance?.__crowsResizeBlocked) return
    instance.resize = instance.__crowsOriginalResize
    delete instance.__crowsOriginalResize
    delete instance.__crowsResizeBlocked
  }

  function destroy(options = {}) {
    const { preserveVisual = false } = options

    pauseUpdates()

    if (!slider.value) {
      ready.value = false
      updatesPaused = false
      return
    }

    if (preserveVisual) {
      slider.value.paused = true
      slider.value.target = slider.value.current
      blockResize()
      visualFrozen = true
      return
    }

    visualFrozen = false

    unblockResize()
    slider.value.destroy()
    slider.value = null
    ready.value = false
    updatesPaused = false
  }

  function pauseUpdates() {
    if (updatesPaused || !tickerFn) return
    gsap.ticker.remove(tickerFn)
    updatesPaused = true
  }

  function resumeUpdates() {
    if (!updatesPaused || !slider.value || !tickerFn) return
    gsap.ticker.add(tickerFn)
    updatesPaused = false
  }

  function freeze() {
    pauseUpdates()
    if (!slider.value) return
    slider.value.paused = true
    slider.value.target = slider.value.current
    blockResize()
  }

  watch(
    elementRef,
    (el) => {
      if (el) {
        nextTick(() => init())
      }
    },
    { flush: 'post', immediate: true },
  )

  onUnmounted(() => {
    if (!visualFrozen) destroy()
  })

  return {
    slider,
    ready,
    init,
    destroy,
    pauseUpdates,
    resumeUpdates,
    freeze,
  }
}
