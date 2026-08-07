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
    <h2
      v-if="title"
      class="shop-products-section__title serif"
    >
      {{ title }}
    </h2>

    <ShopProductCarousel
      :products="products"
      :pending="pending"
      aria-label="Related products carousel"
    />
  </section>
</template>

<style scoped>
.shop-products-section {
  padding: clamp(2rem, 5vw, 4rem) 0;
  background: var(--shop-bg);
  color: var(--shop-text);
}

.shop-products-section__title {
  margin: 0 0 1.25rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
