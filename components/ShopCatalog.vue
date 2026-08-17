<script setup lang="ts">
import {
  SHOP_FILTERS,
  filterProductsByCollection,
  shopFilterFromQuery,
  shopIndexLink,
  type ShopFilterId,
} from '~/utils/shopCollections'

const route = useRoute()
const router = useRouter()
const { data: shopPage } = useShopPage()
const {data: productData, pending} = useShopifyProducts()
// Grid icons are 11×11: 1×1 (11px), 2×2 (5px), 3×3 (3px), 4×4 (2px) cells with 1px gaps.
function gridIconCells(offsets: number[]) {
  return offsets.flatMap((y) => offsets.map((x) => ({x, y, key: `${x}-${y}`})))
}

type ShopGridDensity = '1' | '2' | '3' | '4'

const GRID_VIEW_OPTIONS: {
  id: ShopGridDensity
  label: string
  offsets: number[]
  cellSize: number
}[] = [
  {id: '1', label: '1 column layout', offsets: [0], cellSize: 11},
  {id: '2', label: '2 column layout', offsets: [0, 6], cellSize: 5},
  {id: '3', label: '3 column layout', offsets: [0, 4, 8], cellSize: 3},
  {id: '4', label: '4 column layout', offsets: [0, 3, 6, 9], cellSize: 2},
]

const MOBILE_GRID_IDS: ShopGridDensity[] = ['1', '2']
const DESKTOP_GRID_IDS: ShopGridDensity[] = ['2', '3', '4']
const DESKTOP_GRID_MQ = '(min-width: 1000px)'

function isMobileWidth(width: number) {
  return width < 1000
}

function allowedGridDensities(width: number): ShopGridDensity[] {
  return isMobileWidth(width) ? MOBILE_GRID_IDS : DESKTOP_GRID_IDS
}

const MOBILE_GRID_STORAGE_KEY = 'shop-grid-density-mobile'
const DESKTOP_GRID_STORAGE_KEY = 'shop-grid-density-desktop'

const mobileGridDensity = useState<ShopGridDensity>('shop-grid-mobile', () => '2')
const desktopGridDensity = useState<ShopGridDensity>('shop-grid-desktop', () => '3')

function isValidStoredGridDensity(
  density: string | null,
  viewport: 'mobile' | 'desktop',
): density is ShopGridDensity {
  if (density !== '1' && density !== '2' && density !== '3' && density !== '4') return false
  const allowed = viewport === 'mobile' ? MOBILE_GRID_IDS : DESKTOP_GRID_IDS
  return allowed.includes(density)
}

function hydrateGridDensityCache() {
  if (!import.meta.client) return

  const mobile = localStorage.getItem(MOBILE_GRID_STORAGE_KEY)
  if (isValidStoredGridDensity(mobile, 'mobile')) {
    mobileGridDensity.value = mobile
  }

  const desktop = localStorage.getItem(DESKTOP_GRID_STORAGE_KEY)
  if (isValidStoredGridDensity(desktop, 'desktop')) {
    desktopGridDensity.value = desktop
  }
}

function storeGridDensity(width: number, density: ShopGridDensity) {
  if (isMobileWidth(width)) {
    mobileGridDensity.value = density
    if (import.meta.client) {
      localStorage.setItem(MOBILE_GRID_STORAGE_KEY, density)
    }
    return
  }

  desktopGridDensity.value = density
  if (import.meta.client) {
    localStorage.setItem(DESKTOP_GRID_STORAGE_KEY, density)
  }
}

const shopGridClass = computed(() => [
  `shop-grid--mobile-${mobileGridDensity.value}`,
  `shop-grid--desktop-${desktopGridDensity.value}`,
])

// Visual layout is CSS. This only keeps aria-pressed on the visible control.
const isDesktopViewport = ref(false)

function isGridOptionPressed(id: ShopGridDensity) {
  return (isDesktopViewport.value ? desktopGridDensity.value : mobileGridDensity.value) === id
}

function setViewMode(id: ShopGridDensity) {
  if (!import.meta.client) return
  const width = window.innerWidth
  if (!allowedGridDensities(width).includes(id)) return
  storeGridDensity(width, id)
}

onMounted(() => {
  hydrateGridDensityCache()

  const mql = window.matchMedia(DESKTOP_GRID_MQ)
  const syncViewport = () => {
    isDesktopViewport.value = mql.matches
  }
  syncViewport()
  mql.addEventListener('change', syncViewport)
  onUnmounted(() => {
    mql.removeEventListener('change', syncViewport)
  })
})

const activeFilter = ref<ShopFilterId>(shopFilterFromQuery(route.query.filter))

watch(
  () => route.query.filter,
  (value) => {
    activeFilter.value = shopFilterFromQuery(value)
  },
)

const products = computed(() =>
  filterProductsByCollection(productData.value?.products ?? [], activeFilter.value),
)

function setFilter(id: ShopFilterId) {
  if (activeFilter.value === id) return
  activeFilter.value = id
  router.replace(shopIndexLink(id))
}

const pageTitle = useState('pageTitle', () => '')
const shopHeading = computed(() => shopPage.value?.title?.trim() || 'Shop')
pageTitle.value = shopHeading.value

watch(shopHeading, (value) => {
  pageTitle.value = value
})

useHead({title: 'Shop — Crows Are White'})
</script>

<template>
  <div class="shop-page">
    <header class="shop-page__header wrapper">
      <h1 class="shop-page__title h1 serif light">
        {{ shopHeading }}
      </h1>
    </header>

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
          v-for="option in GRID_VIEW_OPTIONS"
          :key="option.id"
          type="button"
          class="shop-views__btn"
          :class="[
            `shop-views__btn--${option.id}`,
            {
              'is-active-mobile': mobileGridDensity === option.id,
              'is-active-desktop': desktopGridDensity === option.id,
            },
          ]"
          :aria-label="option.label"
          :aria-pressed="isGridOptionPressed(option.id)"
          @click="setViewMode(option.id)"
        >
          <svg
            viewBox="0 0 11 11"
            shape-rendering="crispEdges"
            aria-hidden="true"
          >
            <rect
              v-for="cell in gridIconCells(option.offsets)"
              :key="cell.key"
              :x="cell.x"
              :y="cell.y"
              :width="option.cellSize"
              :height="option.cellSize"
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
      :class="shopGridClass"
      aria-busy="true"
      aria-label="Loading products"
    >
      <ShopProductCard
        v-for="n in 6"
        :key="n"
        loading
        class="shop-cell"
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
      :class="shopGridClass"
    >
      <ShopProductCard
        v-for="product in products"
        :key="product.variantId"
        :product="product"
        class="shop-cell"
      />
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  min-height: 100dvh;
  padding-top: calc(var(--header-height, 112) * 1px);
  background: var(--shop-bg);
  color: var(--shop-text);
}

@media (max-width: 999px) {
  .shop-page {
    min-height: 0;
  }
}

.shop-page__header {
  padding-top: 0;
  padding-bottom: clamp(0.75rem, 2vw, 1.25rem);
}

.shop-page__title {
  margin: 0;
}

.shop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 52px;
  padding: 0.85rem var(--wrapper-padding);
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
  letter-spacing: 0.06em;
  font-size: 11px;
  font-weight: 400;
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
  position: relative;
  z-index: 1;
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

.shop-views__btn--3,
.shop-views__btn--4 {
  display: none;
}

.shop-views__btn.is-active-mobile,
.shop-views__btn:hover {
  opacity: 1;
}

@media (min-width: 1000px) {
  .shop-views__btn--1 {
    display: none;
  }

  .shop-views__btn--3,
  .shop-views__btn--4 {
    display: grid;
  }

  .shop-views__btn.is-active-mobile:not(:hover) {
    opacity: 0.4;
  }

  .shop-views__btn.is-active-desktop,
  .shop-views__btn:hover {
    opacity: 1;
  }
}

.shop-page__notice,
.shop-page__empty {
  padding: 170px 80px;
  border-bottom: 1px solid var(--shop-line);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
  text-align: center;
}

.shop-page__notice code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: none;
}

.shop-grid {
  display: grid;
  gap: 0;
  background: var(--shop-bg);
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

/* Mobile densities. Desktop overrides from 1000px. */
.shop-grid--mobile-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.shop-grid--mobile-1 .shop-cell {
  border-right: none;
}

.shop-grid--mobile-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shop-grid--mobile-2 .shop-cell:nth-child(2n) {
  border-right: none;
}

@media (min-width: 1000px) {
  .shop-grid--mobile-1 .shop-cell,
  .shop-grid--mobile-2 .shop-cell:nth-child(2n) {
    border-right: 1px solid var(--shop-line);
  }

  .shop-grid--desktop-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shop-grid--desktop-2 .shop-cell:nth-child(2n) {
    border-right: none;
  }

  .shop-grid--desktop-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .shop-grid--desktop-3 .shop-cell:nth-child(3n) {
    border-right: none;
  }

  .shop-grid--desktop-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .shop-grid--desktop-4 .shop-cell:nth-child(4n) {
    border-right: none;
  }
}

.shop-grid .shop-cell {
  aspect-ratio: 0.8;
}

</style>
