<template>
  <div class="page-transition-outer">
    <div class="page-transition-inner">
      <div class="page-transition-content">
        <div
          class="page-root"
          :class="{ 'page-root--offset-first-section': applyFirstSectionOffset }"
        >
          <component :is="pageComponent" />
        </div>
        <Footer v-if="showFooter" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Footer from '~/components/Footer.vue'
import { routeRemovesHeaderPadding } from '~/utils/headerPadding'
import {
  getCachedPageForRoute,
  pageRemovesHeaderPadding,
  pageShowsFooter,
} from '~/utils/videoSectionFlags'

defineProps({
  pageComponent: {
    type: [Object, Function],
    required: true,
  },
})

const route = useRoute()
const nuxtApp = useNuxtApp()

const footerPageSlug = computed(() => {
  if (route.path.startsWith('/shop')) return 'shop'
  if (route.path === '/') return 'home'
  const slug = route.path.replace(/^\//, '').replace(/\/$/, '')
  return slug || null
})

const { data: footerPage } = useCmsPage(footerPageSlug)

const showFooter = computed(() => pageShowsFooter(footerPage.value))

const mountPath = route.path
const mountMeta = route.meta

function shouldRemovePadding() {
  return routeRemovesHeaderPadding(nuxtApp, mountPath, mountMeta)
}

const paddingRemovedAtMount = shouldRemovePadding()
const applyFirstSectionOffset = ref(!paddingRemovedAtMount)

if (!paddingRemovedAtMount) {
  watch(
    () => getCachedPageForRoute(nuxtApp, mountPath),
    (page) => {
      if (!page) return
      applyFirstSectionOffset.value = !pageRemovesHeaderPadding(page)
    },
    { immediate: true },
  )
}
</script>
