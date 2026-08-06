<template>
  <div class="page-content">
      <div v-if="showPageIntro" class="wrapper">
        <div
          class="page-content__intro"
          :class="richTextTwoColumns
            ? 'page-content__intro--two-columns grid-1 gap-section gap-md-0'
            : 'page-content__intro--single grid-1 gap-section'"
          :style="introPaddingStyle"
        >
          <div
            class="page-content__intro-title text-center "
            :class="richTextTwoColumns ? 'text-left-md' : 'text-center section-padding-small pad-top-bottom'"
          >
            <h1 class="h2 serif">{{ page.title }}</h1>
          </div>
          <SanityContent
            v-if="hasRichText"
            :blocks="page.richText"
            class="rich-text underline-links "
            :class="richTextTwoColumns ? 'max-width-medium' : 'page-content__intro-copy max-central-content'"
          />
        </div>
      </div>

      <template v-for="(section, index) in sections" :key="section._id || index">
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
        <PageSectionNewsletter
          v-else-if="section.sectionType === 'newsletter'"
          :section="section"
        />
        <PageSectionPress
          v-else-if="section.sectionType === 'press'"
          :section="section"
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
        <PageSectionContactInformation
          v-else-if="section.sectionType === 'contactInformation'"
          :section="section"
        />
        <PageSectionContactForm
          v-else-if="section.sectionType === 'contactForm'"
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
const showPageIntro = computed(() => hasRichText.value || (sections.value.length === 0 && Boolean(props.page?.title)))

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
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.page?.richTextPaddingBottom)],
}))
</script>

<style scoped>
@media (min-width: 1000px) {
  .page-content__intro--two-columns .page-content__intro-title h1 {
    position: sticky;
    top: calc(calc(var(--header-height) * 1px) + var(--section-padding));
  }
}
</style>
