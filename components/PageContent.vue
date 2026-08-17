<template>
  <div class="page-content">
      <div v-if="showPageIntro" class="wrapper">
        <div
          class="page-content__intro"
          :class="[
            introUsesTwoColumns
              ? 'page-content__intro--two-columns grid-1 gap-md-0'
              : 'page-content__intro--single grid-1',
            { 'page-content__intro--above-sections': hasSectionsBelow },
            {
              'page-content__intro--videos-mobile-only':
                hasVideosSection && showPageTitle && !hasRichText,
            },
          ]"
          :style="introPaddingStyle"
        >
          <div
            v-if="showPageIntroTitle"
            class="page-content__intro-title text-center "
            :class="[
              introUsesTwoColumns ? 'text-left-md' : 'text-center ',
              {
                'page-content__intro-title--videos-mobile-only':
                  hasVideosSection && showPageTitle,
              },
            ]"
          >
            <h1 :class="pageTitleClass">{{ page.title }}</h1>
          </div>
          <SanityContent
            v-if="hasRichText"
            :blocks="page.richText"
            class="rich-text underline-links "
            :class="introUsesTwoColumns ? 'max-width-medium' : 'page-content__intro-copy max-central-content'"
          />
        </div>
      </div>

      <template v-for="(section, index) in sections" :key="section._id || index">
        <PageSectionChrome :section="section">
        <PageSectionHero
          v-if="section.sectionType === 'hero'"
          :section="section"
        />
        <PageSectionWatch
          v-else-if="section.sectionType === 'watch'"
          :section="section"
        />
        <PageSectionTrailer
          v-else-if="section.sectionType === 'trailer'"
          :section="section"
        />
        <PageSectionFeaturedProducts
          v-else-if="section.sectionType === 'featuredProducts'"
          :section="section"
        />
        <PageSectionRelatedProducts
          v-else-if="section.sectionType === 'relatedProducts'"
          :section="section"
        />
        <PageSectionNewsletter
          v-else-if="section.sectionType === 'newsletter'"
          :section="section"
        />
        <PageSectionPress
          v-else-if="section.sectionType === 'press'"
          :section="section"
          :is-first-section="index === 0"
        />
        <PageSectionPressQuotes
          v-else-if="section.sectionType === 'pressQuotes'"
          :section="section"
        />
        <PageSectionVideos
          v-else-if="section.sectionType === 'videos'"
          :section="section"
        />
        <PageSectionScreenings
          v-else-if="section.sectionType === 'screenings'"
          :section="section"
        />
        <PageSectionHostScreening
          v-else-if="section.sectionType === 'hostScreening'"
          :section="section"
        />
        <PageSectionTextImageStack
          v-else-if="section.sectionType === 'textImageStack'"
          :section="section"
        />
        <PageSectionLetterboxVideo
          v-else-if="section.sectionType === 'letterboxVideo'"
          :section="section"
        />
        <PageSectionUgc
          v-else-if="section.sectionType === 'ugc'"
          :section="section"
        />
        <PageSectionQuarters
          v-else-if="section.sectionType === 'quarters'"
          :section="section"
        />
        <PageSectionReflections
          v-else-if="section.sectionType === 'reflections'"
          :section="section"
          :is-first-section="index === 0"
          :full-page="sections.length === 1"
        />
        <PageSectionSynopsis
          v-else-if="section.sectionType === 'synopsis'"
          :section="section"
        />
        <PageSectionLaurels
          v-else-if="section.sectionType === 'laurels'"
          :section="section"
        />
        <PageSectionBoldText
          v-else-if="section.sectionType === 'boldText'"
          :section="section"
        />
        <PageSectionPlaylist
          v-else-if="section.sectionType === 'playlist'"
          :section="section"
        />

        <PageSectionContactInformation
          v-else-if="section.sectionType === 'contactInformation'"
          :section="section"
        />
        <PageSectionContactForm
          v-else-if="section.sectionType === 'contactForm'"
          :section="section"
        />

        <!-- Legacy section types from a previous project — components kept for existing content -->
        <!--
        <PageSectionArticlesIndexText
          v-else-if="section.sectionType === 'articlesIndex' && section.articlesIndexVariant === 'text'"
          :section="section"
        />
        <PageSectionArticlesIndex
          v-else-if="section.sectionType === 'articlesIndex'"
          :section="section"
        />
        <PageSectionBasicPage
          v-else-if="section.sectionType === 'basicPage'"
          :section="section"
        />
        <PageSectionTypography
          v-else-if="section.sectionType === 'typography'"
          :section="section"
        />
        <PageSectionTeam
          v-else-if="section.sectionType === 'team'"
          :section="section"
        />
        <PageSectionTitle
          v-else-if="section.sectionType === 'title'"
          :section="section"
        />
        <PageSectionHeroTitle
          v-else-if="section.sectionType === 'heroTitle'"
          :section="section"
        />
        <PageSectionTitleTextAndImages
          v-else-if="section.sectionType === 'titleTextAndImages'"
          :section="section"
        />
        <PageSectionTextAndImage
          v-else-if="section.sectionType === 'textAndImage'"
          :section="section"
        />
        <PageSectionCta
          v-else-if="section.sectionType === 'cta'"
          :section="section"
        />
        <PageSectionTestimonial
          v-else-if="section.sectionType === 'testimonial'"
          :section="section"
        />
        <PageSectionBlocks
          v-else-if="section.sectionType === 'blocks'"
          :section="section"
        />
        <PageSectionProcess
          v-else-if="section.sectionType === 'process'"
          :section="section"
        />
        <PageSectionVideo
          v-else-if="section.sectionType === 'video'"
          :section="section"
        />
        <PageSectionInlineVideo
          v-else-if="section.sectionType === 'inlineVideo'"
          :section="section"
        />
        <PageSectionTrustpilotReviews
          v-else-if="section.sectionType === 'trustpilotReviews'"
          :section="section"
        />
        <PageSectionFeaturedPost
          v-else-if="section.sectionType === 'featuredPost'"
          :section="section"
        />
        <PageSectionStack
          v-else-if="section.sectionType === 'stack'"
          :section="section"
        />
        <Owners
          v-else-if="section.sectionType === 'owners'"
          :section="section"
        />
        <PageSectionHorizontalGallery
          v-else-if="section.sectionType === 'horizontalGallery'"
          :section="section"
        />
        <PageSectionAssembleWidget
          v-else-if="section.sectionType === 'assembleWidget'"
          :section="section"
        />
        -->
        </PageSectionChrome>
      </template>
  </div>
</template>

<script setup>
const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
})

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  if (props.page?.title) {
    pageTitle.value = props.page.title
  }
})

const hasRichText = computed(() => (props.page?.richText?.length ?? 0) > 0)
const richTextTwoColumns = computed(() => props.page?.richTextTwoColumns !== false)
const sections = computed(() => (props.page?.sections || []).filter(Boolean))
const hasVideosSection = computed(() =>
  sections.value.some((section) => section?.sectionType === 'videos'),
)
const hasSectionsBelow = computed(() => sections.value.length > 0)
const introUsesTwoColumns = computed(() => hasRichText.value && richTextTwoColumns.value)
const showPageTitle = computed(() => props.page?.showPageTitle === true)
const pageTitleClass = computed(() =>
  props.page?.pageTitleStyle === 'serif' ? 'h1 serif light' : 'h1 condensed',
)
const showPageIntroTitle = computed(() =>
  showPageTitle.value || (sections.value.length === 0 && Boolean(props.page?.title)),
)
const showPageIntro = computed(() => hasRichText.value || showPageIntroTitle.value)

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  if (value === false) return 'none'
  return 'large'
}

const introPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.page?.richTextPaddingTop)],
  paddingBottom: hasSectionsBelow.value
    ? '0'
    : SECTION_PADDING_VALUES[resolveSectionPadding(props.page?.richTextPaddingBottom)],
}))
</script>

<style scoped>
@media (min-width: 1000px) {
  .page-content__intro--videos-mobile-only {
    display: none;
  }

  .page-content__intro-title--videos-mobile-only {
    display: none;
  }
}
</style>
