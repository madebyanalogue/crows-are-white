<script setup>
import {
  resolveShopSectionLimit,
  resolveShopSectionProducts,
} from '~/utils/shopProductsSection'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
const { data: productData, pending } = useShopifyProducts()

const excludeHandle = computed(() => {
  if (props.section?.relatedProductsExcludeCurrent === false) return null

  const handle = route.params.handle
  if (
    route.path.startsWith('/shop/')
    && typeof handle === 'string'
    && handle
    && handle !== 'cart'
    && !route.path.startsWith('/shop/collections/')
  ) {
    return handle
  }

  return null
})

const products = computed(() =>
  resolveShopSectionProducts(productData.value?.products ?? [], {
    collection: props.section?.relatedProductsCollection,
    limit: resolveShopSectionLimit(props.section?.relatedProductsLimit),
    excludeHandle: excludeHandle.value,
  }),
)

const title = computed(() => props.section?.relatedProductsTitle?.trim() || '')
</script>

<template>
  <section
    class="shop-products-section"
    aria-label="Related products"
  >
    <ShopProductCarousel
      :products="products"
      :pending="pending"
      variant="related"
      aria-label="Related products carousel"
    >
      <template
        v-if="title"
        #header
      >
        <h2 class="shop-products-section__title condensed h3">
          {{ title }}
        </h2>
      </template>
    </ShopProductCarousel>
  </section>
</template>

<style scoped>
.shop-products-section {
  padding: clamp(2rem, 5vw, 4rem) 0;
  background: var(--shop-bg);
  color: var(--shop-text);
}

.shop-products-section__title {
  margin: 0;
  padding: 0;
  font-weight: 300;
}
</style>
