import { getSanityClient } from '~/utils/sanity'
import { colorField } from '~/server/utils/sanityColor'

const portableTextProjection = `{
  _type,
  _key,
  style,
  listItem,
  level,
  children[] {
    _type,
    _key,
    text,
    marks
  },
  markDefs[] {
    _type,
    _key,
    href
  }
}`

const menuProjection = `{
  title,
  items[] {
    _key,
    itemType,
    text,
    isButton,
    link {
      type,
      page-> {
        slug { current }
      },
      article-> {
        slug { current }
      },
      url
    }
  }
}`

export default defineEventHandler(async () => {
  const client = getSanityClient(useRuntimeConfig())

  const query = `*[_type == "siteSettings"][0] {
    title,
    disablePreloader,
    preloaderText,
    preloaderTextJa,
    preloaderHoldSeconds,
    ${colorField('preloaderBackgroundColor')},
    ${colorField('preloaderForegroundColor')},
    ${colorField('pageTransitionWipeColor')},
    ${colorField('footerBackgroundColor')},
    ${colorField('footerTextColor')},
    seoTitle,
    seoDescription,
    facebookShareImage {
      asset-> {
        _id,
        url,
        _ref
      }
    },
    favicon {
      asset-> {
        _id,
        url,
        _ref,
        extension
      }
    },
    googleAnalyticsId,
    googleTagManagerId,
    metaPixelId,
    hotjarSiteId,
    defaultCtaImage {
      asset-> {
        _id,
        url,
        _ref
      },
      alt
    },
    "primaryMenu": coalesce(primaryMenu-> ${menuProjection}, mainMenuLeft-> ${menuProjection}),
    "secondaryMenu": coalesce(secondaryMenu-> ${menuProjection}, mainMenuSub-> ${menuProjection}),
    mainMenuLeft-> ${menuProjection},
    mainMenuSub-> ${menuProjection},
    footerMenus[] {
      _key,
      title,
      "menu": coalesce(
        menu-> ${menuProjection},
        *[_type == "menu" && title == ^.title][0] ${menuProjection}
      )
    },
    footerStrapline[] ${portableTextProjection},
    footerLegal[] ${portableTextProjection},
    privacyMenu-> ${menuProjection},
    trustpilot {
      url,
      showInFooter
    },
    whatsapp {
      enabled,
      url,
      phoneNumber,
      message
    },
    theatricalReleaseActive,
    mailchimpAction,
    assemble {
      enabled,
      filmId,
      mxId,
      countries
    },
    cartDisplayMode,
    menuColors {
      menuBorderDisabled,
      ${colorField('menuBackgroundColor')},
      ${colorField('menuBorderColor')},
      ${colorField('menuTextColor')},
      ${colorField('menuHighlightColor')},
      ${colorField('basketIconColor')}
    },
    shopColors {
      ${colorField('pageColor')},
      ${colorField('pageTextColor')}
    },
    shopNewsletterBackground {
      mediaType,
      textColor,
      overlayOpacity,
      image {
        asset-> {
          _id,
          url
        },
        alt
      },
      video {
        asset-> {
          _id,
          url,
          mimeType
        }
      }
    },
    "watchNowDropdown": coalesce(
      watchNowDropdown,
      select(defined(streamingLinks) => {
        "buttonLabel": "Watch Now",
        "platformsLabel": "Also available on",
        "featuredLink": streamingLinks[featured == true][0]{
          label,
          href
        },
        "platforms": streamingLinks[featured != true]{
          label,
          href
        }
      })
    ),
    socialLinks
  }`

  return await client.fetch(query)
})
