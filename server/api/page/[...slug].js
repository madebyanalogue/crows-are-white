import { getSanityClient } from '~/utils/sanity'
import { getRouterPageSlug, sanityFetchOptions } from '~/server/utils/sanityQuery'
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
    assembleWidgetFilmIds,
    assembleWidgetMxId,
    assembleWidgetTabs,
    assembleWidgetCountries,
    assembleWidgetStyle,
    assembleWidgetPrimaryColor,
    assembleWidgetSecondaryColor,
    assembleWidgetBackgroundColor,
    assembleWidgetPaddingTop,
    assembleWidgetPaddingBottom
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
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      ${colorField('pageColor')},
      ${colorField('pageTextColor')},
      ${colorField('menuBackgroundColor')},
      ${colorField('menuTextColor')},
      ${colorField('menuHighlightColor')},
      ${colorField('basketIconColor')},
      showNewsletterPopup,
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
