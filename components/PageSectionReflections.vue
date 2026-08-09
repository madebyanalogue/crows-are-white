<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'

const props = defineProps({
  section: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: 'A Place for Reflection',
  },
  paddingTop: {
    type: String,
    default: 'large',
  },
  paddingBottom: {
    type: String,
    default: 'large',
  },
  isFirstSection: {
    type: Boolean,
    default: false,
  },
  fullPage: {
    type: Boolean,
    default: false,
  },
})

const FULL_GRID_DEFAULT = 24

const VIEW_ALL_REFLECTIONS_PATH = '/reflections'

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

const DEFAULT_INTRO = `Stories often leave us with more questions than answers.

If this film stayed with you, we'd love to know what you took from it.

Read reflections from viewers around the world, or leave one of your own.`

const layoutMode = computed(() => {
  const cmsLayout = props.section?.reflectionsLayout
  if (cmsLayout === 'compact' || cmsLayout === 'full') return cmsLayout
  return props.fullPage ? 'full' : 'compact'
})

const isCompactLayout = computed(() => layoutMode.value === 'compact')
const isFullLayout = computed(() => layoutMode.value === 'full')
const hideFullHeader = computed(() =>
  isFullLayout.value && props.section?.reflectionsHideHeader === true,
)

const resolvedTitle = computed(() =>
  props.section?.reflectionsTitle?.trim() || props.title,
)

const introParagraphs = computed(() => {
  const text = props.section?.reflectionsIntro?.trim() || DEFAULT_INTRO
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
})

const bylineParagraph = computed(() => introParagraphs.value[0] || '')

const watchingFromTitle = computed(() =>
  props.section?.reflectionsWatchingFromTitle?.trim() || '',
)

const watchingFromIntro = computed(() =>
  props.section?.reflectionsWatchingFromIntro?.trim() || '',
)

const mapBackgroundImage = computed(() => {
  const image = props.section?.reflectionsMapBackgroundImage
  const url = resolveSanityAssetUrl(image?.asset)
  if (!url) return null

  return {
    url,
    alt: image?.alt || '',
  }
})

const mapLightStyle = computed(() => props.section?.reflectionsMapLightStyle === true)

const mapPostsLayout = computed(() =>
  props.section?.reflectionsMapPostsLayout === 'below' ? 'below' : 'sidebar',
)

const fullGridPageSize = computed(() => {
  const value = Number(props.section?.reflectionsMaxItems)
  if (!Number.isFinite(value) || value <= 0) return FULL_GRID_DEFAULT
  return Math.min(Math.max(Math.round(value), 1), 100)
})

const hasBackgroundVideo = computed(() =>
  props.section?.reflectionsBackgroundMediaType === 'video',
)

const sectionStyle = computed(() => {
  const style = {
    paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(
      props.section?.reflectionsPaddingBottom ?? props.paddingBottom,
    )],
    '--reflection-card-border': props.section?.reflectionsHideCardBorder === true
      ? 'none'
      : '1px solid var(--mid-border)',
  }

  if (!isFullLayout.value) {
    style.paddingTop = props.isFirstSection
      ? 'var(--page-top-offset)'
      : SECTION_PADDING_VALUES[resolveSectionPadding(
        props.section?.reflectionsPaddingTop ?? props.paddingTop,
      )]
  }

  return style
})

const fullViewTab = ref('list')
const { items, pending } = useReflections(500)

function selectFullViewTab(tab) {
  fullViewTab.value = tab
}
</script>

<template>
  <section
    class="page-section-reflections"
    :class="{
      'page-section-reflections--full-page': isFullLayout,
      'page-section-reflections--embedded': isCompactLayout,
      'page-section-reflections--has-background': hasBackgroundVideo,
      'page-section-reflections--header-hidden': hideFullHeader,
    }"
    aria-label="Reflections"
    :style="sectionStyle"
  >
    <PageFixedBackground
      :source="section"
      prefix="reflectionsBackground"
      :title="`${resolvedTitle} background`"
      :fixed="isFullLayout"
    />

    <div
      v-if="isFullLayout"
      class="page-section-reflections__content page-section-reflections__content--full"
    >
      <header
        v-if="!hideFullHeader"
        class="page-section-reflections__full-header wrapper"
      >
        <h3 class="page-section-reflections__title h3 serif light">
          {{ resolvedTitle }}
        </h3>
        <p
          v-if="bylineParagraph"
          class="page-section-reflections__byline serif light"
        >
          {{ bylineParagraph }}
        </p>

        <ReflectionViewTabs
          :active-tab="fullViewTab"
          @select="selectFullViewTab"
        />
      </header>

      <div class="page-section-reflections__views wrapper">
        <div
          v-show="fullViewTab === 'list'"
          id="reflections-panel-list"
          role="tabpanel"
          aria-labelledby="reflections-tab-list"
          class="page-section-reflections__view-panel"
        >
          <ReflectionGridExplorer
            display-mode="list"
            :items="items"
            :pending="pending"
            :page-size="fullGridPageSize"
          >
            <template
              v-if="hideFullHeader"
              #toolbar-end
            >
              <ReflectionViewTabs
                inline
                :active-tab="fullViewTab"
                @select="selectFullViewTab"
              />
            </template>
          </ReflectionGridExplorer>
        </div>

        <div
          v-show="fullViewTab === 'grid'"
          id="reflections-panel-grid"
          role="tabpanel"
          aria-labelledby="reflections-tab-grid"
          class="page-section-reflections__view-panel"
        >
          <ReflectionGridExplorer
            display-mode="grid"
            :items="items"
            :pending="pending"
            :page-size="fullGridPageSize"
          >
            <template
              v-if="hideFullHeader"
              #toolbar-end
            >
              <ReflectionViewTabs
                inline
                :active-tab="fullViewTab"
                @select="selectFullViewTab"
              />
            </template>
          </ReflectionGridExplorer>
        </div>

        <div
          v-show="fullViewTab === 'map'"
          id="reflections-panel-map"
          role="tabpanel"
          aria-labelledby="reflections-tab-map"
          class="page-section-reflections__view-panel"
        >
          <div
            v-if="hideFullHeader"
            class="page-section-reflections__toolbar"
          >
            <ReflectionViewTabs
              inline
              :active-tab="fullViewTab"
              @select="selectFullViewTab"
            />
          </div>

          <WatchingFromSection
            compact
            :items="items"
            :title="watchingFromTitle"
            :intro="watchingFromIntro"
            :map-background-image="mapBackgroundImage"
            :map-light-style="mapLightStyle"
            :map-posts-layout="mapPostsLayout"
          />
        </div>
      </div>

      <div class="page-section-reflections__rule wrapper">
        <hr class="page-section-reflections__divider">
      </div>

      <div
        id="reflection-submit"
        class="page-section-reflections__submit wrapper"
      >
        <header class="page-section-reflections__submit-header">
          <h3 class="page-section-reflections__submit-title h3 serif light">
            Leave a Reflection
          </h3>
          <p class="page-section-reflections__submit-byline serif light">
            What stayed with you?
          </p>
        </header>

        <ReflectionSubmitForm
          id-prefix="reflection-full"
          variant="inline"
          :show-title="false"
        />
      </div>
    </div>

    <div
      v-else
      class="page-section-reflections__content page-section-reflections__content--embedded"
    >
      <div class="page-section-reflections__watching-from wrapper">
        <WatchingFromSection
          compact
          :items="items"
          :title="watchingFromTitle"
          :intro="watchingFromIntro"
          :map-background-image="mapBackgroundImage"
          :map-light-style="mapLightStyle"
          :map-posts-layout="mapPostsLayout"
          :view-all-path="VIEW_ALL_REFLECTIONS_PATH"
          show-leave-reflection-button
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-reflections {
  /* --serif: var(--sans); */
  position: relative;
  isolation: isolate;
  color: inherit;
}

.page-section-reflections--full-page {
  min-height: 100dvh;
  padding-top: var(--wrapper-padding);
}

.page-section-reflections--has-background {
  background: transparent;
}

.page-section-reflections__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3.5vw, 5rem);
}

.page-section-reflections__content--embedded {
  gap: clamp(1.25rem, 3vw, 2.5rem);
}

.page-section-reflections__content--full {
  gap: clamp(1.5rem, 4vw, 3.5rem);
}

.page-section-reflections__full-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.85rem, 2vw, 1.25rem);
  max-width: 42rem;
  margin-inline: auto;
  text-align: center;
}

.page-section-reflections--header-hidden .page-section-reflections__content--full {
  gap: clamp(1rem, 2.5vw, 2rem);
}

.page-section-reflections__toolbar {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.page-section-reflections__title {
  margin: 0;
  text-align: center;
}

.page-section-reflections__byline {
  margin: 0;
  font-size: clamp(1rem, 1.35vw, 1.125rem);
  line-height: 1.45;
  letter-spacing: 0.01em;
  opacity: 0.82;
  text-align: center;
}

.page-section-reflections__views {
  display: flex;
  flex-direction: column;
  gap: clamp(0.85rem, 2vw, 1.25rem);
  min-width: 0;
}

.page-section-reflections__view-panel {
  min-width: 0;
}

.page-section-reflections__rule {
  display: flex;
  justify-content: center;
}

.page-section-reflections__divider {
  width: min(100%, 28rem);
  margin: 0;
  border: 0;
  border-top: 1px solid color-mix(in srgb, currentColor 24%, transparent);
}

.page-section-reflections__submit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  max-width: 34rem;
  margin-inline: auto;
  text-align: center;
}

.page-section-reflections__submit-header {
  display: flex;
  flex-direction: column;
  gap: clamp(0.55rem, 1.2vw, 0.75rem);
}

.page-section-reflections__submit-title {
  margin: 0;
}

.page-section-reflections__submit-byline {
  margin: 0;
  font-size: clamp(1rem, 1.35vw, 1.125rem);
  line-height: 1.45;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.page-section-reflections__submit :deep(.reflection-submit-form) {
  width: 100%;
}
</style>
