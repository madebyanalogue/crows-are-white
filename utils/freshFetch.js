export const freshDataOptions = import.meta.dev
  ? {
      getCachedData(key, nuxtApp) {
        if (nuxtApp.isHydrating) {
          return nuxtApp.payload.data[key]
        }
        return undefined
      },
    }
  : {}
