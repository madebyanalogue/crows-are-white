const TRUSTPILOT_API_BASE = 'https://api.trustpilot.com/v1'
export const MAX_TRUSTPILOT_REVIEWS = 30
const TRUSTPILOT_API_MAX_PER_PAGE = 100

export const MOCK_TRUSTPILOT_DATA = {
  businessUnit: {
    id: 'mock-business-unit',
    displayName: 'Crows Are White',
    score: {
      trustScore: 4.9,
      stars: 5,
    },
    numberOfReviews: {
      total: 127,
    },
  },
  reviews: [
    {
      id: 'mock-review-1',
      stars: 5,
      title: 'Crows Are White provided an excellent service',
      text: 'Crows Are White provided an excellent service, their staff were knowledgeable and friendly and ensured that they found the best deal possible. Definitely recommend to anyone looking for vehicle financing.',
      createdAt: '2026-06-13T10:30:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Toby Buckley',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-2',
      stars: 5,
      title: 'As always Des and his team been amazing',
      text: 'As always Des and his team been amazing. From start to finish. Very helpful and got me a best deal possible. Have been using Crows Are White finance for over 6 years now and would definitely recommend to everyone if you are looking for great customer service and great deals.',
      createdAt: '2026-06-12T16:45:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Bhavin Patel',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-3',
      stars: 5,
      title: 'Fantastic service once again from Jack',
      text: 'Fantastic service once again from Jack at Crows Are White. Fast, efficient in completing and great service as always, will use again for financing. Jack makes the process very simple and liaised with the dealer promptly. 5* service would recommend.',
      createdAt: '2026-06-02T09:15:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Adam H',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-4',
      stars: 5,
      title: 'Great experience',
      text: 'Great experience with Jack. Super helpful, guided through the process and helped me get into my dream car. Very competitive finance.',
      createdAt: '2026-06-01T13:20:00Z',
      isVerified: false,
      consumer: {
        displayName: 'Alan Highcock',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-5',
      stars: 5,
      title: 'Very smooth very fast',
      text: 'Very smooth very fast. Got everything sorted for me with no troubles. Great company.',
      createdAt: '2026-05-23T11:00:00Z',
      isVerified: true,
      consumer: {
        displayName: 'customer',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-6',
      stars: 5,
      title: 'Great communication throughout',
      text: 'Great communication throughout.',
      createdAt: '2026-05-12T09:45:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Vic S',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-7',
      stars: 5,
      title: 'Great communication and cared about getting the deal done',
      text: 'Great communication and cared about getting the deal done. Chasing car dealership and going beyond expectation.',
      createdAt: '2026-05-12T08:30:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Mr S Shore',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-8',
      stars: 5,
      title: 'Good communication and straightforward process',
      text: 'Good communication and straightforward process.',
      createdAt: '2026-05-07T12:00:00Z',
      isVerified: true,
      consumer: {
        displayName: 'David Gray',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-9',
      stars: 5,
      title: 'Great communication',
      text: 'Great communication, clear instructions, fast friendly service. The authenticity apps worked very well to approve identity. All round, I can’t fault anything!',
      createdAt: '2026-05-02T15:10:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Mr Andrew Naylor',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-10',
      stars: 5,
      title: 'I just used Crows Are White to fund my new car',
      text: 'I just used dorsia to fund my new car as Land Rover APR was 11.9. Jack at Crows Are White managed to secure me a much better rate and the whole process was seamless and completed within a few days.',
      createdAt: '2026-05-01T14:20:00Z',
      isVerified: true,
      consumer: {
        displayName: 'Charlie S',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
    {
      id: 'mock-review-11',
      stars: 5,
      title: 'Very fast',
      text: 'Very fast and efficient.',
      createdAt: '2026-04-20T10:10:00Z',
      isVerified: true,
      consumer: {
        displayName: 'customernick watkins',
        displayLocation: 'GB',
      },
      links: [
        {
          rel: 'reviews/web',
          href: 'https://www.trustpilot.com',
        },
      ],
    },
  ],
}

export function extractDomainFromTrustpilotUrl(url) {
  if (!url || typeof url !== 'string') return ''

  try {
    const pathname = new URL(url.trim()).pathname
    const match = pathname.match(/\/review\/([^/]+)/i)
    return match?.[1]?.trim() || ''
  } catch {
    return ''
  }
}

function buildApiHeaders(apiKey) {
  return {
    apikey: apiKey,
    Accept: 'application/json',
  }
}

async function trustpilotFetch(path, { apiKey, query } = {}) {
  const url = new URL(`${TRUSTPILOT_API_BASE}${path}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const response = await fetch(url, {
    headers: buildApiHeaders(apiKey),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw createError({
      statusCode: response.status,
      statusMessage: `Trustpilot API error (${response.status})`,
      data: body,
    })
  }

  return response.json()
}

export async function findBusinessUnitId({ apiKey, domain }) {
  const data = await trustpilotFetch('/business-units/find', {
    apiKey,
    query: { name: domain },
  })

  return data?.id || ''
}

export async function getBusinessUnit({ apiKey, businessUnitId }) {
  return trustpilotFetch(`/business-units/${businessUnitId}`, { apiKey })
}

export async function getBusinessUnitReviews({
  apiKey,
  businessUnitId,
  perPage = 5,
  page = 1,
}) {
  return trustpilotFetch(`/business-units/${businessUnitId}/reviews`, {
    apiKey,
    query: {
      perPage,
      page,
      orderBy: 'createdat.desc',
    },
  })
}

function filterReviewsByMinStars(reviews, minStars) {
  if (!minStars) return reviews
  return reviews.filter((review) => review.stars >= Number(minStars))
}

function takeReviews(reviews, perPage) {
  return reviews.slice(0, perPage)
}

function getExpandedMockReviews(perPage) {
  const baseReviews = MOCK_TRUSTPILOT_DATA.reviews
  const count = Math.min(Math.max(perPage, 1), MAX_TRUSTPILOT_REVIEWS)

  return Array.from({ length: count }, (_, index) => {
    const template = baseReviews[index % baseReviews.length]

    return {
      ...template,
      id: `mock-review-${index + 1}`,
      consumer: {
        ...template.consumer,
        displayName: index < baseReviews.length
          ? template.consumer.displayName
          : `${template.consumer.displayName.replace(/\.$/, '')} ${index + 1}.`,
      },
    }
  })
}

export async function getTrustpilotReviews({
  apiKey,
  businessUnitId,
  domain,
  perPage = 5,
  stars,
  forceMock = false,
}) {
  if (forceMock || !apiKey) {
    const reviews = takeReviews(
      filterReviewsByMinStars(getExpandedMockReviews(perPage), stars),
      perPage,
    )

    return {
      mock: true,
      businessUnit: MOCK_TRUSTPILOT_DATA.businessUnit,
      reviews,
    }
  }

  let resolvedBusinessUnitId = businessUnitId

  if (!resolvedBusinessUnitId && domain) {
    resolvedBusinessUnitId = await findBusinessUnitId({ apiKey, domain })
  }

  if (!resolvedBusinessUnitId) {
    const reviews = takeReviews(
      filterReviewsByMinStars(getExpandedMockReviews(perPage), stars),
      perPage,
    )

    return {
      mock: true,
      businessUnit: MOCK_TRUSTPILOT_DATA.businessUnit,
      reviews,
      fallbackReason: 'missing-business-unit-id',
    }
  }

  const [businessUnit, reviewsResponse] = await Promise.all([
    getBusinessUnit({ apiKey, businessUnitId: resolvedBusinessUnitId }),
    getBusinessUnitReviews({
      apiKey,
      businessUnitId: resolvedBusinessUnitId,
      perPage: Math.min(perPage, TRUSTPILOT_API_MAX_PER_PAGE),
    }),
  ])

  const reviews = takeReviews(
    filterReviewsByMinStars(reviewsResponse.reviews || [], stars),
    perPage,
  )

  return {
    mock: false,
    businessUnit: {
      id: businessUnit.id,
      displayName: businessUnit.displayName,
      score: businessUnit.score,
      numberOfReviews: businessUnit.numberOfReviews,
    },
    reviews,
  }
}
