export default defineNuxtPlugin(async () => {
  try {
    const settings = await $fetch('/api/site-settings')
    const metaPixelId = settings?.metaPixelId?.trim()
    const hotjarSiteId = settings?.hotjarSiteId?.trim()

    if (metaPixelId && /^\d+$/.test(metaPixelId)) {
      if (!window.fbq) {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        document.head.appendChild(script)

        window.fbq = function () {
          window.fbq.callMethod
            ? window.fbq.callMethod.apply(window.fbq, arguments)
            : window.fbq.queue.push(arguments)
        }
        if (!window._fbq) window._fbq = window.fbq
        window.fbq.push = window.fbq
        window.fbq.loaded = true
        window.fbq.version = '2.0'
        window.fbq.queue = []
      }

      window.fbq('init', metaPixelId)
      window.fbq('track', 'PageView')
    }

    if (hotjarSiteId && /^\d+$/.test(hotjarSiteId)) {
      window.hj = window.hj || function () {
        (window.hj.q = window.hj.q || []).push(arguments)
      }
      window._hjSettings = { hjid: Number(hotjarSiteId), hjsv: 6 }

      const script = document.createElement('script')
      script.async = true
      script.src = `https://static.hotjar.com/c/hotjar-${hotjarSiteId}.js?sv=6`
      document.head.appendChild(script)
    }
  } catch (error) {
    console.error('Error loading tracking scripts:', error)
  }
})
