/**
 * Shared handle so hero CTAs can open the homepage trailer section.
 */
export function useTrailerPlayer() {
  const api = useState('crows_trailerPlayer', () => null)

  function register(methods) {
    api.value = methods
  }

  function unregister(methods) {
    if (api.value === methods) api.value = null
  }

  function open() {
    return api.value?.open?.()
  }

  function close() {
    return api.value?.close?.()
  }

  return {
    register,
    unregister,
    open,
    close,
  }
}
