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

type SiteContentData = {
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
}

function legacyNavToMenuItems(items: Array<{label: string; to: string}>): MenuItem[] {
  return items.map((item, index) => ({
    _key: `legacy-${index}`,
    itemType: 'link',
    text: item.label,
    link: {type: 'url', url: item.to},
  }))
}

export function useSiteContent() {
  const { data } = useAsyncData<SiteContentData | null>('site-content', () => $fetch('/api/site-content'), {
    default: () => null,
  })

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
