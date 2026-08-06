import { onUnmounted, shallowRef, watch } from 'vue'

/**
 * Vue/Nuxt wrapper around Flickity.
 * @param {import('vue').Ref<HTMLElement|null>} elementRef
 * @param {Partial<object> | (() => Partial<object>)} config
 */
export function useFlickity(elementRef, config = {}) {
  const flickity = shallowRef(null)
  const ready = ref(false)
  let initPromise = null

  async function init() {
    if (!import.meta.client || flickity.value || !elementRef.value) return flickity.value
    if (initPromise) return initPromise

    initPromise = (async () => {
      const [{ default: Flickity }] = await Promise.all([
        import('flickity'),
        import('flickity/dist/flickity.min.css'),
      ])

      if (!elementRef.value || flickity.value) return null

      const options = typeof config === 'function' ? config() : config
      const { onReady, ...flickityOptions } = options
      const instance = new Flickity(elementRef.value, flickityOptions)

      onReady?.(instance)
      flickity.value = instance
      ready.value = true
      return instance
    })().finally(() => {
      initPromise = null
    })

    return initPromise
  }

  function destroy() {
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
    flickity,
    ready,
    init,
    destroy,
    reload,
  }
}
