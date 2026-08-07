<script setup lang="ts">
import { buildDefaultRelatedProductsSection } from '~/utils/shopProductsSection'
import { shopFilterFromQuery, shopIndexHref } from '~/utils/shopCollections'
import { isVariantPurchasable } from '~/utils/shopVariants'

useShopPageColor()

const { data: shopPage } = await useShopPage()

const route = useRoute()
const handle = computed(() => route.params.handle as string)
const shopFilter = computed(() => shopFilterFromQuery(route.query.filter))
const shopBackLink = computed(() => shopIndexHref(shopFilter.value))

const {data, pending, error} = useShopifyProduct(handle)
const {addToCartWithOpen} = useCart()

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
const quantity = ref(1)
const adding = ref(false)

watch(product, (value) => {
  if (!value?.variants.length) {
    selectedVariantId.value = ''
    return
  }

  const currentVariant = value.variants.find((variant) => variant.id === selectedVariantId.value)
  if (currentVariant) return

  const firstVariant = value.variants.find((variant) => isVariantPurchasable(variant)) || value.variants[0]
  selectedVariantId.value = firstVariant.id
}, { immediate: true })

async function onAddToCart() {
  if (!selectedVariantId.value || adding.value) return
  adding.value = true
  try {
    await addToCartWithOpen(selectedVariantId.value, quantity.value)
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
    <div
      v-if="pending"
      class="shop-product-hero shop-product-hero--loading"
      aria-busy="true"
      aria-label="Loading product"
    />

    <ShopProductHero
      v-else-if="product"
      :product="product"
      :shop-back-link="shopBackLink"
      v-model:selected-variant-id="selectedVariantId"
      v-model:quantity="quantity"
      :adding="adding"
      @add-to-cart="onAddToCart"
    />

    <PageSectionRelatedProducts
      v-for="(section, index) in relatedProductSections"
      :key="section._id || `related-${index}`"
      :section="section"
    />
  </div>
</template>

<style scoped>
.shop-page {
  background: var(--shop-bg);
  color: var(--shop-text);
}

.shop-product-hero--loading {
  height: 100dvh;
  min-height: 600px;
  background:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04) 0%,
      rgba(0, 0, 0, 0.08) 50%,
      rgba(0, 0, 0, 0.04) 100%
    );
  background-size: 200% 100%;
  animation: shop-product-shimmer 1.2s ease-in-out infinite;
}

@keyframes shop-product-shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
</style>
