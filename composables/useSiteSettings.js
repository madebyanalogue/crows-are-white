import { resolveSanityAssetUrl } from '~/utils/sanity'
import { extractPageChromeColors, extractSiteChromeColors } from '~/utils/pageColors'
import {
  defaultFooterMenus,
  defaultMainMenu,
  defaultMainMenuSub,
  defaultPrivacyMenu,
} from '~/data/site'

const faviconMimeTypes = {
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export function useSiteSettings() {
  const { data: settings, refresh } = useFetch('/api/site-settings', {
    key: 'siteSettings',
    ...freshDataOptions,
  })

  const primaryMenu = computed(() => (
    settings.value?.primaryMenu
    || settings.value?.mainMenuLeft
    || defaultMainMenu
  ))
  const secondaryMenu = computed(() => (
    settings.value?.secondaryMenu
    || settings.value?.mainMenuSub
    || defaultMainMenuSub
  ))
  // Legacy aliases kept for any remaining consumers
  const mainMenuLeft = primaryMenu
  const mainMenuSub = secondaryMenu
  const mainMenuRight = computed(() => null)
  const mainMenuMobileLeft = computed(() => null)
  const mainMenuMobileRight = computed(() => null)
  const footerMenus = computed(() => {
    const menus = settings.value?.footerMenus
    if (menus?.length) return menus
    return defaultFooterMenus
  })
  const footerStrapline = computed(() => settings.value?.footerStrapline || [])
  const footerLegal = computed(() => settings.value?.footerLegal || [])
  const footerShopifyLine = computed(() => settings.value?.footerShopifyLine?.trim() || '')
  const privacyMenu = computed(() => settings.value?.privacyMenu || defaultPrivacyMenu)
  const siteTitle = computed(() => settings.value?.title || 'Crows Are White')
  const preloaderDisabled = computed(() => settings.value?.disablePreloader === true)
  const preloaderText = computed(() => settings.value?.preloaderText?.trim() || '')
  const preloaderTextJa = computed(() => settings.value?.preloaderTextJa?.trim() || '')
  const preloaderHoldSeconds = computed(() => {
    const value = Number(settings.value?.preloaderHoldSeconds)
    if (!Number.isFinite(value)) return 1.2
    return Math.min(Math.max(value, 0), 30)
  })
  const preloaderBackgroundColor = computed(() => settings.value?.preloaderBackgroundColor || 'crema')
  const preloaderForegroundColor = computed(() => settings.value?.preloaderForegroundColor || 'obsidian')
  const pageTransitionWipeColor = computed(() => settings.value?.pageTransitionWipeColor || 'aintree')
  const footerBackgroundColor = computed(() => settings.value?.footerBackgroundColor || 'crayon')
  const footerTextColor = computed(() => settings.value?.footerTextColor || 'racing-green')
  const footerSocialFeatureColor = computed(() => settings.value?.footerSocialFeatureColor || 'arancio')
  const footerMenuHoverColor = computed(() => settings.value?.footerMenuHoverColor || 'arancio')
  const seoTitle = computed(() => settings.value?.seoTitle || settings.value?.title || 'Crows Are White')
  const seoDescription = computed(() => settings.value?.seoDescription || '')
  const facebookShareImage = computed(() => resolveSanityAssetUrl(settings.value?.facebookShareImage?.asset))
  const faviconUrl = computed(() => resolveSanityAssetUrl(settings.value?.favicon?.asset))
  const faviconType = computed(() => {
    const extension = settings.value?.favicon?.asset?.extension?.toLowerCase() || 'png'
    return faviconMimeTypes[extension] || 'image/png'
  })
  const googleTagManagerId = computed(() => settings.value?.googleTagManagerId?.trim() || '')
  const metaPixelId = computed(() => settings.value?.metaPixelId?.trim() || '')
  const hotjarSiteId = computed(() => settings.value?.hotjarSiteId?.trim() || '')
  const mobileBreakpoint = computed(() => settings.value?.mobileBreakpoint ?? 1000)
  const trustpilotUrl = computed(() => '')
  const footerShowTrustpilot = computed(() => false)
  const whatsappEnabled = computed(() => false)
  const whatsappLinkUrl = computed(() => '')
  const whatsappPhoneNumber = computed(() => '')
  const whatsappMessage = computed(() => '')
  const whatsappUrl = computed(() => null)
  const theatricalReleaseActive = computed(() => settings.value?.theatricalReleaseActive !== false)
  const assemble = computed(() => ({
    enabled: settings.value?.assemble?.enabled === true,
    filmId: settings.value?.assemble?.filmId?.trim() || '',
    mxId: settings.value?.assemble?.mxId?.trim() || '',
    countries: settings.value?.assemble?.countries || [],
  }))
  const watchNowDropdown = computed(() => settings.value?.watchNowDropdown || null)
  const socialLinks = computed(() => settings.value?.socialLinks || [])
  const footerShowLogo = computed(() => settings.value?.footerShowLogo !== false)
  const footerSocialStyle = computed(() =>
    settings.value?.footerSocialStyle === 'initials' ? 'initials' : 'icons',
  )
  const mailchimpAction = computed(() => settings.value?.mailchimpAction || '')
  const cartDisplayMode = computed(() =>
    settings.value?.cartDisplayMode === 'drawer' ? 'drawer' : 'dropdown',
  )
  const menuColors = computed(() => extractSiteChromeColors(settings.value || {}))
  const shopColors = computed(() => extractPageChromeColors(settings.value?.shopColors || {}))
  const shopNewsletterBackground = computed(() => {
    const background = settings.value?.shopNewsletterBackground
    const mediaType = background?.mediaType || 'none'

    const imageUrl = mediaType === 'image'
      ? resolveSanityAssetUrl(background?.image?.asset)
      : null
    const videoUrl = mediaType === 'video'
      ? resolveSanityAssetUrl(background?.video?.asset)
      : null

    if (!imageUrl && !videoUrl) return null

    const overlay = Number(background?.overlayOpacity)

    return {
      imageUrl,
      videoUrl,
      alt: background?.image?.alt || '',
      textColor: background?.textColor === 'light' ? 'light' : 'dark',
      overlayOpacity: Number.isFinite(overlay) ? Math.min(Math.max(overlay, 0), 100) / 100 : 0,
    }
  })

  return {
    settings,
    refresh,
    primaryMenu,
    secondaryMenu,
    mainMenuLeft,
    mainMenuSub,
    mainMenuRight,
    mainMenuMobileLeft,
    mainMenuMobileRight,
    footerMenus,
    footerStrapline,
    footerLegal,
    footerShopifyLine,
    privacyMenu,
    siteTitle,
    preloaderDisabled,
    preloaderText,
    preloaderTextJa,
    preloaderHoldSeconds,
    preloaderBackgroundColor,
    preloaderForegroundColor,
    pageTransitionWipeColor,
    footerBackgroundColor,
    footerTextColor,
    footerSocialFeatureColor,
    footerMenuHoverColor,
    seoTitle,
    seoDescription,
    facebookShareImage,
    faviconUrl,
    faviconType,
    googleTagManagerId,
    metaPixelId,
    hotjarSiteId,
    mobileBreakpoint,
    trustpilotUrl,
    footerShowTrustpilot,
    whatsappEnabled,
    whatsappLinkUrl,
    whatsappPhoneNumber,
    whatsappMessage,
    whatsappUrl,
    theatricalReleaseActive,
    assemble,
    watchNowDropdown,
    socialLinks,
    footerShowLogo,
    footerSocialStyle,
    mailchimpAction,
    cartDisplayMode,
    menuColors,
    shopColors,
    shopNewsletterBackground,
  }
}
