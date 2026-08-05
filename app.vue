<template>
  <div id="__crows-app">
    <ClientOnly>
      <Preloader
        :enabled="shouldRunPreloader"
        @preloader-complete="onPreloaderComplete"
        @preloader-ready="onPreloaderReady"
      />
    </ClientOnly>

    <ClientOnly>
      <LayoutGrid />
    </ClientOnly>

    <div
      id="app"
      :class="{ 'is--hidden': !preloaderReady }"
    >
      <Header />

      <main class="page-wrapper">
        <NuxtPage
          v-slot="{ Component }"
          :transition="nuxtPageTransition"
        >
          <PageTransitionFrame
            v-if="Component"
            :page-component="Component"
          />
        </NuxtPage>
      </main>

      <div data-transition-wrap class="transition" :style="transitionWrapStyle" aria-hidden="true">
        <div data-transition-primary class="transition__primary" />
        <div data-transition-secondary class="transition__secondary" />
      </div>

      <WhatsAppButton />
      <ClientOnly>
        <NewsletterPopup />
      </ClientOnly>
    </div>

    <ClientOnly>
      <CartDrawer />
    </ClientOnly>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
import WhatsAppButton from '~/components/WhatsAppButton.vue'

const {
  seoTitle,
  seoDescription,
  facebookShareImage,
  faviconUrl,
  faviconType,
  googleTagManagerId,
  metaPixelId,
  preloaderDisabled,
} = useSiteSettings()

const { nuxtPageTransition, pageTransitionWipeColor } = usePageTransition()
const transitionWrapStyle = computed(() => ({
  '--page-transition-wipe': pageBackgroundVar(pageTransitionWipeColor.value),
}))
const preloaderReady = ref(false)
const headerCanReveal = useState('crows_headerCanReveal', () => false)

const initialRoutePath = useState('crows_initialRoutePath', () => '')
const route = useRoute()

if (import.meta.server) {
  initialRoutePath.value = route.path
}
if (import.meta.client && !initialRoutePath.value) {
  initialRoutePath.value = window.location.pathname
}

const shouldRunPreloader = computed(() => initialRoutePath.value === '/' && !preloaderDisabled.value)

const pageTitle = useState('pageTitle', () => '')
const pageSeoTitle = useState('pageSeoTitle', () => '')
const pageSeoDescription = useState('pageSeoDescription', () => '')
const pageSeoImage = useState('pageSeoImage', () => '')

const fullTitle = computed(() => {
  if (pageSeoTitle.value) return pageSeoTitle.value

  const site = seoTitle.value || 'Crows Are White'
  const page = pageTitle.value
  return page && page !== site ? `${site} | ${page}` : site
})

const activeDescription = computed(() => pageSeoDescription.value || seoDescription.value)
const activeShareImage = computed(() => pageSeoImage.value || facebookShareImage.value)

useHead(() => {
  const gtmId = googleTagManagerId.value
  if (!gtmId || !/^GTM-[A-Z0-9]+$/i.test(gtmId)) return {}

  const gtmScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`

  return {
    script: [{ key: 'gtm', type: 'text/javascript', innerHTML: gtmScript }],
    noscript: [{
      key: 'gtm-noscript',
      tagPosition: 'bodyOpen',
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
    }],
  }
})

useHead(() => {
  const pixelId = metaPixelId.value
  if (!pixelId || !/^\d+$/.test(pixelId)) return {}

  return {
    noscript: [{
      key: 'meta-pixel-noscript',
      tagPosition: 'bodyOpen',
      innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" alt="" />`,
    }],
  }
})

useHead(() => {
  const meta = []
  const docTitle = fullTitle.value
  const siteName = seoTitle.value || 'Crows Are White'
  const siteUrl = import.meta.client ? window.location.origin : ''
  const currentUrl = import.meta.client ? window.location.href : siteUrl

  if (activeDescription.value) {
    meta.push({ name: 'description', content: activeDescription.value })
  }

  meta.push(
    { property: 'og:title', content: docTitle },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
  )

  if (currentUrl) meta.push({ property: 'og:url', content: currentUrl })
  if (activeDescription.value) meta.push({ property: 'og:description', content: activeDescription.value })
  if (activeShareImage.value) {
    meta.push(
      { property: 'og:image', content: activeShareImage.value },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
    )
  }

  meta.push(
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: docTitle },
  )
  if (activeDescription.value) meta.push({ name: 'twitter:description', content: activeDescription.value })
  if (activeShareImage.value) meta.push({ name: 'twitter:image', content: activeShareImage.value })

  return { title: docTitle, meta }
})

useHead(() => {
  if (!faviconUrl.value) return {}
  return {
    link: [{ key: 'favicon', rel: 'icon', type: faviconType.value, href: faviconUrl.value }],
  }
})

useHead(() => ({ htmlAttrs: { lang: 'en' } }))

function onPreloaderReady() {
  preloaderReady.value = true
  if (import.meta.client) document.body.classList.add('preloader-ready')
}

function onPreloaderComplete() {
  headerCanReveal.value = true
  if (import.meta.client) document.body.classList.add('preloader-complete')
}
</script>

<style>
#app.is--hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

#app:not(.is--hidden) {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease-in;
}

.page-transition-outer,
.page-transition-inner,
.page-transition-content {
  width: 100%;
  min-height: 100dvh;
  opacity: 1;
}
</style>
