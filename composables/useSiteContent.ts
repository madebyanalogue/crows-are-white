import {
  defaultFooterLegal,
  defaultFooterMenus,
  defaultMainMenu,
  defaultSocialLinks,
  faqItems as defaultFaqItems,
  film as defaultFilm,
  footerNavItems as defaultFooterNavItems,
  navItems as defaultNavItems,
  pressPhotos as defaultPressPhotos,
  pressQuotes as defaultPressQuotes,
  screenings as defaultScreenings,
  siteConfig as defaultSiteConfig,
  streamingLinks as defaultStreamingLinks,
} from '~/data/site'
import type {FooterMenuGroup, LegalLink, Menu, MenuItem, SocialLink} from '~/data/site'

type StreamingLink = {label: string; href: string; featured?: boolean}
type Screening = {
  date: string
  city: string
  state: string
  venue: string
  status: 'on-sale' | 'coming-soon'
  ticketUrl: string
}
type PressQuoteLayer = {
  asset?: {
    _id?: string
    url?: string
    metadata?: {dimensions?: {width?: number; height?: number}}
  }
}

type PressQuote = {
  _id?: string
  quote: string
  pub: string
  reviewer: string
  layer1?: PressQuoteLayer
  layer2?: PressQuoteLayer
  layer3?: PressQuoteLayer
}
type PressPhoto = {id: number; alt: string}
type FaqItem = {q: string; a: string}

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

const siteQuery = groq`{
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

function legacyNavToMenuItems(items: Array<{label: string; to: string}>): MenuItem[] {
  return items.map((item, index) => ({
    _key: `legacy-${index}`,
    itemType: 'link',
    text: item.label,
    link: {type: 'url', url: item.to},
  }))
}

export function useSiteContent() {
  const {data} = useSanityQuery<{
    settings?: {
      theatricalReleaseActive?: boolean
      mailchimpAction?: string
      assemble?: {
        enabled?: boolean
        filmId?: string
        mxId?: string
        countries?: string[]
      }
      navItems?: Array<{label: string; to: string}>
      footerNavItems?: Array<{label: string; to: string}>
      streamingLinks?: StreamingLink[]
      mainMenu?: Menu
      footerMenus?: FooterMenuGroup[]
      socialLinks?: SocialLink[]
      footerLegal?: LegalLink[]
    }
    film?: typeof defaultFilm
    screenings?: Screening[]
    pressQuotes?: PressQuote[]
    pressPhotos?: PressPhoto[]
    faqItems?: FaqItem[]
    pressKit?: {
      synopsis?: string
      contactName?: string
      contactEmail?: string
    }
  }>(siteQuery)

  const siteConfig = computed(() => ({
    theatricalReleaseActive:
      data.value?.settings?.theatricalReleaseActive ?? defaultSiteConfig.theatricalReleaseActive,
    mailchimpAction: data.value?.settings?.mailchimpAction ?? defaultSiteConfig.mailchimpAction,
  }))

  const assemble = computed(() => ({
    enabled: data.value?.settings?.assemble?.enabled === true,
    filmId: data.value?.settings?.assemble?.filmId?.trim() || '',
    mxId: data.value?.settings?.assemble?.mxId?.trim() || '',
    countries: data.value?.settings?.assemble?.countries || [],
  }))

  const mainMenuItems = computed(() => {
    const menuItems = data.value?.settings?.mainMenu?.items
    if (menuItems?.length) return menuItems
    const legacy = data.value?.settings?.navItems ?? defaultNavItems
    return legacyNavToMenuItems(legacy)
  })

  const footerMenus = computed(() => {
    const menus = data.value?.settings?.footerMenus
    if (menus?.length) return menus
    return defaultFooterMenus
  })

  const socialLinks = computed(() => {
    const links = data.value?.settings?.socialLinks
    if (links?.length) return links
    return defaultSocialLinks
  })

  const footerLegal = computed(() => {
    const links = data.value?.settings?.footerLegal
    if (links?.length) return links
    return defaultFooterLegal
  })

  const navItems = computed(() => data.value?.settings?.navItems ?? defaultNavItems)
  const footerNavItems = computed(() => data.value?.settings?.footerNavItems ?? defaultFooterNavItems)
  const streamingLinks = computed(() => data.value?.settings?.streamingLinks ?? defaultStreamingLinks)
  const film = computed(() => ({...defaultFilm, ...(data.value?.film ?? {})}))
  const screenings = computed(() =>
    data.value?.screenings?.length ? data.value.screenings : defaultScreenings,
  )
  const pressQuotes = computed(() =>
    data.value?.pressQuotes?.length ? data.value.pressQuotes : defaultPressQuotes,
  )
  const pressPhotos = computed(() =>
    data.value?.pressPhotos?.length ? data.value.pressPhotos : defaultPressPhotos,
  )
  const faqItems = computed(() => (data.value?.faqItems?.length ? data.value.faqItems : defaultFaqItems))
  const pressKit = computed(() => data.value?.pressKit ?? null)

  return {
    siteConfig,
    assemble,
    mainMenuItems,
    footerMenus,
    socialLinks,
    footerLegal,
    navItems,
    footerNavItems,
    streamingLinks,
    film,
    screenings,
    pressQuotes,
    pressPhotos,
    faqItems,
    pressKit,
  }
}
