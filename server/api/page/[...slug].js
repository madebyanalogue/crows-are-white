import { getSanityClient } from '~/utils/sanity'
import { getRouterPageSlug, pageDocumentFilter, sanityFetchOptions } from '~/server/utils/sanityQuery'
import { colorField } from '~/server/utils/sanityColor'

const imageProjection = `{
  _type,
  asset-> {
    _id,
    url,
    metadata {
      dimensions,
      lqip
    }
  },
  alt,
  hotspot,
  crop
}`

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

function pageSectionProjection() {
  return `{
    _id,
    _type,
    sectionType,
    sectionBorderTop,
    sectionBorderBottom,
    basicPageHeadline,
    basicPagePaddingTop,
    basicPagePaddingBottom,
    basicPageBody[] ${portableTextProjection},
    typographyContent[] {
      _type,
      _key,
      text[] ${portableTextProjection}
    },
    articlesIndexVariant,
    articlesIndexIntro[] ${portableTextProjection},
    articlesIndexPaddingTop,
    contactInformationTitle[] ${portableTextProjection},
    contactInformationSubtitle,
    contactFormTitle[] ${portableTextProjection},
    contactFormSubtitle,
    contactFormPaddingTop,
    ${colorField('contactFormBackgroundColor')},
    ${colorField('contactFormTextColor')},
    contactFormFields[] {
      _key,
      fieldType,
      label,
      width,
      required
    },
    contactFormShowRequiredFieldsNote,
    contactFormSalesforceEnabled,
    contactFormPrivacyNotice[] ${portableTextProjection},
    contactFormMarketingConsentEnabled,
    contactFormMarketingConsentLabel,
    contactFormMarketingConsentRequired,
    newsletterTitle,
    newsletterIntro,
    ${colorField('newsletterBackgroundColor')},
    ${colorField('newsletterTextColor')},
    newsletterMediaType,
    newsletterOverlayOpacity,
    newsletterImage ${imageProjection},
    newsletterVideo {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    newsletterVideoSource,
    newsletterLoopCloudflare720,
    newsletterLoopCloudflare1080,
    newsletterUseWrapper,
    contactInformationItems[] {
      _key,
      title,
      description[] ${portableTextProjection},
      linkText,
      link {
        type,
        url,
        page-> {
          slug { current }
        }
      }
    },
    teamPaddingTop,
    ${colorField('teamBackgroundColor')},
    ${colorField('teamTextColor')},
    teamTitle[] ${portableTextProjection},
    teamSubtitle,
    teamMembers[] {
      _key,
      firstName,
      lastName,
      role,
      bio[] ${portableTextProjection},
      image ${imageProjection}
    },
    heroTitleTitle[] ${portableTextProjection},
    heroTitleVerticalLine,
    heroTitleMouseEffect,
    heroTitleMouseEffectImages[] ${imageProjection},
    heroTitleMouseEffectImageRatio,
    titleHeadline[] ${portableTextProjection},
    titleTextAndImagesPaddingTop,
    titleTextAndImagesPaddingBottom,
    titleTextAndImagesDividerAfterLastItem,
    titleTextAndImagesItems[] {
      _key,
      title[] ${portableTextProjection},
      description[] ${portableTextProjection},
      links[] {
        _key,
        linkText,
        page-> {
          slug { current }
        }
      },
      imagesGridTemplate,
      images[] {
        _key,
        caption,
        aspectRatio,
        aspectRatioValue,
        image ${imageProjection}
      }
    },
    textAndImageCaption,
    textAndImageTitle[] ${portableTextProjection},
    textAndImageTitleSize,
    textAndImageDescription[] ${portableTextProjection},
    textAndImageLinkText,
    textAndImageTitleCenter,
    textAndImageDescriptionCenter,
    textAndImagePaddingTop,
    textAndImagePaddingBottom,
    textAndImageLink {
      type,
      url,
      page-> {
        slug { current }
      }
    },
    textAndImageImage ${imageProjection},
    textAndImagePattern,
    textAndImageImageRatio,
    textAndImageBrandLogo ${imageProjection},
    textAndImageBrandLogoWidth,
    textAndImageBrandLogoBottomPadding,
    textAndImageBrandLogoRightOffset,
    textAndImageBrandLogoImageBottomOffset,
    textAndImageBrandLogoTextBottomOffset,
    textAndImageContentHeight,
    textAndImageReverseOrder,
    ctaBackgroundColor,
    ctaTitle[] ${portableTextProjection},
    ctaDescription[] ${portableTextProjection},
    ctaLinks[] {
      _key,
      type,
      linkTitle,
      page-> {
        slug { current }
      },
      url
    },
    ctaPaddingTop,
    ctaPaddingBottom,
    ctaPaddingTopMobile,
    ctaPaddingBottomMobile,
    testimonialItems[] {
      _key,
      quote,
      cite,
      image ${imageProjection}
    },
    testimonial,
    testimonialCite,
    testimonialPaddingTop,
    testimonialPaddingBottom,
    testimonialImage ${imageProjection},
    trustpilotReviewsTitle[] ${portableTextProjection},
    trustpilotReviewsCount,
    trustpilotReviewsMinStars,
    trustpilotReviewsPaddingTop,
    blocksTitle[] ${portableTextProjection},
    blocksLinkText,
    blocksLink {
      type,
      url,
      page-> {
        slug { current }
      }
    },
    blocksItems[] {
      _key,
      title,
      description[] ${portableTextProjection},
      image ${imageProjection}
    },
    processTitle[] ${portableTextProjection},
    processSteps[] {
      _key,
      title,
      description[] ${portableTextProjection}
    },
    horizontalGalleryTitle[] ${portableTextProjection},
    horizontalGalleryItems[] {
      _key,
      caption,
      size,
      align,
      image ${imageProjection},
      page-> {
        slug { current }
      }
    },
    stackPaddingTop,
    stackItems[] {
      _key,
      title[] ${portableTextProjection},
      description[] ${portableTextProjection},
      image ${imageProjection}
    },
    ownersPaddingTop,
    ownersItems[] {
      _key,
      title[] ${portableTextProjection},
      description[] ${portableTextProjection},
      keys[] {
        _key,
        ${colorField('color')},
        image ${imageProjection}
      }
    },
    featuredPostTitle[] ${portableTextProjection},
    featuredPostLinkTitle,
    featuredPostLink {
      type,
      url,
      page-> {
        slug { current }
      }
    },
    featuredPostArticle-> {
      _id,
      title[] ${portableTextProjection},
      slug,
      publishedAt,
      _createdAt,
      featuredImage ${imageProjection}
    },
    ${colorField('featuredPostBackgroundColor')},
    ${colorField('featuredPostTextColor')},
    featuredPostPaddingTop,
    videoTitle[] ${portableTextProjection},
    videoLinks[] {
      _key,
      type,
      linkTitle,
      page-> {
        slug { current }
      },
      url
    },
    videoRemoveHeaderPadding,
    videoTransparentHeader,
    videoHeroMode,
    videoShowTrustpilot,
    ${colorField('videoOverlayColor')},
    videoOverlayOpacity,
    videoPaddingTop,
    videoPaddingBottom,
    videoFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    inlineVideoTitle[] ${portableTextProjection},
    inlineVideoTitleSize,
    inlineVideoDescription[] ${portableTextProjection},
    inlineVideoLinks[] {
      _key,
      type,
      linkTitle,
      page-> {
        slug { current }
      },
      url
    },
    inlineVideoLinkText,
    inlineVideoLink {
      type,
      url,
      page-> {
        slug { current }
      }
    },
    inlineVideoPoster ${imageProjection},
    inlineVideoCaption,
    inlineVideoPaddingTop,
    inlineVideoPaddingBottom,
    inlineVideoReverseOrder,
    inlineVideoPreviewFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    inlineVideoFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    trailerTitle,
    ${colorField('trailerTextColor')},
    ${colorField('trailerBackgroundColor')},
    trailerRuntimeSeconds,
    trailerThumbnailType,
    trailerThumbnailVideoSource,
    trailerThumbnailLoopCloudflare720,
    trailerThumbnailLoopCloudflare1080,
    trailerSourceType,
    trailerVideoUrl,
    trailerScrollScale,
    trailerPaddingTop,
    trailerPaddingBottom,
    trailerThumbnailImage ${imageProjection},
    trailerThumbnailVideo {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    trailerVideoFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    heroShowLogo,
    heroLogoAlt,
    heroShowScrim,
    heroScrimOpacity,
    heroByline,
    heroFeatureColor,
    heroMenuFrosted,
    heroMenuBackgroundColor,
    heroMenuTextColor,
    heroMenuBorderColorMode,
    heroMenuBorderColor,
    heroVideoSource,
    heroLoopCloudflare720,
    heroLoopCloudflare1080,
    heroVideoId,
    heroVideoTransform,
    heroVideoFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    heroButtons[] {
      _key,
      style,
      type,
      linkTitle,
      url,
      page-> {
        slug { current }
      }
    },
    watchTitle,
    watchHeroOverlayOpacity,
    watchFillScreen,
    watchYear,
    watchRuntimeMinutes,
    watchCtaLabel,
    watchCtaLink {
      type,
      linkTitle,
      url,
      page-> {
        slug { current }
      }
    },
    watchPlatformsLabel,
    watchPlatformLinks[] {
      _key,
      label,
      url
    },
    watchPreviewVideoSource,
    watchPreviewLoopCloudflare720,
    watchPreviewLoopCloudflare1080,
    watchPreviewVideoId,
    watchPreviewVideoFile {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    featuredProductsTitle,
    featuredProductsCollection,
    featuredProductsLimit,
    relatedProductsTitle,
    relatedProductsCollection,
    relatedProductsLimit,
    relatedProductsExcludeCurrent,
    pressDefaultMedia {
      mediaType,
      alt,
      aspectRatio,
      imageCaption,
      image ${imageProjection},
      videoSource,
      loopCloudflare720,
      loopCloudflare1080,
      videoId,
      videoFile {
        asset-> {
          _id,
          url,
          mimeType
        }
      }
    },
    pressMediaItems[] {
      _key,
      mediaType,
      alt,
      image ${imageProjection},
      videoSource,
      loopCloudflare720,
      loopCloudflare1080,
      videoId,
      videoFile {
        asset-> {
          _id,
          url,
          mimeType
        }
      }
    },
    pressLinks[] {
      _key,
      linkTitle,
      type,
      url,
      openInNewTab,
      imageAlt,
      imageCaption,
      hoverText,
      linkIcon,
      imageAspectRatio,
      image ${imageProjection},
      page-> {
        slug { current }
      }
    },
    pressQuotesTitle,
    pressQuotesShowTitle,
    pressQuotesStackMode,
    pressQuotesAlign,
    pressQuotesItems[]-> {
      _id,
      quote,
      "pub": publication,
      reviewer,
      sortOrder,
      layer1 ${imageProjection},
      layer2 ${imageProjection},
      layer3 ${imageProjection}
    },
    videosScrollMode,
    textImageStackText[] ${portableTextProjection},
    textImageStackImages[] {
      _key,
      caption,
      image ${imageProjection}
    },
    textImageStackPaddingTop,
    textImageStackPaddingBottom,
    textImageStackReverseOrder,
    ${colorField('letterboxBackgroundColor')},
    letterboxAspectRatio,
    letterboxVideoFit,
    letterboxParallax,
    letterboxUseWrapper,
    letterboxVideoWidth,
    letterboxVideoAlign,
    letterboxVideoSource,
    letterboxVideo {
      asset-> {
        _id,
        url,
        mimeType,
        metadata {
          dimensions
        }
      }
    },
    letterboxLoopCloudflare720,
    letterboxLoopCloudflare1080,
    letterboxOverlayImage ${imageProjection},
    letterboxLinkText,
    letterboxLink {
      type,
      linkTitle,
      url,
      page-> {
        slug { current }
      }
    },
    screeningsTitle,
    screeningsLede,
    screeningsEmptyTitle,
    screeningsEmptyText,
    hostScreeningTitle,
    hostScreeningIntro,
    ${colorField('hostScreeningFormBackgroundColor')},
    ${colorField('hostScreeningTextColor')},
    ${colorField('hostScreeningAccentColor')},
    hostScreeningMediaType,
    hostScreeningOverlayOpacity,
    hostScreeningImage ${imageProjection},
    hostScreeningVideo {
      asset-> {
        _id,
        url,
        mimeType
      }
    },
    hostScreeningVideoSource,
    hostScreeningLoopCloudflare720,
    hostScreeningLoopCloudflare1080,
    assembleWidgetFilmIds,
    assembleWidgetMxId,
    assembleWidgetTabs,
    assembleWidgetCountries,
    assembleWidgetStyle,
    assembleWidgetPrimaryColor,
    assembleWidgetSecondaryColor,
    assembleWidgetBackgroundColor,
    assembleWidgetPaddingTop,
    assembleWidgetPaddingBottom,
    ugcTitle,
    ugcMaxItems,
    ugcPaddingTop,
    ugcPaddingBottom,
    reflectionsTitle,
    reflectionsWatchingFromTitle,
    reflectionsIntro,
    reflectionsMaxItems,
    reflectionsHideCardBorder,
    reflectionsBackgroundMediaType,
    reflectionsBackgroundVideoSource,
    reflectionsBackgroundVideo {
      asset-> {
        _id,
        url,
        mimeType,
        metadata {
          dimensions
        }
      }
    },
    reflectionsBackgroundLoopCloudflare720,
    reflectionsBackgroundLoopCloudflare1080,
    reflectionsBackgroundOverlayOpacity,
    reflectionsBackgroundScrimOpacity,
    reflectionsPaddingTop,
    reflectionsPaddingBottom
  }`
}

export default defineEventHandler(async (event) => {
  const slug = getRouterPageSlug(event)

  if (!slug) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
    })
  }

  try {
    const client = getSanityClient(useRuntimeConfig())
    const sectionFields = pageSectionProjection()
    const query = `*[${pageDocumentFilter()}][0] {
      _id,
      title,
      slug,
      ${colorField('pageColor')},
      ${colorField('pageTextColor')},
      showNewsletterPopup,
      showFooter,
      seoTitle,
      seoDescription,
      seoImage {
        asset-> {
          _id,
          url,
          extension
        }
      },
      devBackgroundImage {
        asset-> { url }
      },
      pageBackgroundMediaType,
      pageBackgroundVideoSource,
      pageBackgroundVideo {
        asset-> {
          _id,
          url,
          mimeType,
          metadata {
            dimensions
          }
        }
      },
      pageBackgroundLoopCloudflare720,
      pageBackgroundLoopCloudflare1080,
      pageBackgroundOverlayOpacity,
      pageBackgroundScrimOpacity,
      richText[] ${portableTextProjection},
      richTextTwoColumns,
      richTextPaddingTop,
      richTextPaddingBottom,
      "articleCta": *[_type == "siteSettings"][0].articleCta {
        title[] ${portableTextProjection},
        description[] ${portableTextProjection},
        links[] {
          _key,
          type,
          linkTitle,
          page-> {
            slug { current }
          },
          url
        }
      },
      "sections": sections[0...50]->${sectionFields}
    }`

    const page = await client.fetch(query, { slug }, sanityFetchOptions())

    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page not found',
      })
    }

    return page
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch page',
      data: error,
    })
  }
})
