<script setup lang="ts">
import type {ShopifyProduct} from '~/types/shopify'
import {formatShopPrice, shopFilterFromQuery, shopProductLink} from '~/utils/shopCollections'

const props = defineProps<{
  product?: ShopifyProduct
  loading?: boolean
}>()

const route = useRoute()

const productTo = computed(() => {
  if (!props.product) return '/shop'
  const filter = shopFilterFromQuery(route.query.filter)
  return shopProductLink(props.product.handle, filter)
})
</script>

<template>
  <NuxtLink
    v-if="!loading && product"
    :to="productTo"
    class="shop-product-card"
  >
    <ShopSaleBadge :on-sale="product.onSale" />
    <div class="shop-product-card__media">
      <div
        v-if="product.imageUrl"
        class="shop-product-card__image-stack"
      >
        <img
          :src="product.imageUrl"
          :alt="product.imageAlt || product.title"
          class="shop-product-card__image shop-product-card__image--primary"
          draggable="false"
          loading="lazy"
          @dragstart.prevent
        >
        <img
          v-if="product.hoverImageUrl"
          :src="product.hoverImageUrl"
          :alt="product.hoverImageAlt || product.imageAlt || product.title"
          class="shop-product-card__image shop-product-card__image--hover"
          draggable="false"
          loading="lazy"
          @dragstart.prevent
        >
      </div>
      <div
        v-else
        class="shop-product-card__placeholder"
        aria-hidden="true"
      />
    </div>
    <div class="shop-product-card__meta">
      <span class="shop-product-card__title">{{ product.title }}</span>
      <span class="shop-product-card__price">
        <span
          v-if="product.onSale && product.compareAtPrice"
          class="shop-product-card__price-compare"
        >
          {{ formatShopPrice(product.compareAtPrice, product.currencyCode) }}
        </span>
        <span
          class="shop-product-card__price-current"
          :class="{ 'shop-product-card__price-current--sale': product.onSale && product.compareAtPrice }"
        >
          {{ formatShopPrice(product.price, product.currencyCode) }}
        </span>
      </span>
    </div>
  </NuxtLink>

  <div
    v-else
    class="shop-product-card shop-product-card--loading"
    aria-busy="true"
  >
    <span class="shop-product-card__shimmer" aria-hidden="true" />
  </div>
</template>

<style scoped>
.shop-product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  color: inherit;
  text-decoration: none;
  background: white;
  overflow: hidden;
}

.shop-product-card__media {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem) clamp(3.5rem, 7vw, 5rem);
}

.shop-product-card__image-stack {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.shop-product-card__image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: opacity 0.35s ease;
  -webkit-user-drag: none;
  user-select: none;
}

.shop-product-card__image--hover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
}

.shop-product-card:has(.shop-product-card__image--hover):hover .shop-product-card__image--primary,
.shop-product-card:has(.shop-product-card__image--hover):focus-visible .shop-product-card__image--primary {
  opacity: 0;
}

.shop-product-card:has(.shop-product-card__image--hover):hover .shop-product-card__image--hover,
.shop-product-card:has(.shop-product-card__image--hover):focus-visible .shop-product-card__image--hover {
  opacity: 1;
}

.shop-product-card__placeholder {
  width: min(56%, 10rem);
  aspect-ratio: 1;
  border: 1px solid rgba(17, 16, 16, 0.18);
  background: rgba(17, 16, 16, 0.04);
}

.shop-product-card__meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(0.85rem, 2vw, 1.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1rem;
  text-align: center;
  pointer-events: none;
}

.shop-product-card__title,
.shop-product-card__price {
  font-size: clamp(12px, 1.5vw, 14px);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
}

.shop-product-card__price {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.shop-product-card__price-current {
  opacity: 0.72;
}

.shop-product-card__price-compare {
  text-decoration: line-through;
  opacity: 0.55;
}

.shop-product-card__price-current--sale {
  color: #d40000;
  opacity: 1;
}

.shop-product-card:hover .shop-product-card__title,
.shop-product-card:focus-visible .shop-product-card__title {
  opacity: 0.7;
}

.shop-product-card--loading {
  pointer-events: none;
}

.shop-product-card__shimmer {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(17, 16, 16, 0.02) 0%,
      rgba(17, 16, 16, 0.07) 50%,
      rgba(17, 16, 16, 0.02) 100%
    );
  background-size: 200% 100%;
  animation: shop-product-card-shimmer 1.2s ease-in-out infinite;
}

@keyframes shop-product-card-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
