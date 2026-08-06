<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

const SHOP_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#111010',
  menuHighlightColor: '#111010',
  basketIconColor: '#111010',
}

const { data: page } = await useAsyncData('page-shop', () =>
  $fetch('/api/page/shop').catch(() => null),
)

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : SHOP_COLORS_FALLBACK,
))

const builderSections = computed(() =>
  (page.value?.sections || []).filter((section) =>
    section?.sectionType === 'newsletter' || section?.sectionType === 'featuredProducts',
  ),
)

const builderPage = computed(() => {
  if (!page.value || !builderSections.value.length) return null
  return {
    ...page.value,
    richText: [],
    sections: builderSections.value,
  }
})
</script>

<template>
  <div>
    <ShopCatalog />
    <PageContent
      v-if="builderPage"
      :page="builderPage"
    />
  </div>
</template>
