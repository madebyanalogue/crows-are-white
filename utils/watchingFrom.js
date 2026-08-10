import { formatReflectionLocation, normalizeReflectionField } from '~/utils/reflections'

const CITY_COORDINATES = {
  'melbourne|australia': { lat: -37.8136, lng: 144.9631 },
  'kyoto|japan': { lat: 35.0116, lng: 135.7681 },
  'milan|italy': { lat: 45.4642, lng: 9.19 },
  'bristol|united kingdom': { lat: 51.4545, lng: -2.5879 },
  'vancouver|canada': { lat: 49.2827, lng: -123.1207 },
  'dublin|ireland': { lat: 53.3498, lng: -6.2603 },
  'seoul|south korea': { lat: 37.5665, lng: 126.978 },
  'portland|united states': { lat: 45.5152, lng: -122.6784 },
  'copenhagen|denmark': { lat: 55.6761, lng: 12.5683 },
  'singapore|singapore': { lat: 1.3521, lng: 103.8198 },
  'osaka|japan': { lat: 34.6937, lng: 135.5023 },
  'auckland|new zealand': { lat: -36.8485, lng: 174.7633 },
  'lisbon|portugal': { lat: 38.7223, lng: -9.1393 },
  'berlin|germany': { lat: 52.52, lng: 13.405 },
  'cape town|south africa': { lat: -33.9249, lng: 18.4241 },
  'edinburgh|united kingdom': { lat: 55.9533, lng: -3.1883 },
  'taipei|taiwan': { lat: 25.033, lng: 121.5654 },
  'madrid|spain': { lat: 40.4168, lng: -3.7038 },
  'stockholm|sweden': { lat: 59.3293, lng: 18.0686 },
  'san francisco|united states': { lat: 37.7749, lng: -122.4194 },
}

const COUNTRY_COORDINATES = {
  'afghanistan': { lat: 33.9391, lng: 67.71 },
  'albania': { lat: 41.1533, lng: 20.1683 },
  'algeria': { lat: 28.0339, lng: 1.6596 },
  'argentina': { lat: -38.4161, lng: -63.6167 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'austria': { lat: 47.5162, lng: 14.5501 },
  'bangladesh': { lat: 23.685, lng: 90.3563 },
  'belgium': { lat: 50.5039, lng: 4.4699 },
  'brazil': { lat: -14.235, lng: -51.9253 },
  'bulgaria': { lat: 42.7339, lng: 25.4858 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'chile': { lat: -35.6751, lng: -71.543 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'colombia': { lat: 4.5709, lng: -74.2973 },
  'croatia': { lat: 45.1, lng: 15.2 },
  'czech republic': { lat: 49.8175, lng: 15.473 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'estonia': { lat: 58.5953, lng: 25.0136 },
  'finland': { lat: 61.9241, lng: 25.7482 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'greece': { lat: 39.0742, lng: 21.8243 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'hungary': { lat: 47.1625, lng: 19.5033 },
  'iceland': { lat: 64.9631, lng: -19.0208 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'indonesia': { lat: -0.7893, lng: 113.9213 },
  'iran': { lat: 32.4279, lng: 53.688 },
  'iraq': { lat: 33.2232, lng: 43.6793 },
  'ireland': { lat: 53.4129, lng: -8.2439 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'jordan': { lat: 30.5852, lng: 36.2384 },
  'kenya': { lat: -0.0236, lng: 37.9062 },
  'latvia': { lat: 56.8796, lng: 24.6032 },
  'lebanon': { lat: 33.8547, lng: 35.8623 },
  'lithuania': { lat: 55.1694, lng: 23.8813 },
  'malaysia': { lat: 4.2105, lng: 101.9758 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'morocco': { lat: 31.7917, lng: -7.0926 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'new zealand': { lat: -40.9006, lng: 174.886 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'norway': { lat: 60.472, lng: 8.4689 },
  'pakistan': { lat: 30.3753, lng: 69.3451 },
  'peru': { lat: -9.19, lng: -75.0152 },
  'philippines': { lat: 12.8797, lng: 121.774 },
  'poland': { lat: 51.9194, lng: 19.1451 },
  'portugal': { lat: 39.3999, lng: -8.2245 },
  'romania': { lat: 45.9432, lng: 24.9668 },
  'russia': { lat: 61.524, lng: 105.3188 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'serbia': { lat: 44.0165, lng: 21.0059 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'slovakia': { lat: 48.669, lng: 19.699 },
  'slovenia': { lat: 46.1512, lng: 14.9955 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'sri lanka': { lat: 7.8731, lng: 80.7718 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'switzerland': { lat: 46.8182, lng: 8.2275 },
  'taiwan': { lat: 23.6978, lng: 120.9605 },
  'thailand': { lat: 15.87, lng: 100.9925 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'ukraine': { lat: 48.3794, lng: 31.1656 },
  'united arab emirates': { lat: 23.4241, lng: 53.8478 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  'united states': { lat: 37.0902, lng: -95.7129 },
  'vietnam': { lat: 14.0583, lng: 108.2772 },
}

function normalizeLocationKey(value) {
  return normalizeReflectionField(value).toLowerCase()
}

function locationKey(city, country) {
  return `${normalizeLocationKey(city)}|${normalizeLocationKey(country)}`
}

function hashOffset(seed) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index)
    hash |= 0
  }

  const x = ((Math.abs(hash) % 1000) / 1000) - 0.5
  const y = ((Math.abs(hash >> 8) % 1000) / 1000) - 0.5

  return { x: x * 8, y: y * 5 }
}

export function resolveWatchingFromCoordinates(city, country) {
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)
  const key = locationKey(normalizedCity, normalizedCountry)

  if (CITY_COORDINATES[key]) {
    return CITY_COORDINATES[key]
  }

  const cityOnlyMatch = Object.entries(CITY_COORDINATES).find(([entryKey]) => {
    const [entryCity] = entryKey.split('|')
    return entryCity === normalizeLocationKey(normalizedCity)
  })

  if (cityOnlyMatch) {
    return cityOnlyMatch[1]
  }

  const countryKey = normalizeLocationKey(normalizedCountry)
  const countryCoords = COUNTRY_COORDINATES[countryKey]

  if (!countryCoords) {
    return null
  }

  const offset = hashOffset(key || countryKey)

  return {
    lat: countryCoords.lat + offset.y,
    lng: countryCoords.lng + offset.x,
  }
}

export function buildWatchingFromLocation({
  city,
  country = '',
  lat,
  lng,
  count = 0,
  isUser = false,
}) {
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)

  if (!normalizedCity && !normalizedCountry) return null

  const coordinates = lat != null && lng != null
    ? { lat, lng }
    : resolveWatchingFromCoordinates(normalizedCity, normalizedCountry)

  if (!coordinates) return null

  const id = isUser
    ? `user|${normalizeLocationKey(normalizedCity)}`
    : locationKey(normalizedCity, normalizedCountry)

  return {
    id,
    city: normalizedCity,
    country: normalizedCountry,
    count,
    isUser,
    label: formatReflectionLocation({ city: normalizedCity, country: normalizedCountry }),
    ...coordinates,
    ...projectWatchingFromPoint(coordinates.lat, coordinates.lng),
  }
}

export function projectWatchingFromPoint(lat, lng) {
  return {
    x: lng + 180,
    y: 90 - lat,
  }
}

export function aggregateWatchingFromLocations(items = []) {
  const grouped = new Map()

  for (const item of items) {
    const city = normalizeReflectionField(item?.city)
    const country = normalizeReflectionField(item?.country)

    if (!city && !country) continue

    const key = locationKey(city, country)
    const existing = grouped.get(key)

    if (existing) {
      existing.count += 1
      continue
    }

    const coordinates = resolveWatchingFromCoordinates(city, country)
    if (!coordinates) continue

    grouped.set(key, buildWatchingFromLocation({
      city,
      country,
      count: 1,
      ...coordinates,
    }))
  }

  return attachCountryCounts([...grouped.values()].sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count
    return left.label.localeCompare(right.label)
  }))
}

export function matchesWatchingFromQuery(location, query) {
  const normalizedQuery = normalizeReflectionField(query).toLowerCase()
  if (!normalizedQuery) return false

  return [
    location.city,
    location.country,
    location.label,
  ].some((value) => normalizeLocationKey(value).includes(normalizedQuery))
}

export function findWatchingFromLocation(locations, query) {
  const normalizedQuery = normalizeReflectionField(query).toLowerCase()
  if (!normalizedQuery) return null

  return locations.find((location) => matchesWatchingFromQuery(location, normalizedQuery)) || null
}

export function summarizeWatchingFromStats(locations = []) {
  const countries = new Set()
  let cityCount = 0
  let reflectionCount = 0

  for (const location of locations) {
    if (location.country) {
      countries.add(normalizeLocationKey(location.country))
    }

    if (location.city || location.country) {
      cityCount += 1
    }

    reflectionCount += location.count || 0
  }

  return {
    countryCount: countries.size,
    cityCount,
    reflectionCount,
  }
}

export function formatWatchingFromStats({ countryCount, cityCount }) {
  const countriesLabel = countryCount === 1 ? 'country' : 'countries'
  const citiesLabel = cityCount === 1 ? 'city' : 'cities'
  return `${countryCount} ${countriesLabel}, ${cityCount} ${citiesLabel}`
}

export function attachCountryCounts(locations = []) {
  const countryTotals = new Map()

  for (const location of locations) {
    const countryKey = normalizeLocationKey(location.country)
    if (!countryKey) continue
    countryTotals.set(countryKey, (countryTotals.get(countryKey) || 0) + (location.count || 0))
  }

  return locations.map((location) => ({
    ...location,
    countryCount: countryTotals.get(normalizeLocationKey(location.country)) || location.count || 0,
  }))
}

export function mergeWatchingFromLocations(reflectionLocations, userLocation) {
  if (!userLocation) return reflectionLocations

  const existing = findWatchingFromLocation(reflectionLocations, userLocation.city)

  if (existing) {
    return reflectionLocations.map((location) =>
      location.id === existing.id
        ? { ...location, isUser: true }
        : location,
    )
  }

  return attachCountryCounts([userLocation, ...reflectionLocations])
}

export const MAP_MARKER_CLUSTER_THRESHOLD_PX = 21
export const MAP_VIEWBOX_WIDTH = 360
export const MAP_VIEWBOX_HEIGHT = 180

function markerCityLabel(location) {
  return normalizeReflectionField(location?.city)
    || normalizeReflectionField(location?.country)
    || location?.label
    || ''
}

export function buildWatchingFromMapMarker(locations = []) {
  if (!locations.length) return null

  const count = locations.reduce((sum, location) => sum + (location.count || 0), 0)
  const x = locations.reduce((sum, location) => sum + location.x, 0) / locations.length
  const y = locations.reduce((sum, location) => sum + location.y, 0) / locations.length
  const isCluster = locations.length > 1
  const cities = [...new Set(locations.map(markerCityLabel).filter(Boolean))]

  return {
    id: isCluster
      ? `cluster-${locations.map((location) => location.id).sort().join('--')}`
      : locations[0].id,
    isCluster,
    isUser: locations.some((location) => location.isUser),
    x,
    y,
    locations,
    count,
    cities,
    city: isCluster ? '' : locations[0].city,
    country: isCluster ? '' : locations[0].country,
    label: isCluster ? '' : locations[0].label,
  }
}

export function clusterWatchingFromMarkers(
  locations = [],
  {
    width = 0,
    height = 0,
    thresholdPx = MAP_MARKER_CLUSTER_THRESHOLD_PX,
    viewBoxWidth = MAP_VIEWBOX_WIDTH,
    viewBoxHeight = MAP_VIEWBOX_HEIGHT,
    zoomLevel = 1,
  } = {},
) {
  if (!locations.length) return []
  if (!width || !height) {
    return locations.map((location) => buildWatchingFromMapMarker([location]))
  }

  const resolvedZoom = Math.max(Number(zoomLevel) || 1, 1)
  const effectiveThreshold = thresholdPx / resolvedZoom

  const toPixel = (location) => ({
    px: (location.x / viewBoxWidth) * width,
    py: (location.y / viewBoxHeight) * height,
  })

  const parent = locations.map((_, index) => index)

  function find(index) {
    if (parent[index] !== index) {
      parent[index] = find(parent[index])
    }
    return parent[index]
  }

  function union(leftIndex, rightIndex) {
    parent[find(leftIndex)] = find(rightIndex)
  }

  for (let leftIndex = 0; leftIndex < locations.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < locations.length; rightIndex += 1) {
      const left = toPixel(locations[leftIndex])
      const right = toPixel(locations[rightIndex])
      const distance = Math.hypot(left.px - right.px, left.py - right.py)

      if (distance <= effectiveThreshold) {
        union(leftIndex, rightIndex)
      }
    }
  }

  const groups = new Map()

  for (let index = 0; index < locations.length; index += 1) {
    const root = find(index)
    const group = groups.get(root) || []
    group.push(locations[index])
    groups.set(root, group)
  }

  return [...groups.values()]
    .map((group) => buildWatchingFromMapMarker(group))
    .filter(Boolean)
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count
      return String(left.id).localeCompare(String(right.id))
    })
}

export function buildWatchingFromMapMarkers(
  locations = [],
  dimensions = {},
) {
  const reflectionLocations = locations.filter((location) => !location.isUser)
  const userLocation = locations.find((location) => location.isUser)
  const clustered = clusterWatchingFromMarkers(reflectionLocations, dimensions)
  const markers = [...clustered]

  if (userLocation) {
    markers.push(buildWatchingFromMapMarker([userLocation]))
  }

  return markers
}

export function formatWatchingFromMapMarkerTooltip(marker) {
  if (!marker) {
    return { primary: '', secondary: '' }
  }

  if (!marker.isCluster) {
    const location = marker.locations[0]
    const count = marker.count || location?.count || 0
    const suffix = count === 1 ? 'reflection' : 'reflections'

    return {
      primary: location?.label || formatReflectionLocation({
        city: location?.city,
        country: location?.country,
      }),
      secondary: `${count} ${suffix}`,
    }
  }

  const cities = marker.cities || []
  let secondary = ''

  if (cities.length <= 3) {
    secondary = cities.join(' · ')
  } else {
    secondary = `${cities.slice(0, 2).join(' · ')} · +${cities.length - 2} more`
  }

  return {
    primary: `${marker.count} reflections nearby`,
    secondary,
  }
}

export function formatWatchingFromMapMarkerSelectionLabel(marker) {
  if (!marker) return ''

  if (!marker.isCluster) {
    return marker.label || marker.locations?.[0]?.label || ''
  }

  const cities = marker.cities || []

  if (cities.length <= 3) {
    return cities.join(' · ')
  }

  return `${cities.slice(0, 2).join(' · ')} · +${cities.length - 2} more`
}
