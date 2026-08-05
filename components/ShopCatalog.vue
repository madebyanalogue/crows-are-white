<script setup lang="ts">
import {
  SHOP_FILTERS,
  filterProductsByCollection,
  formatShopPrice,
  resolveShopFilterId,
  type ShopFilterId,
} from '~/utils/shopCollections'

const route = useRoute()
const {shopNewsletterBackground} = useSiteSettings()
const {data: productData, pending} = useShopifyProducts()
const viewMode = ref<'feature' | 'grid'>('feature')

function filterFromRoute(): ShopFilterId {
  const raw = Array.isArray(route.query.filter) ? route.query.filter[0] : route.query.filter
  return resolveShopFilterId(typeof raw === 'string' ? raw : 'all')
}

const activeFilter = ref<ShopFilterId>(filterFromRoute())

const products = computed(() =>
  filterProductsByCollection(productData.value?.products ?? [], activeFilter.value),
)

function setFilter(id: ShopFilterId) {
  activeFilter.value = id
}

const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Shop'

useHead({title: 'Shop — Crows Are White'})

const SHOP_COLORS = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#111010',
  menuHighlightColor: '#111010',
  basketIconColor: '#111010',
}

usePageColor(SHOP_COLORS)

// Both icons are 11x11 pixel grids: 3px blocks in a 3x3, 2px blocks in a 4x4.
function iconCells(offsets: number[]) {
  return offsets.flatMap((y) => offsets.map((x) => ({x, y, key: `${x}-${y}`})))
}

const FEATURE_ICON_CELLS = iconCells([0, 4, 8])
const GRID_ICON_CELLS = iconCells([0, 3, 6, 9])
</script>

<template>
  <div class="shop-page">
    <div class="shop-toolbar">
      <div
        class="shop-filters"
        role="group"
        aria-label="Shop filters"
      >
        <button
          v-for="filter in SHOP_FILTERS"
          :key="filter.id"
          type="button"
          class="shop-filter"
          :class="{ 'is-active': activeFilter === filter.id }"
          :aria-pressed="activeFilter === filter.id"
          @click="setFilter(filter.id)"
        >
          <span class="shop-filter__base">{{ filter.label }}</span>
          <span
            class="shop-filter__hand handwritten"
            aria-hidden="true"
          >{{ filter.label }}</span>
        </button>
      </div>

      <div
        class="shop-views"
        role="group"
        aria-label="Grid layout"
      >
        <button
          type="button"
          class="shop-views__btn"
          :class="{ 'is-active': viewMode === 'feature' }"
          aria-label="Large layout"
          :aria-pressed="viewMode === 'feature'"
          @click="viewMode = 'feature'"
        >
          <svg
            viewBox="0 0 11 11"
            shape-rendering="crispEdges"
            aria-hidden="true"
          >
            <rect
              v-for="cell in FEATURE_ICON_CELLS"
              :key="cell.key"
              :x="cell.x"
              :y="cell.y"
              width="3"
              height="3"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          class="shop-views__btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          aria-label="Grid layout"
          :aria-pressed="viewMode === 'grid'"
          @click="viewMode = 'grid'"
        >
          <svg
            viewBox="0 0 11 11"
            shape-rendering="crispEdges"
            aria-hidden="true"
          >
            <rect
              v-for="cell in GRID_ICON_CELLS"
              :key="cell.key"
              :x="cell.x"
              :y="cell.y"
              width="2"
              height="2"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <p
      v-if="productData?.mock"
      class="shop-page__notice"
    >
      Shopify mock mode — connect store credentials in <code>.env</code> for live products.
    </p>

    <div
      v-if="pending"
      class="shop-grid"
      :class="`shop-grid--${viewMode}`"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="shop-cell shop-cell--loading"
      />
    </div>

    <div
      v-else-if="products.length === 0"
      class="shop-page__empty"
    >
      <p>No products in this collection yet.</p>
    </div>

    <div
      v-else
      class="shop-grid"
      :class="`shop-grid--${viewMode}`"
    >
      <NuxtLink
        v-for="product in products"
        :key="product.variantId"
        :to="`/shop/${product.handle}`"
        class="shop-cell"
      >
        <ShopSaleBadge :on-sale="product.onSale" />
        <div class="shop-cell__media">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.imageAlt || product.title"
            class="shop-cell__image"
            loading="lazy"
          >
          <div
            v-else
            class="shop-cell__placeholder"
            aria-hidden="true"
          />
        </div>
        <div class="shop-cell__meta">
          <span class="shop-cell__title">{{ product.title }}</span>
          <span class="shop-cell__price">{{ formatShopPrice(product.price, product.currencyCode) }}</span>
        </div>
      </NuxtLink>
    </div>

    <NewsletterBlock :background="shopNewsletterBackground" />
  </div>
</template>

<style scoped>
.shop-page {
  --shop-bg: #fff;
  --shop-line: #111010;
  min-height: 100dvh;
  padding-top: calc(var(--header-height, 112) * 1px);
  background: var(--shop-bg);
  color: var(--shop-line);
}

.shop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 52px;
  padding: 0.85rem clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--shop-line);
}

.shop-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
}

.shop-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
}

.shop-filter__base {
  display: block;
  transition: opacity 0.18s ease;
}

.shop-filter__hand {
  position: absolute;
  left: 0%;
  top: 50%;
  transform: translate(-15%, -52%);
  font-size: 1.35rem;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.shop-filter.is-active .shop-filter__base {
  opacity: 0;
}

.shop-filter.is-active .shop-filter__hand {
  opacity: 1;
}

.shop-filter:not(.is-active):hover {
  opacity: 0.65;
}

.shop-views {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.shop-views__btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.4;
  cursor: pointer;
}

.shop-views__btn svg {
  width: 11px;
  height: 11px;
  display: block;
}

.shop-views__btn.is-active,
.shop-views__btn:hover {
  opacity: 1;
}

.shop-page__notice,
.shop-page__empty {
  padding: 0.9rem clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--shop-line);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}

.shop-page__notice code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: none;
}

.shop-grid {
  display: grid;
  gap: 0;
  background: var(--shop-bg);
  border-left: 1px solid var(--shop-line);
}

.shop-grid--grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 700px) {
  .shop-grid--grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .shop-grid--grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.shop-grid--feature {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: dense;
}

@media (max-width: 899px) {
  .shop-grid--feature {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .shop-grid--feature .shop-cell:nth-child(6n + 1),
  .shop-grid--feature .shop-cell:nth-child(6n + 2) {
    grid-column: 1;
  }

  /* Spans two columns and two square rows, so it renders as a 2x2 square. */
  .shop-grid--feature .shop-cell:nth-child(6n + 3) {
    grid-column: 2 / span 2;
    grid-row: span 2;
    aspect-ratio: auto;
  }
}

.shop-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: inherit;
  text-decoration: none;
  background: var(--shop-bg);
  border-right: 1px solid var(--shop-line);
  border-bottom: 1px solid var(--shop-line);
  overflow: hidden;
}

.shop-grid .shop-cell {
  aspect-ratio: 1;
}

.shop-cell__media {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem) clamp(3.5rem, 7vw, 5rem);
}

.shop-cell__image {
  display: block;
  max-width: 72%;
  max-height: 72%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.shop-cell__placeholder {
  width: min(56%, 10rem);
  aspect-ratio: 1;
  border: 1px solid rgba(17, 16, 16, 0.18);
  background: rgba(17, 16, 16, 0.04);
}

.shop-cell__meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(0.85rem, 2vw, 1.35rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0 0.75rem;
  text-align: center;
  pointer-events: none;
}

.shop-cell__title,
.shop-cell__price {
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
}

.shop-cell__price {
  opacity: 0.72;
}

.shop-cell:hover .shop-cell__title,
.shop-cell:focus-visible .shop-cell__title {
  opacity: 0.7;
}

.shop-cell--loading {
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      rgba(17, 16, 16, 0.02) 0%,
      rgba(17, 16, 16, 0.07) 50%,
      rgba(17, 16, 16, 0.02) 100%
    );
  background-size: 200% 100%;
  animation: shop-shimmer 1.2s ease-in-out infinite;
}

@keyframes shop-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
