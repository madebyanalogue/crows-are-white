<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Watching From',
  },
  placeholder: {
    type: String,
    default: 'Enter your city',
  },
})

const STORAGE_KEY = 'caw-watching-from-city'

const cityQuery = ref('')
const userLocation = ref(null)
const geocoding = ref(false)
const geocodeError = ref('')
let geocodeTimer = null
let geocodeRequestId = 0

const reflectionLocations = computed(() => aggregateWatchingFromLocations(props.items))

const mapStats = computed(() => summarizeWatchingFromStats(reflectionLocations.value))

const displayLocations = computed(() =>
  mergeWatchingFromLocations(reflectionLocations.value, userLocation.value),
)

const statsMessage = computed(() => {
  if (!mapStats.value.cityCount) {
    return 'Enter your city to place it on the map.'
  }

  return formatWatchingFromStats(mapStats.value)
})

const statusMessage = computed(() => {
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

onMounted(() => {
  hydrateSavedCity()
  if (cityQuery.value.trim()) {
    scheduleGeocode(cityQuery.value)
  }
})

onBeforeUnmount(clearGeocodeTimer)
</script>

<template>
  <section
    class="watching-from-section"
    aria-labelledby="watching-from-heading"
  >
    <div class="watching-from-section__header">
      <h4
        id="watching-from-heading"
        class="watching-from-section__title serif"
      >
        {{ title }}
      </h4>

      <label class="watching-from-section__field">
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

    <WatchingFromDiagram
      :locations="displayLocations"
      :active-location-id="userLocation?.id || ''"
    />

    <p
      v-if="statusMessage"
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

.watching-from-section__header {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1rem);
}

@media (min-width: 700px) {
  .watching-from-section__header {
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 18rem);
    align-items: end;
    gap: clamp(1rem, 3vw, 2rem);
  }
}

.watching-from-section__title {
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 300;
  letter-spacing: 0.04em;
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

.watching-from-section__status {
  margin: 0;
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.03em;
  opacity: 0.72;
}
</style>
