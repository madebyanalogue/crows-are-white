<script setup lang="ts">
import { buildDefaultRelatedProductsSection } from '~/utils/shopProductsSection'
import { shopFilterFromQuery, shopIndexLink } from '~/utils/shopCollections'

useShopPageColor()

const { data: shopPage } = await useShopPage()

const route = useRoute()
const handle = computed(() => route.params.handle as string)
const shopFilter = computed(() => shopFilterFromQuery(route.query.filter))
const shopBackLink = computed(() => shopIndexLink(shopFilter.value))

const {data, pending, error} = useShopifyProduct(handle)
const {addToCart, openCart} = useCart()

const product = computed(() => data.value?.product)

const relatedProductSections = computed(() => {
  const cmsSections = (shopPage.value?.sections || []).filter(
    (section) => section?.sectionType === 'relatedProducts',
  )

  if (cmsSections.length) return cmsSections
  if (!product.value) return []

  return [buildDefaultRelatedProductsSection(product.value)]
})
const selectedVariantId = ref('')

watch(product, (value) => {
  if (value?.variants[0]) {
    selectedVariantId.value = value.variants[0].id
  }
}, { immediate: true })

const selectedVariant = computed(() =>
  product.value?.variants.find((variant) => variant.id === selectedVariantId.value),
)

const displayImage = computed(() => {
  const variant = selectedVariant.value
  if (variant?.imageUrl) {
    return {url: variant.imageUrl, alt: variant.imageAlt || product.value?.title}
  }
  const firstImage = product.value?.images[0]
  if (firstImage) {
    return {url: firstImage.url, alt: firstImage.altText || product.value?.title}
  }
  if (product.value?.imageUrl) {
    return {url: product.value.imageUrl, alt: product.value.imageAlt || product.value.title}
  }
  return null
})

const adding = ref(false)

function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(Number(amount))
}

async function onAddToCart() {
  if (!selectedVariantId.value || adding.value) return
  adding.value = true
  try {
    await addToCart(selectedVariantId.value)
    openCart()
  } finally {
    adding.value = false
  }
}

watchEffect(() => {
  if (error.value) {
    showError({
      statusCode: error.value.statusCode || 404,
      statusMessage: error.value.statusMessage || 'Product not found',
    })
  }
})

useHead(() => ({
  title: product.value ? `${product.value.title} — Shop` : 'Shop — Crows Are White',
}))
</script>

<template>
  <div class="shop-page">
    <header class="shop-page__header shop-page__row">
      <div class="shop-page__header-inner">
        <NuxtLink :to="shopBackLink" class="shop-page__back">← Shop</NuxtLink>
        <p
          v-if="product?.productType"
          class="shop-page__type"
        >
          {{ product.productType }}
        </p>
        <h1 v-if="product" class="shop-page__title shop-page__title--product">
          {{ product.title }}
        </h1>
      </div>
    </header>

    <div v-if="pending" class="shop-product shop-product--loading shop-page__row">
      <div class="shop-product__media" />
      <div class="shop-product__details" />
    </div>

    <article v-else-if="product" class="shop-product shop-page__row">
      <div class="shop-product__media">
        <ShopSaleBadge :on-sale="selectedVariant?.onSale" />
        <img
          v-if="displayImage"
          :src="displayImage.url"
          :alt="displayImage.alt"
          class="shop-product__image"
        />
        <div v-else class="shop-product__placeholder" aria-hidden="true" />
      </div>

      <div class="shop-product__details">
        <p v-if="selectedVariant" class="shop-product__price">
          {{ formatPrice(selectedVariant.price, selectedVariant.currencyCode) }}
        </p>

        <p v-if="product.description" class="shop-product__description">
          {{ product.description }}
        </p>

        <div v-if="product.variants.length > 1" class="shop-product__variants">
          <label class="shop-product__label" for="variant-select">Variant</label>
          <select
            id="variant-select"
            v-model="selectedVariantId"
            class="shop-product__select"
          >
            <option
              v-for="variant in product.variants"
              :key="variant.id"
              :value="variant.id"
              :disabled="!variant.availableForSale"
            >
              {{ variant.title }}
              <template v-if="!variant.availableForSale"> — Sold out</template>
            </option>
          </select>
        </div>

        <button
          type="button"
          class="shop-product__add"
          :disabled="adding || !selectedVariant?.availableForSale"
          @click="onAddToCart"
        >
          {{ adding ? 'Adding…' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out' }}
        </button>
      </div>
    </article>

    <PageSectionRelatedProducts
      v-for="(section, index) in relatedProductSections"
      :key="section._id || `related-${index}`"
      :section="section"
    />
  </div>
</template>

<style scoped>
.shop-page {
  min-height: 100dvh;
  padding-top: calc(var(--header-height, 112) * 1px);
  background: var(--shop-bg);
  color: var(--shop-text);
}

.shop-page__row {
  border-bottom: 1px solid var(--shop-line);
}

.shop-page__header {
  padding: clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 2rem);
}

.shop-page__header-inner {
  display: grid;
  gap: 0.75rem;
}

.shop-page__back {
  font-size: 0.8125rem;
  text-decoration: none;
  color: inherit;
  opacity: 0.7;
}

.shop-page__back:hover {
  opacity: 1;
}

.shop-page__type {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.shop-page__title {
  font-size: clamp(2rem, 8vw, 4.5rem);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.shop-product {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .shop-product {
    grid-template-columns: 1fr 1fr;
    min-height: min(80dvh, 900px);
  }
}

.shop-product__media,
.shop-product__details {
  min-height: 0;
}

.shop-product__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4rem);
  border-bottom: 1px solid var(--shop-line);
}

@media (min-width: 900px) {
  .shop-product__media {
    border-bottom: 0;
    border-right: 1px solid var(--shop-line);
  }
}

.shop-product__image {
  display: block;
  max-width: min(100%, 28rem);
  max-height: min(70dvh, 36rem);
  width: auto;
  height: auto;
  object-fit: contain;
}

.shop-product__placeholder {
  width: min(72%, 16rem);
  aspect-ratio: 1;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.35);
}

.shop-product__details {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.25rem;
  padding: clamp(1.5rem, 3vw, 2.5rem);
}

.shop-product__price {
  font-size: 1.125rem;
}

.shop-product__description {
  max-width: 32rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.shop-product__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.6;
}

.shop-product__select {
  width: 100%;
  max-width: 20rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--shop-line);
  background: var(--shop-bg);
  color: inherit;
  font: inherit;
}

.shop-product__add {
  align-self: flex-start;
  padding: 0.85rem 1.5rem;
  border: 1px solid var(--shop-line);
  background: var(--shop-text);
  color: var(--shop-bg);
  font: inherit;
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.shop-product__add:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.shop-product--loading .shop-product__media,
.shop-product--loading .shop-product__details {
  min-height: 20rem;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shop-shimmer 1.2s ease-in-out infinite;
}

@keyframes shop-shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
</style>
