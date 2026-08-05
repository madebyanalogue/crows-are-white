export default defineNuxtPlugin(async () => {
  try {
    const settings = await $fetch('/api/site-settings')
    const gaId = settings?.googleAnalyticsId?.trim()

    if (!gaId) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', gaId)
  } catch (error) {
    console.error('Error loading Google Analytics:', error)
  }
})
