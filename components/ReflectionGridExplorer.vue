<script setup>
import {
  applyReflectionFilters,
  getReflectionCountriesWithCounts,
} from '~/utils/reflections'

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
  displayMode: {
    type: String,
    default: 'grid',
    validator: (value) => value === 'grid' || value === 'list',
  },
})

const filterMode = ref('all')
const selectedCountry = ref('')
const visibleCount = ref(props.pageSize)

const countryOptions = computed(() =>
  getReflectionCountriesWithCounts(props.items),
)

const filteredItems = computed(() => {
  const country = filterMode.value === 'country' ? selectedCountry.value : ''

  return applyReflectionFilters(props.items, {
    country,
  })
})

const visibleItems = computed(() =>
  filteredItems.value.slice(0, visibleCount.value),
)

const hasMore = computed(() => visibleCount.value < filteredItems.value.length)

watch(
  () => [props.items.length, filterMode.value, selectedCountry.value],
  () => {
    visibleCount.value = props.pageSize
  },
)

function selectAll() {
  filterMode.value = 'all'
  selectedCountry.value = ''
}

function selectCountry(country) {
  filterMode.value = 'country'
  selectedCountry.value = country
}

function onCountryUpdate(country) {
  if (!country) {
    selectAll()
    return
  }

  selectCountry(country)
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
          :class="{ 'reflection-grid-explorer__filter--active': filterMode === 'all' }"
          @click="selectAll"
        >
          All
        </button>

        <ReflectionCountryDropdown
          class="reflection-grid-explorer__country-dropdown"
          :model-value="selectedCountry"
          :options="countryOptions.map((entry) => entry.country)"
          @update:model-value="onCountryUpdate"
        />
      </div>

      <div
        v-if="$slots['toolbar-end']"
        class="reflection-grid-explorer__toolbar-end"
      >
        <slot name="toolbar-end" />
      </div>
    </div>

    <div
      class="reflection-grid-explorer__body"
      :class="{ 'reflection-grid-explorer__body--with-sidebar': countryOptions.length }"
    >
      <aside
        v-if="countryOptions.length"
        class="reflection-grid-explorer__sidebar"
        aria-label="Countries"
      >
        <ul class="reflection-grid-explorer__country-list">
          <li
            v-for="entry in countryOptions"
            :key="entry.country"
          >
            <button
              type="button"
              class="reflection-grid-explorer__country serif"
              :class="{
                'reflection-grid-explorer__country--active':
                  filterMode === 'country' && selectedCountry === entry.country,
              }"
              @click="selectCountry(entry.country)"
            >
              <span class="reflection-grid-explorer__country-name">{{ entry.country }}</span>
              <span class="reflection-grid-explorer__country-count">({{ entry.count }})</span>
            </button>
          </li>
        </ul>
      </aside>

      <ReflectionWall
        v-if="displayMode === 'grid'"
        class="reflection-grid-explorer__wall"
        :items="visibleItems"
        :pending="pending"
        cards-open
      />

      <ReflectionList
        v-else
        class="reflection-grid-explorer__list"
        :items="visibleItems"
        :pending="pending"
      />
    </div>

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
  gap: clamp(1rem, 4vw, 3rem);
  min-width: 0;
}

.reflection-grid-explorer__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.65rem, 1.5vw, 1rem);
  overflow: visible;
}

.reflection-grid-explorer__toolbar-end {
  display: flex;
  align-items: center;
  margin-left: auto;
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

.reflection-grid-explorer__body {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 2rem);
  min-width: 0;
}

.reflection-grid-explorer__body--with-sidebar {
  gap: clamp(1.25rem, 3vw, 2.5rem);
}

.reflection-grid-explorer__country-dropdown {
  min-width: 0;
}

.reflection-grid-explorer__sidebar {
  display: none;
  min-width: 0;
}

.reflection-grid-explorer__country-list {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reflection-grid-explorer__country {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font-size: clamp(0.95rem, 1.35vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  line-height: 1.35;
  text-align: left;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.reflection-grid-explorer__country--active {
  opacity: 1;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

.reflection-grid-explorer__country:hover {
  opacity: 0.85;
}

.reflection-grid-explorer__country--active:hover {
  opacity: 1;
}

.reflection-grid-explorer__country-count {
  flex-shrink: 0;
  opacity: 0.72;
}

.reflection-grid-explorer__wall :deep(.reflection-wall) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 700px) {
  .reflection-grid-explorer__country-dropdown {
    display: none;
  }

  .reflection-grid-explorer__sidebar {
    display: block;
  }

  .reflection-grid-explorer__body--with-sidebar {
    display: grid;
    grid-template-columns: minmax(9rem, 12rem) minmax(0, 1fr);
    align-items: start;
    gap: clamp(1.5rem, 3vw, 3rem);
  }

  .reflection-grid-explorer__wall :deep(.reflection-wall) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1000px) {
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
