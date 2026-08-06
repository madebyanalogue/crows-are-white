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

  function destroy() {
    if (tickerFn) {
      gsap.ticker.remove(tickerFn)
      tickerFn = null
    }
    if (slider.value) {
      slider.value.destroy()
      slider.value = null
    }
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

  watch(
    elementRef,
    (el) => {
      if (el) {
        nextTick(() => init())
        return
      }
      destroy()
    },
    { flush: 'post', immediate: true },
  )

  onUnmounted(() => {
    destroy()
  })

  return {
    slider,
    ready,
    init,
    destroy,
    pauseUpdates,
    resumeUpdates,
  }
}
