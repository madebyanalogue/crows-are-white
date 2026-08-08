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

const { data: productData, pending } = useShopifyProducts()

const products = computed(() =>
  resolveShopSectionProducts(productData.value?.products ?? [], {
    collection: props.section?.featuredProductsCollection,
    limit: resolveShopSectionLimit(props.section?.featuredProductsLimit),
  }),
)

const title = computed(() => props.section?.featuredProductsTitle?.trim() || '')
</script>

<template>
  <section
    class="shop-products-section"
    aria-label="Featured products"
  >
    <div class="wrapper">
      <ShopProductCarousel
        :products="products"
        :pending="pending"
        aria-label="Featured products carousel"
      >
        <template
          v-if="title || (!pending && products.length)"
          #header
        >
          <div class="shop-products-section__header">
            <h2
              v-if="title"
              class="shop-products-section__title serif"
            >
              {{ title }}
            </h2>
            <NuxtLink
              v-if="!pending && products.length"
              to="/shop"
              class="shop-products-section__view-all serif"
            >
              View all
            </NuxtLink>
          </div>
        </template>
      </ShopProductCarousel>
    </div>
  </section>
</template>

<style scoped>
.shop-products-section {
  padding: clamp(2rem, 5vw, 4rem) 0;
  background: var(--shop-bg);
  color: var(--shop-text);
}

.shop-products-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.shop-products-section__title {
  margin: 0;
  padding: 0;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.shop-products-section__view-all {
  flex-shrink: 0;
  margin-left: auto;
  color: inherit;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: .2em;
  transition: opacity 0.2s ease;
}

.shop-products-section__view-all:hover {
  opacity: 0.65;
}

.shop-products-section__view-all:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.shop-products-section :deep(.shop-product-card__meta) {
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 1.5rem 2rem 0;
  border-top: 1px dashed #ddd;
  text-align: left;
}

.shop-products-section :deep(.shop-product-card__title),
.shop-products-section :deep(.shop-product-card__price) {
  font-size: clamp(12px, 1.5vw, 17px);
  font-weight: 400;
  line-height: 1.2;
  font-family: var(--serif-body);
}

.shop-products-section :deep(.shop-product-card__price) {
  justify-content: flex-end;
}

.shop-products-section .wrapper :deep(.shop-product-carousel__header),
.shop-products-section .wrapper :deep(.shop-product-carousel__viewport),
.shop-products-section .wrapper :deep(.shop-product-carousel__empty) {
  padding-left: 0;
  padding-right: 0;
}

.shop-products-section .wrapper :deep(.shop-product-carousel__viewport) {
  scroll-padding-inline: 0;
}
</style>
