<script setup>
const { data: page } = await useShopPage()

usePageSeo(page)
useShopPageColor(page)

const builderSections = computed(() =>
  (page.value?.sections || []).filter((section) =>
    section?.sectionType === 'newsletter'
    || section?.sectionType === 'featuredProducts'
    || section?.sectionType === 'relatedProducts'
    || section?.sectionType === 'ugc',
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
