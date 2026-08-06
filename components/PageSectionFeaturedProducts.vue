<script setup>
import {
  filterProductsByCollection,
  formatShopPrice,
  resolveShopFilterId,
} from '~/utils/shopCollections'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { data: productData, pending } = useShopifyProducts()

const collection = computed(() =>
  resolveShopFilterId(props.section?.featuredProductsCollection || 'all'),
)

const limit = computed(() => {
  const value = Number(props.section?.featuredProductsLimit)
  return Number.isFinite(value) && value > 0 ? Math.min(value, 24) : 8
})

const products = computed(() => {
  const all = productData.value?.products ?? []
  const filtered = filterProductsByCollection(all, collection.value)
  return filtered.slice(0, limit.value)
})

const title = computed(() => props.section?.featuredProductsTitle?.trim() || '')
</script>

<template>
  <section
    class="page-section-featured-products"
    aria-label="Featured products"
  >
    <h2
      v-if="title"
      class="page-section-featured-products__title serif"
    >
      {{ title }}
    </h2>

    <div
      v-if="pending"
      class="page-section-featured-products__track"
      aria-busy="true"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="page-section-featured-products__cell page-section-featured-products__cell--loading"
      />
    </div>

    <div
      v-else-if="!products.length"
      class="page-section-featured-products__empty serif"
    >
      No products to show.
    </div>

    <div
      v-else
      class="page-section-featured-products__track"
    >
      <NuxtLink
        v-for="product in products"
        :key="product.variantId"
        :to="`/shop/${product.handle}`"
        class="page-section-featured-products__cell"
      >
        <ShopSaleBadge :on-sale="product.onSale" />
        <div class="page-section-featured-products__media">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.imageAlt || product.title"
            class="page-section-featured-products__image"
            loading="lazy"
          >
          <div
            v-else
            class="page-section-featured-products__placeholder"
            aria-hidden="true"
          />
        </div>
        <div class="page-section-featured-products__meta">
          <span class="page-section-featured-products__name">{{ product.title }}</span>
          <span class="page-section-featured-products__price">
            {{ formatShopPrice(product.price, product.currencyCode) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.page-section-featured-products {
  padding: clamp(2rem, 5vw, 4rem) 0;
  background: #fff;
  color: #111010;
}

.page-section-featured-products__title {
  margin: 0 0 1.25rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.page-section-featured-products__track {
  display: flex;
  gap: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid #111010;
  border-bottom: 1px solid #111010;
}

.page-section-featured-products__cell {
  position: relative;
  flex: 0 0 min(78vw, 320px);
  scroll-snap-align: start;
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100%;
  border-right: 1px solid #111010;
  text-decoration: none;
  color: inherit;
}

.page-section-featured-products__cell--loading {
  min-height: 360px;
  background: linear-gradient(90deg, #f3f3f3, #ececec, #f3f3f3);
  background-size: 200% 100%;
  animation: featured-shimmer 1.2s linear infinite;
}

@keyframes featured-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.page-section-featured-products__media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #fff;
}

.page-section-featured-products__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-featured-products__placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0ed;
}

.page-section-featured-products__meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem 1rem;
  border-top: 1px solid #111010;
}

.page-section-featured-products__name,
.page-section-featured-products__price {
  font-size: 11px;
  letter-spacing: 0.08em;
  line-height: 1.25;
  text-transform: uppercase;
}

.page-section-featured-products__empty {
  padding: 2rem clamp(1rem, 3vw, 2rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (min-width: 700px) {
  .page-section-featured-products__cell {
    flex-basis: min(42vw, 360px);
  }
}

@media (min-width: 1000px) {
  .page-section-featured-products__cell {
    flex-basis: min(28vw, 380px);
  }
}
</style>
