import { getSanityClient } from '~/utils/sanity'

const menuProjection = `{
  title,
  items[] {
    _key,
    itemType,
    text,
    link {
      type,
      page->{ "slug": slug.current },
      url
    }
  }
}`

const siteQuery = `{
  "settings": *[_type == "siteSettings"][0]{
    theatricalReleaseActive,
    mailchimpAction,
    navItems,
    footerNavItems,
    streamingLinks,
    "assemble": assemble {
      enabled,
      filmId,
      mxId,
      countries
    },
    "mainMenu": mainMenu->${menuProjection},
    footerMenus[] {
      _key,
      title,
      "menu": menu->${menuProjection}
    },
    "privacyMenu": privacyMenu->${menuProjection},
    socialLinks,
    footerLegal
  },
  "film": *[_type == "film"][0]{
    title,
    year,
    runtime,
    director,
    imdb,
    trailer,
    trailerId,
    trailerSrc,
    trailerPoster,
    heroVideoId,
    heroVideoSrc,
    logline,
    writers,
    cinematography,
    rottenTomatoes,
    festivals,
    awards,
    laurels
  },
  "screenings": *[_type == "screening"] | order(sortOrder asc, date asc){
    date,
    city,
    state,
    venue,
    status,
    ticketUrl
  },
  "pressQuotes": *[_type == "pressQuote"] | order(sortOrder asc){
    _id,
    quote,
    "pub": publication,
    reviewer,
    layer1 {
      asset-> {
        _id,
        url,
        metadata { dimensions }
      }
    },
    layer2 {
      asset-> {
        _id,
        url,
        metadata { dimensions }
      }
    },
    layer3 {
      asset-> {
        _id,
        url,
        metadata { dimensions }
      }
    }
  },
  "pressPhotos": *[_type == "pressPhoto"] | order(sortOrder asc){
    "id": sortOrder,
    alt
  },
  "faqItems": *[_type == "faqItem"] | order(sortOrder asc){
    "q": question,
    "a": answer
  },
  "pressKit": *[_type == "pressKit"][0]{
    synopsis,
    contactName,
    contactEmail
  }
}`

export default defineEventHandler(async (event) => {
  const client = getSanityClient(useRuntimeConfig(event))
  return client.fetch(siteQuery)
})
