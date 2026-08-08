const CACHE_MAX_AGE = 60 * 60 * 24 * 7

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const city = String(query.city ?? '').trim()

  if (!city) {
    throw createError({
      statusCode: 400,
      statusMessage: 'City is required.',
    })
  }

  if (city.length > 80) {
    throw createError({
      statusCode: 400,
      statusMessage: 'City is too long.',
    })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', city)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CrowsAreWhite/1.0 (watching-from map)',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not look up that city.',
    })
  }

  const results = await response.json()
  const match = results?.[0]

  if (!match?.lat || !match?.lon) {
    throw createError({
      statusCode: 404,
      statusMessage: 'City not found.',
    })
  }

  const resolvedCity = match.address?.city
    || match.address?.town
    || match.address?.village
    || match.address?.municipality
    || match.name
    || city

  const resolvedCountry = match.address?.country || ''

  setResponseHeaders(event, {
    'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
  })

  return {
    city: resolvedCity,
    country: resolvedCountry,
    lat: Number.parseFloat(match.lat),
    lng: Number.parseFloat(match.lon),
    label: resolvedCountry ? `${resolvedCity}, ${resolvedCountry}` : resolvedCity,
  }
})
