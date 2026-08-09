<script setup>
import { filterReflectionsByMapMarker } from '~/utils/reflections'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  intro: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Enter your city',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  selectedMarkerId: {
    type: String,
    default: '',
  },
  showLeaveReflectionButton: {
    type: Boolean,
    default: false,
  },
  viewAllPath: {
    type: String,
    default: '',
  },
  viewAllLabel: {
    type: String,
    default: 'View all reflections →',
  },
})

const emit = defineEmits(['select-marker', 'submitted'])

const STORAGE_KEY = 'caw-watching-from-city'

const cityQuery = ref('')
const userLocation = ref(null)
const selectedMarker = ref(null)
const geocoding = ref(false)
const geocodeError = ref('')
const reflectionFormOpen = ref(false)
const reflectionFormRef = ref(null)
const activeReflectionIndex = ref(0)
const carouselCardOpen = ref(false)
const mapStageRef = ref(null)
const viewerHeight = ref(null)
let geocodeTimer = null
let geocodeRequestId = 0
let mapStageObserver = null
let layoutMediaQuery = null

const reflectionLocations = computed(() => aggregateWatchingFromLocations(props.items))

const mapStats = computed(() => summarizeWatchingFromStats(reflectionLocations.value))

const displayLocations = computed(() =>
  mergeWatchingFromLocations(reflectionLocations.value, userLocation.value),
)

const markerReflections = computed(() =>
  filterReflectionsByMapMarker(props.items, selectedMarker.value),
)

const activeReflection = computed(() =>
  markerReflections.value[activeReflectionIndex.value] || null,
)

const canStepReflections = computed(() => markerReflections.value.length > 1)

const resolvedTitle = computed(() => props.title.trim())
const resolvedIntro = computed(() => props.intro.trim())
const hasHeading = computed(() =>
  Boolean(resolvedTitle.value || resolvedIntro.value || props.viewAllPath),
)
const hasHeader = computed(() => hasHeading.value || !props.compact)

watch(
  () => activeReflection.value?._id,
  () => {
    carouselCardOpen.value = false
  },
)

function onCarouselCardOpen() {
  carouselCardOpen.value = true
}

function onCarouselCardClose() {
  carouselCardOpen.value = false
}

function syncViewerHeight() {
  if (!import.meta.client || !mapStageRef.value) {
    viewerHeight.value = null
    return
  }

  viewerHeight.value = mapStageRef.value.offsetHeight
}

function bindMapStageObserver() {
  if (!import.meta.client || !mapStageRef.value) return

  unbindMapStageObserver()
  mapStageObserver = new ResizeObserver(() => {
    syncViewerHeight()
  })
  mapStageObserver.observe(mapStageRef.value)
  syncViewerHeight()
}

function unbindMapStageObserver() {
  mapStageObserver?.disconnect()
  mapStageObserver = null
}

function handleLayoutMediaChange() {
  syncViewerHeight()
}

const statsMessage = computed(() => {
  if (!mapStats.value.cityCount) {
    return 'Enter your city to place it on the map.'
  }

  return formatWatchingFromStats(mapStats.value)
})

const statusMessage = computed(() => {
  if (selectedMarker.value && activeReflection.value) {
    const total = markerReflections.value.length
    const position = activeReflectionIndex.value + 1
    const suffix = total === 1 ? '1 reflection' : `${position} of ${total} reflections`

    if (selectedMarker.value.isCluster) {
      return `${selectedMarker.value.count} reflections nearby · ${suffix}`
    }

    const label = selectedMarker.value.label
      || selectedMarker.value.locations?.[0]?.label
      || ''
    return `${label} · ${suffix}`
  }

  const query = cityQuery.value.trim()

  if (geocoding.value) {
    return 'Locating your city…'
  }

  if (geocodeError.value) {
    return geocodeError.value
  }

  if (query && userLocation.value) {
    const matchedReflection = findWatchingFromLocation(reflectionLocations.value, query)
    if (matchedReflection?.count) {
      const suffix = matchedReflection.count > 1
        ? `${matchedReflection.count} reflections`
        : '1 reflection'
      return `${userLocation.value.label} · ${suffix}`
    }

    return `Watching from ${userLocation.value.label}`
  }

  return statsMessage.value
})

function selectMarker(marker) {
  if (!marker || marker.isUser) return

  selectedMarker.value = marker
  activeReflectionIndex.value = 0
  carouselCardOpen.value = false
  emit('select-marker', marker)
}

function stepReflection(direction) {
  const total = markerReflections.value.length
  if (total <= 1) return

  activeReflectionIndex.value = (
    activeReflectionIndex.value + direction + total
  ) % total
}

function openReflectionForm() {
  reflectionFormOpen.value = true
}

function closeReflectionForm() {
  reflectionFormOpen.value = false
  reflectionFormRef.value?.resetAll()
}

function onReflectionSubmitted(item) {
  emit('submitted', item)
}

function handleKeydown(event) {
  if (reflectionFormOpen.value && event.key === 'Escape') {
    event.preventDefault()
    closeReflectionForm()
    return
  }

  if (!selectedMarker.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    stepReflection(-1)
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    stepReflection(1)
  }
}

function hydrateSavedCity() {
  if (!import.meta.client) return

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) cityQuery.value = saved
  } catch {
    // Ignore storage errors.
  }
}

function clearGeocodeTimer() {
  if (geocodeTimer) {
    clearTimeout(geocodeTimer)
    geocodeTimer = null
  }
}

function resolveLocalCity(city) {
  const localMatch = findWatchingFromLocation(reflectionLocations.value, city)
  if (localMatch) {
    return buildWatchingFromLocation({
      city: localMatch.city,
      country: localMatch.country,
      lat: localMatch.lat,
      lng: localMatch.lng,
      count: localMatch.count,
      isUser: true,
    })
  }

  const coordinates = resolveWatchingFromCoordinates(city)
  if (!coordinates) return null

  return buildWatchingFromLocation({
    city,
    isUser: true,
    ...coordinates,
  })
}

async function geocodeCity(city) {
  const trimmed = city.trim()
  geocodeRequestId += 1
  const requestId = geocodeRequestId

  if (!trimmed) {
    userLocation.value = null
    geocodeError.value = ''
    geocoding.value = false
    return
  }

  geocoding.value = true
  geocodeError.value = ''

  const localLocation = resolveLocalCity(trimmed)
  if (localLocation) {
    if (requestId !== geocodeRequestId) return
    userLocation.value = localLocation
    geocoding.value = false
    return
  }

  try {
    const result = await $fetch('/api/geocode', {
      query: { city: trimmed },
    })

    if (requestId !== geocodeRequestId) return

    userLocation.value = buildWatchingFromLocation({
      city: result.city,
      country: result.country,
      lat: result.lat,
      lng: result.lng,
      isUser: true,
    })
  } catch (error) {
    if (requestId !== geocodeRequestId) return

    userLocation.value = null
    geocodeError.value = error?.data?.statusMessage
      || error?.statusMessage
      || 'Could not find that city.'
  } finally {
    if (requestId === geocodeRequestId) {
      geocoding.value = false
    }
  }
}

function scheduleGeocode(city) {
  clearGeocodeTimer()
  geocodeTimer = setTimeout(() => {
    geocodeCity(city)
  }, 350)
}

watch(cityQuery, (value) => {
  if (!import.meta.client) return

  try {
    const trimmed = value.trim()
    if (trimmed) {
      window.localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors.
  }

  scheduleGeocode(value)
})

watch(
  () => props.selectedMarkerId,
  (markerId) => {
    if (markerId) return
    selectedMarker.value = null
    activeReflectionIndex.value = 0
    carouselCardOpen.value = false
  },
)

watch(mapStageRef, (el, _, onCleanup) => {
  if (!el) {
    viewerHeight.value = null
    return
  }

  nextTick(bindMapStageObserver)

  onCleanup(() => {
    unbindMapStageObserver()
  })
})

watch(
  () => markerReflections.value.length,
  () => {
    nextTick(syncViewerHeight)
  },
)

onMounted(() => {
  hydrateSavedCity()
  if (cityQuery.value.trim()) {
    scheduleGeocode(cityQuery.value)
  }

  document.addEventListener('keydown', handleKeydown)

  if (import.meta.client) {
    layoutMediaQuery = window.matchMedia('(min-width: 700px)')
    layoutMediaQuery.addEventListener('change', handleLayoutMediaChange)
  }

  nextTick(bindMapStageObserver)
})

onBeforeUnmount(() => {
  clearGeocodeTimer()
  unbindMapStageObserver()
  layoutMediaQuery?.removeEventListener('change', handleLayoutMediaChange)
  layoutMediaQuery = null
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section
    class="watching-from-section"
    :class="{ 'watching-from-section--compact': compact }"
    :aria-labelledby="resolvedTitle ? 'watching-from-heading' : undefined"
    :aria-label="resolvedTitle ? undefined : (compact ? 'Reflections map' : 'Around the world map')"
  >
    <div
      v-if="hasHeader"
      class="watching-from-section__header"
    >
      <div
        v-if="hasHeading"
        class="watching-from-section__heading"
      >
        <h3
          v-if="resolvedTitle"
          id="watching-from-heading"
          class="watching-from-section__title h3 serif light"
        >
          {{ resolvedTitle }}
        </h3>
        <p
          v-if="resolvedIntro || viewAllPath"
          class="watching-from-section__byline light"
        >
          <template v-if="resolvedIntro">{{ resolvedIntro }}</template><template v-if="resolvedIntro && viewAllPath">&nbsp;</template><NuxtLink
            v-if="viewAllPath"
            :to="viewAllPath"
            class="watching-from-section__view-all"
          >
            {{ viewAllLabel }}
          </NuxtLink>
        </p>
      </div>

      <label
        v-if="!compact"
        class="watching-from-section__field"
      >
        <span class="watching-from-section__label">City</span>
        <input
          v-model="cityQuery"
          type="search"
          class="watching-from-section__input serif"
          :placeholder="placeholder"
          autocomplete="address-level2"
        >
      </label>
    </div>

    <div
      ref="mapStageRef"
      class="watching-from-section__map-stage"
    >
      <WatchingFromDiagram
        :locations="displayLocations"
        :active-location-id="userLocation?.id || ''"
        :selected-marker-id="selectedMarker?.id || props.selectedMarkerId || ''"
        @select-marker="selectMarker"
      />

      <div
        v-if="reflectionFormOpen"
        class="watching-from-section__map-form-overlay"
        @click.self="closeReflectionForm"
      >
        <div
          class="watching-from-section__map-form-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reflection-map-title"
          @click.stop
        >
          <button
            type="button"
            class="watching-from-section__map-form-close"
            aria-label="Close reflection form"
            @click="closeReflectionForm"
          >
            ×
          </button>

          <ReflectionSubmitForm
            ref="reflectionFormRef"
            id-prefix="reflection-map"
            variant="modal"
            :show-cancel="false"
            @submitted="onReflectionSubmitted"
          />
        </div>
      </div>

      <button
        v-if="showLeaveReflectionButton && !reflectionFormOpen"
        type="button"
        class="watching-from-section__leave-reflection serif"
        @click="openReflectionForm"
      >
        Leave a Reflection
      </button>
    </div>

    <div
      v-if="activeReflection"
      class="watching-from-section__viewer-wrap"
      :style="viewerHeight ? { height: `${viewerHeight}px` } : undefined"
    >
      <div class="watching-from-section__viewer-stack">
        <div class="watching-from-section__viewer">
          <button
            type="button"
            class="watching-from-section__nav"
            :disabled="!canStepReflections"
            aria-label="Previous reflection"
            @click="stepReflection(-1)"
          >
            <span
              class="watching-from-section__nav-arrow"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 12"
              >
                <path
                  d="M13 6H1M1 6l5-5M1 6l5 5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>

          <div class="watching-from-section__viewer-card">
            <ReflectionCard
              :key="activeReflection._id"
              :item="activeReflection"
              :index="activeReflectionIndex"
              :open="carouselCardOpen"
              :paper-tilt-max="2"
              click-only
              show-folded-location
              @open="onCarouselCardOpen"
              @close="onCarouselCardClose"
            />
          </div>

          <button
            type="button"
            class="watching-from-section__nav"
            :disabled="!canStepReflections"
            aria-label="Next reflection"
            @click="stepReflection(1)"
          >
            <span
              class="watching-from-section__nav-arrow watching-from-section__nav-arrow--next"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 12"
              >
                <path
                  d="M13 6H1M1 6l5-5M1 6l5 5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>

        <p
          class="watching-from-section__counter handwritten"
          :class="{ 'watching-from-section__counter--hidden': !canStepReflections }"
          :aria-hidden="!canStepReflections ? 'true' : undefined"
          aria-live="polite"
          :aria-label="`${activeReflectionIndex + 1} of ${markerReflections.length}`"
        >
          {{ activeReflectionIndex + 1 }}/{{ markerReflections.length }}
        </p>
      </div>
    </div>

    <p
      v-if="statusMessage && !compact"
      class="watching-from-section__status serif"
      aria-live="polite"
    >
      {{ statusMessage }}
    </p>
  </section>
</template>

<style scoped>
.watching-from-section {
  display: grid;
  gap: clamp(0.85rem, 2vw, 1.25rem);
}

@media (min-width: 700px) {
  .watching-from-section {
    grid-template-columns: 3fr 1fr;
    align-items: start;
  }

  .watching-from-section__header,
  .watching-from-section__status {
    grid-column: 1 / -1;
  }

  .watching-from-section__map-stage {
    grid-column: 1;
    min-width: 0;
    align-self: start;
  }

  .watching-from-section:not(:has(.watching-from-section__viewer-wrap)) .watching-from-section__map-stage {
    grid-column: 1 / -1;
  }

  .watching-from-section__viewer-wrap {
    grid-column: 2;
    min-width: 0;
    align-self: start;
    overflow: hidden;
  }
}

.watching-from-section--compact .watching-from-section__header {
  gap: clamp(0.55rem, 1.2vw, 0.75rem);
}

.watching-from-section--compact .watching-from-section__byline {
  margin: 0;
  max-width: none;
  font-family: var(--serif-body);
  font-size: clamp(0.92rem, 1.25vw, 1rem);
  opacity: 0.62;
}

.watching-from-section__view-all {
  display: inline;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: opacity 0.2s ease;
}

.watching-from-section__view-all:hover {
  opacity: 0.72;
}

.watching-from-section__header {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1rem);
}

@media (min-width: 700px) {
  .watching-from-section__header {
    grid-template-columns: 3fr 1fr;
    align-items: end;
    gap: clamp(1rem, 3vw, 2rem);
  }
}

.watching-from-section__heading {
  display: grid;
  gap: clamp(0.65rem, 1.5vw, 0.85rem);
}

.watching-from-section__title {
  margin: 0;
  text-align: left;
}

.watching-from-section__byline {
  margin: 0;
  max-width: 36rem;
  font-family: var(--serif-body);
  font-size: clamp(0.95rem, 1.35vw, 1.05rem);
  line-height: 1.45;
  letter-spacing: 0.01em;
  opacity: 0.72;
}

.watching-from-section__field {
  display: grid;
  gap: 0.35rem;
}

.watching-from-section__label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
}

.watching-from-section__input {
  width: 100%;
  margin: 0;
  padding: 0.55rem 0;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  background: transparent;
  color: inherit;
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  font-weight: 300;
  letter-spacing: 0.03em;
  outline: none;
}

.watching-from-section__input::placeholder {
  color: color-mix(in srgb, currentColor 42%, transparent);
}

.watching-from-section__input:focus-visible {
  border-bottom-color: currentColor;
}

.watching-from-section__map-stage {
  position: relative;
  min-width: 0;
  border: 1px dashed color-mix(in srgb, currentColor 24%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.watching-from-section__map-stage :deep(.watching-from-diagram) {
  border: 0;
  background: transparent;
}

.watching-from-section__map-form-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  background: color-mix(in srgb, currentColor 28%, transparent);
}

.watching-from-section__map-form-panel {
  position: relative;
  width: min(100%, 30rem);
  max-height: 100%;
  overflow: auto;
}

.watching-from-section__map-form-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--reflection-paper-text, #4a4844) 8%, transparent);
  color: var(--reflection-paper-text, #4a4844);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.watching-from-section__leave-reflection {
  position: absolute;
  right: clamp(0.75rem, 2vw, 1.25rem);
  bottom: clamp(0.75rem, 2vw, 1.25rem);
  z-index: 2;
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
  pointer-events: auto;
}

.watching-from-section__leave-reflection:hover {
  opacity: 0.65;
}

.watching-from-section__leave-reflection:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.watching-from-section__viewer-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.watching-from-section__viewer-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 2vw, 2rem);
  width: 100%;
}

.watching-from-section__viewer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1rem);
  width: 100%;
}

.watching-from-section__viewer-card {
  width: min(100%, 22rem);
  margin: 0 auto;
  aspect-ratio: 1 / 1;
}

.watching-from-section__counter {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 1.85rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  opacity: 0.75;
  pointer-events: none;
}

.watching-from-section__counter--hidden {
  opacity: 0;
}

.watching-from-section__nav {
  display: grid;
  place-items: center;
  border: 0;
  padding: 0.35rem 0.5rem;
  background: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.watching-from-section__nav-arrow {
  display: inline-flex;
  width: clamp(0.875rem, 1.4vw, 1.35rem);
  flex-shrink: 0;
  transform: translateY(-0.04em);
}

.watching-from-section__nav-arrow--next {
  transform: translateY(-0.04em) scaleX(-1);
}

.watching-from-section__nav-arrow svg {
  display: block;
  width: 100%;
  height: auto;
}

.watching-from-section__nav-arrow path {
  stroke-width: 1;
}

.watching-from-section__nav:hover:not(:disabled) {
  opacity: 1;
}

.watching-from-section__nav:disabled {
  opacity: 0;
  cursor: default;
}

.watching-from-section__status {
  margin: 0;
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.03em;
  opacity: 0.72;
}
</style>
