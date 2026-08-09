<script setup>
import {
  applyReflectionFilters,
  getReflectionCountries,
} from '~/utils/reflections'
import { formatWatchingFromMapMarkerSelectionLabel } from '~/utils/watchingFrom'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  pending: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 24,
  },
  selectedMapMarker: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['clear-map-marker'])

const filterMode = ref('all')
const selectedCountry = ref('')
const sortMode = ref('newest')
const randomSeed = ref(0)
const visibleCount = ref(props.pageSize)

const countryOptions = computed(() => getReflectionCountries(props.items))

const filteredItems = computed(() => {
  const country = filterMode.value === 'country' ? selectedCountry.value : ''

  return applyReflectionFilters(props.items, {
    mapMarker: props.selectedMapMarker,
    country,
    sort: sortMode.value,
    randomSeed: randomSeed.value,
  })
})

const visibleItems = computed(() =>
  filteredItems.value.slice(0, visibleCount.value),
)

const hasMore = computed(() => visibleCount.value < filteredItems.value.length)

const countryLabel = computed(() => {
  if (filterMode.value !== 'country' || !selectedCountry.value) {
    return 'Country'
  }

  return selectedCountry.value
})

const mapSelectionLabel = computed(() =>
  formatWatchingFromMapMarkerSelectionLabel(props.selectedMapMarker),
)

watch(
  () => [props.items.length, props.selectedMapMarker, filterMode.value, selectedCountry.value, sortMode.value, randomSeed.value],
  () => {
    visibleCount.value = props.pageSize
  },
)

watch(
  () => props.selectedMapMarker,
  (marker) => {
    if (!marker) return
    filterMode.value = 'all'
    selectedCountry.value = ''
  },
)

function selectAll() {
  filterMode.value = 'all'
  selectedCountry.value = ''
  emit('clear-map-marker')
}

function selectCountry(country) {
  filterMode.value = 'country'
  selectedCountry.value = country
  emit('clear-map-marker')
}

function onCountryChange(event) {
  const value = event.target.value

  if (!value) {
    selectAll()
    return
  }

  selectCountry(value)
}

function selectNewest() {
  sortMode.value = 'newest'
}

function selectRandom() {
  sortMode.value = 'random'
  randomSeed.value += 1
}

function loadMore() {
  visibleCount.value = Math.min(
    visibleCount.value + props.pageSize,
    filteredItems.value.length,
  )
}
</script>

<template>
  <div class="reflection-grid-explorer">
    <div
      class="reflection-grid-explorer__filters"
      role="toolbar"
      aria-label="Reflection filters"
    >
      <div class="reflection-grid-explorer__filter-group">
        <button
          type="button"
          class="reflection-grid-explorer__filter serif"
          :class="{ 'reflection-grid-explorer__filter--active': filterMode === 'all' && !selectedMapMarker }"
          @click="selectAll"
        >
          All
        </button>

        <label class="reflection-grid-explorer__country-filter">
          <span class="reflection-grid-explorer__filter serif reflection-grid-explorer__filter--country">
            {{ countryLabel }}
            <span aria-hidden="true">›</span>
          </span>
          <select
            class="reflection-grid-explorer__country-select"
            :value="filterMode === 'country' ? selectedCountry : ''"
            @change="onCountryChange"
          >
            <option value="">
              All countries
            </option>
            <option
              v-for="country in countryOptions"
              :key="country"
              :value="country"
            >
              {{ country }}
            </option>
          </select>
        </label>
      </div>

      <span
        class="reflection-grid-explorer__divider"
        aria-hidden="true"
      >|</span>

      <div class="reflection-grid-explorer__filter-group">
        <button
          type="button"
          class="reflection-grid-explorer__filter serif"
          :class="{ 'reflection-grid-explorer__filter--active': sortMode === 'newest' }"
          @click="selectNewest"
        >
          Newest
        </button>
        <button
          type="button"
          class="reflection-grid-explorer__filter serif"
          :class="{ 'reflection-grid-explorer__filter--active': sortMode === 'random' }"
          @click="selectRandom"
        >
          Random
        </button>
      </div>
    </div>

    <p
      v-if="selectedMapMarker"
      class="reflection-grid-explorer__location serif light"
    >
      <template v-if="selectedMapMarker.isCluster">
        Showing reflections near {{ mapSelectionLabel }}
      </template>
      <template v-else>
        Showing reflections from {{ mapSelectionLabel }}
      </template>
      <button
        type="button"
        class="reflection-grid-explorer__clear-location serif"
        @click="selectAll"
      >
        Clear
      </button>
    </p>

    <ReflectionWall
      class="reflection-grid-explorer__wall"
      :items="visibleItems"
      :pending="pending"
    />

    <div
      v-if="hasMore"
      class="reflection-grid-explorer__footer"
    >
      <button
        type="button"
        class="reflection-grid-explorer__load-more serif"
        @click="loadMore"
      >
        Load more
      </button>
    </div>
  </div>
</template>

<style scoped>
.reflection-grid-explorer {
  display: flex;
  flex-direction: column;
  gap: clamp(0.85rem, 2vw, 1.25rem);
  min-width: 0;
}

.reflection-grid-explorer__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(0.65rem, 1.5vw, 1rem);
}

.reflection-grid-explorer__filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(0.65rem, 1.5vw, 1rem);
}

.reflection-grid-explorer__divider {
  opacity: 0.35;
  font-weight: 300;
}

.reflection-grid-explorer__filter {
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font-size: clamp(0.95rem, 1.35vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.reflection-grid-explorer__filter--active {
  opacity: 1;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

.reflection-grid-explorer__filter:hover {
  opacity: 0.85;
}

.reflection-grid-explorer__country-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.reflection-grid-explorer__filter--country {
  pointer-events: none;
}

.reflection-grid-explorer__country-select {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}

.reflection-grid-explorer__location {
  margin: 0;
  font-size: clamp(0.92rem, 1.25vw, 1rem);
  letter-spacing: 0.02em;
  opacity: 0.72;
}

.reflection-grid-explorer__clear-location {
  margin-left: 0.65rem;
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  cursor: pointer;
  opacity: 0.72;
}

.reflection-grid-explorer__wall :deep(.reflection-wall) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 700px) {
  .reflection-grid-explorer__wall :deep(.reflection-wall) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.reflection-grid-explorer__footer {
  display: flex;
  justify-content: center;
  padding-top: 0.25rem;
}

.reflection-grid-explorer__load-more {
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.reflection-grid-explorer__load-more:hover {
  opacity: 0.65;
}

.reflection-grid-explorer__load-more:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
