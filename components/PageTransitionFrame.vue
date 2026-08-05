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
        <!-- Footer temporarily disabled while simplifying the site -->
        <!-- <Footer /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
// import Footer from '~/components/Footer.vue'
import { routeRemovesHeaderPadding } from '~/utils/headerPadding'
import { getCachedPageForRoute, pageRemovesHeaderPadding } from '~/utils/videoSectionFlags'

defineProps({
  pageComponent: {
    type: [Object, Function],
    required: true,
  },
})

const route = useRoute()
const nuxtApp = useNuxtApp()

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
