<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { toCssColor } from '~/utils/pageColors'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  isFirstSection: {
    type: Boolean,
    default: false,
  },
})

const DEFAULT_MEDIA_KEY = '__default__'

const PRESS_ASPECT_RATIO_PRESETS = {
  '9/16': [9, 16],
  '2/3': [2, 3],
  '3/4': [3, 4],
  '4/5': [4, 5],
  '1/1': [1, 1],
  '16/9': [16, 9],
  '3/2': [3, 2],
}

function parsePressAspectRatio(value) {
  const preset = PRESS_ASPECT_RATIO_PRESETS[value]
  if (preset) return preset

  const match = String(value || '').match(/^(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)$/)
  if (match) return [Number(match[1]), Number(match[2])]

  return [9, 16]
}

function aspectRatioFromValue(value) {
  const [width, height] = parsePressAspectRatio(value)
  return { width, height }
}

const { getMenuItemUrl, getMenuItemTarget, getMenuItemRel } = useMenuLinks()

function resolveMediaLoop(item) {
  if (!item || item.mediaType !== 'video') return null
  return resolveSectionLoopVideo({
    mediaVideoSource: item.videoSource,
    mediaLoopCloudflare720: item.loopCloudflare720,
    mediaLoopCloudflare1080: item.loopCloudflare1080,
    mediaVideoFile: item.videoFile,
    mediaVideoId: item.videoId,
  }, 'media')
}

function resolveMediaItem(item) {
  if (!item) return null

  if (item.mediaType === 'video') {
    const loop = resolveMediaLoop(item)
    if (!loop) return null
    return {
      kind: 'video',
      loop,
      alt: item.alt || 'Press media',
      caption: item.imageCaption?.trim() || '',
    }
  }

  const imageUrl = resolveSanityAssetUrl(item?.image?.asset) || ''
  if (!imageUrl) return null

  return {
    kind: 'image',
    imageUrl,
    alt: item.alt || '',
    caption: item.imageCaption?.trim() || '',
  }
}

const defaultMediaSource = computed(() =>
  props.section?.pressDefaultMedia || props.section?.pressMediaItems?.[0] || null,
)

const defaultMedia = computed(() => resolveMediaItem(defaultMediaSource.value))

const defaultMediaAspectRatio = computed(() =>
  aspectRatioFromValue(defaultMediaSource.value?.aspectRatio),
)

const links = computed(() => {
  const items = props.section?.pressLinks || []
  return items
    .map((item, index) => {
      const menuItem = {
        text: item.linkTitle || '',
        link: {
          type: item.type,
          page: item.page,
          url: item.url,
        },
        openInNewTab: item.openInNewTab === true,
      }

      return {
        _key: item._key || `press-link-${index}`,
        label: item.linkTitle || '',
        href: getMenuItemUrl(menuItem),
        target: item.openInNewTab ? '_blank' : getMenuItemTarget(menuItem),
        rel: item.openInNewTab ? 'noopener noreferrer' : getMenuItemRel(menuItem),
        linkIcon: item.linkIcon === 'downArrow' || item.linkIcon === 'email'
          ? item.linkIcon
          : null,
        imageUrl: resolveSanityAssetUrl(item?.image?.asset) || '',
        imageAlt: item.imageAlt?.trim() || item.linkTitle?.trim() || '',
        imageCaption: item.imageCaption?.trim() || '',
        captionTypography: item.captionTypography || 'inherit',
        captionColor: item.captionColor || '',
        hoverText: item.hoverText?.trim() || '',
        imageAspectRatio: aspectRatioFromValue(item.imageAspectRatio),
      }
    })
    .filter((item) => item.label && item.href && item.href !== '#')
})

const hasDefaultMedia = computed(() => Boolean(defaultMedia.value))
const hasLinkMedia = computed(() => links.value.some((link) => link.imageUrl))
const showMediaPanel = computed(() => hasDefaultMedia.value || hasLinkMedia.value)

const activeMediaKey = ref(DEFAULT_MEDIA_KEY)
const activeLinkKey = ref(null)

const activeAspectRatio = computed(() => {
  if (activeMediaKey.value === DEFAULT_MEDIA_KEY) {
    return defaultMediaAspectRatio.value
  }

  const link = links.value.find((item) => item._key === activeMediaKey.value)
  return link?.imageAspectRatio || defaultMediaAspectRatio.value
})

const PRESS_MEDIA_WIDTHS = new Set(['50', '60', '70', '80', '90', '100'])

const mediaWidth = computed(() => {
  const value = props.section?.pressMediaWidth
  return PRESS_MEDIA_WIDTHS.has(value) ? value : '70'
})

const mediaHorizontalAlign = computed(() => {
  const align = props.section?.pressMediaHorizontalAlign
  if (align === 'left' || align === 'right') return align
  return 'center'
})

const mediaVerticalAlign = computed(() => {
  const align = props.section?.pressMediaVerticalAlign
  if (align === 'top' || align === 'bottom') return align
  return 'center'
})

const captionTypography = computed(() =>
  props.section?.pressCaptionTypography === 'bold' ? 'bold' : 'handwritten',
)

function resolveCaptionTypography(source) {
  const value = source?.captionTypography
  if (value === 'bold' || value === 'handwritten') return value
  return captionTypography.value
}

function sectionCaptionSettings() {
  return {
    captionTypography: props.section?.pressCaptionTypography,
    captionColor: props.section?.pressCaptionColor,
  }
}

function resolveCaptionColorStyle(source) {
  if (resolveCaptionTypography(source) !== 'bold') return undefined
  const color = toCssColor(
    source?.captionColor || props.section?.pressCaptionColor,
    'var(--text-color)',
  )
  return color ? { color } : undefined
}

function captionClasses(source, extra = {}) {
  const typography = resolveCaptionTypography(source)
  return {
    'page-section-press__caption--handwritten': typography === 'handwritten',
    'page-section-press__caption--bold': typography === 'bold',
    ...extra,
  }
}

const hideMediaColumn = computed(() => props.section?.pressHideMediaColumn === true)

const mobileLinkGridCount = computed(() => {
  const count = links.value.length
  if (count >= 1 && count <= 4) return count
  return 0
})

const pressLayoutClasses = computed(() => [
  `is-media-valign-${mediaVerticalAlign.value}`,
  `is-media-align-${mediaHorizontalAlign.value}`,
  {
    'page-section-press--hide-media': hideMediaColumn.value,
  },
  mobileLinkGridCount.value
    ? `page-section-press--mobile-links-${mobileLinkGridCount.value}`
    : 'page-section-press--mobile-links-stack',
])

const pressMediaStyle = computed(() => ({
  '--press-aspect-w': activeAspectRatio.value.width,
  '--press-aspect-h': activeAspectRatio.value.height,
  '--press-media-width': `${mediaWidth.value}%`,
}))

watch(
  [hasDefaultMedia, links],
  () => {
    activeMediaKey.value = hasDefaultMedia.value
      ? DEFAULT_MEDIA_KEY
      : links.value.find((link) => link.imageUrl)?._key || DEFAULT_MEDIA_KEY
  },
  { immediate: true },
)

function onLinkHover(index) {
  const link = links.value[index]
  if (!link) return
  activeLinkKey.value = link._key
  if (link.imageUrl) {
    activeMediaKey.value = link._key
  }
}

function resetToDefault() {
  activeLinkKey.value = null
  activeMediaKey.value = hasDefaultMedia.value
    ? DEFAULT_MEDIA_KEY
    : links.value.find((link) => link.imageUrl)?._key || DEFAULT_MEDIA_KEY
}

function onLinkTextLeave(event) {
  const text = event.currentTarget
  const next = event.relatedTarget
  if (next instanceof Node && text.contains(next)) return
  if (next instanceof Element && next.closest('.page-section-press__link-text')) return
  activeLinkKey.value = null
}

function onLinkBlur(event) {
  const link = event.currentTarget
  const next = event.relatedTarget
  if (next instanceof Node && link.contains(next)) return
  activeLinkKey.value = null
}

function linkDisplayLabel(link) {
  if (activeLinkKey.value === link._key && link.hoverText) {
    return link.hoverText
  }
  return link.label
}

function isDefaultActive() {
  return activeMediaKey.value === DEFAULT_MEDIA_KEY && hasDefaultMedia.value
}

function isLinkActive(link) {
  return activeMediaKey.value === link._key && Boolean(link.imageUrl)
}

const defaultMediaReady = ref(false)

watch(
  defaultMedia,
  (media) => {
    defaultMediaReady.value = media?.kind === 'image'
  },
  { immediate: true },
)

function onDefaultMediaReady() {
  defaultMediaReady.value = true
}

const showDefaultCaption = computed(() => {
  if (!defaultMedia.value?.caption) return false
  if (defaultMedia.value.kind === 'image') return true
  return defaultMediaReady.value
})

const sectionStyle = computed(() => {
  const style = {}

  if (!props.isFirstSection) {
    style['--press-nav-clearance'] = '0px'
  }

  const featureColor = props.section?.pressFeatureColor
  if (featureColor) {
    style['--press-feature-color'] = toCssColor(featureColor, 'arancio')
  }

  return Object.keys(style).length ? style : undefined
})
</script>

<template>
  <section
    class="page-section-press"
    :class="pressLayoutClasses"
    :style="sectionStyle"
    aria-label="Press"
  >
    <div class="page-section-press__layout">
      <div
        class="page-section-press__media"
        :class="{ 'page-section-press__media--empty': !showMediaPanel }"
        @pointerenter="resetToDefault"
      >
        <div
          v-if="showMediaPanel"
          class="page-section-press__stack"
          :style="pressMediaStyle"
          aria-live="polite"
        >
          <div
            v-if="hasDefaultMedia"
            class="page-section-press__card"
            :class="{ 'is-active': isDefaultActive() }"
            :aria-hidden="!isDefaultActive()"
          >
            <div class="page-section-press__frame">
              <SectionLoopVideo
                v-if="defaultMedia?.kind === 'video' && defaultMedia.loop"
                :loop="defaultMedia.loop"
                :title="defaultMedia.alt"
                aspect-class="page-section-press__card-media"
                object-fit="cover"
                @ready="onDefaultMediaReady"
              />
              <img
                v-else-if="defaultMedia?.kind === 'image'"
                class="page-section-press__card-media page-section-press__card-image"
                :src="defaultMedia.imageUrl"
                :alt="defaultMedia.alt"
                draggable="false"
                loading="lazy"
              >
              <p
                v-if="defaultMedia?.caption"
                class="page-section-press__caption"
                :class="captionClasses(sectionCaptionSettings(), {
                  'page-section-press__caption--after-video': defaultMedia?.kind === 'video',
                  'is-visible': showDefaultCaption,
                })"
                :style="resolveCaptionColorStyle(sectionCaptionSettings())"
              >
                {{ defaultMedia.caption }}
              </p>
            </div>
          </div>

          <div
            v-for="link in links"
            :key="link._key"
            class="page-section-press__card"
            :class="{ 'is-active': isLinkActive(link) }"
            :aria-hidden="!isLinkActive(link)"
          >
            <div
              v-if="link.imageUrl"
              class="page-section-press__frame"
            >
              <img
                class="page-section-press__card-media page-section-press__card-image"
                :src="link.imageUrl"
                :alt="link.imageAlt"
                draggable="false"
                loading="lazy"
              >
              <p
                v-if="link.imageCaption"
                class="page-section-press__caption"
                :class="captionClasses(link)"
                :style="resolveCaptionColorStyle(link)"
              >
                {{ link.imageCaption }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav
        v-if="links.length"
        class="page-section-press__links"
        aria-label="Press links"
      >
        <div class="page-section-press__links-grid">
          <a
            v-for="(link, index) in links"
            :key="link._key"
            :href="link.href"
            class="page-section-press__link-cell large-title"
            :class="{ 'is-active': activeLinkKey === link._key }"
            :target="link.target"
            :rel="link.rel"
            @focus="onLinkHover(index)"
            @blur="onLinkBlur"
          >
            <span class="page-section-press__link-inner">
              <span
                class="page-section-press__link-text"
                @pointerenter="onLinkHover(index)"
                @pointerleave="onLinkTextLeave"
              >{{ linkDisplayLabel(link) }}</span>
              <span
                v-if="link.linkIcon"
                class="page-section-press__link-icon"
                :class="`page-section-press__link-icon--${link.linkIcon}`"
                aria-hidden="true"
              >
              <svg
                v-if="link.linkIcon === 'downArrow'"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 0v6.5M4 6.5L1 3.5M4 6.5l3-3"
                  stroke="currentColor"
                  stroke-width=".75"
                  stroke-linecap="square"
                  stroke-linejoin="miter"
                />
              </svg>
              <svg
                v-else-if="link.linkIcon === 'email'"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="9"
                  height="7"
                  stroke="currentColor"
                  stroke-width=".75"
                />
                <path
                  d="M0.5 0.5 5 4.25 9.5 0.5"
                  stroke="currentColor"
                  stroke-width=".75"
                  stroke-linecap="square"
                  stroke-linejoin="miter"
                />
              </svg>
            </span>
            </span>
          </a>
        </div>
      </nav>
    </div>

    <div
      class="page-section-press__divider"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.page-section-press {
  --press-border: color-mix(in srgb, var(--text-color) 15%, transparent);
  --press-feature-color: var(--feature-color, var(--menu-highlight-color, var(--arancio)));
  --press-nav-clearance: 75px;
  --press-line-padding: clamp(1.5rem, 6vh, 3.5rem);
  --press-aspect-w: 9;
  --press-aspect-h: 16;
  --press-media-width: 70%;
  position: relative;
  min-height: 100dvh;
  color: inherit;
}

.page-section-press__layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  box-sizing: border-box;
  height: 100dvh;
  padding-block: var(--press-line-padding);
  padding-block-start: calc(var(--press-line-padding) + var(--press-nav-clearance));
  
  min-height: 0;
}

@media (min-width: 1000px) {
  .page-section-press__layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }
}

.page-section-press__divider {
  display: none;
}

@media (min-width: 1000px) {
  .page-section-press__divider {
    display: block;
    position: absolute;
    left: 50%;
    top: calc(var(--press-line-padding) + var(--press-nav-clearance));
    width: 1px;
    background: var(--press-border);
    transform: translateX(-50%);
    pointer-events: none;
    height: calc(100% - calc(var(--press-line-padding) * 2) - var(--press-nav-clearance));
  }
}

.page-section-press__media {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: 100%;
  padding: var(--wrapper-padding);
}

.page-section-press.is-media-valign-top .page-section-press__media {
  align-items: flex-start;
}

.page-section-press.is-media-valign-bottom .page-section-press__media {
  align-items: flex-end;
}

.page-section-press.is-media-align-left .page-section-press__media {
  justify-content: flex-start;
}

.page-section-press.is-media-align-right .page-section-press__media {
  justify-content: flex-end;
}

@media (min-width: 1000px) {
  .page-section-press__media {
    overflow: visible;
  }
}

.page-section-press__stack {
  position: relative;
  flex: 0 0 auto;
  width: var(--press-media-width);
  max-width: 100%;
  aspect-ratio: var(--press-aspect-w) / var(--press-aspect-h);
}

.page-section-press__links {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: var(--wrapper-padding);
}

@media (min-width: 1000px) {
  .page-section-press__links {
    border-top: 0;
    height: 100%;
    padding: 0;
  }
}

.page-section-press__links-grid {
  display: grid;
  width: 100%;
  min-height: 0;
}

@media (max-width: 999px) {
  .page-section-press__layout {
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: auto;
  }

  .page-section-press__link-cell {
    aspect-ratio: 16 / 9;
    width: 100%;
    grid-row: auto;
    align-self: stretch;
    border-right: 0;
  }

  .page-section-press__link-cell:not(:last-child) {
    border-bottom: 1px solid var(--press-border);
  }
}

@media (min-width: 1000px) {
  .page-section-press__links-grid {
    display: flex;
    flex-direction: column;
    aspect-ratio: auto;
    height: 100%;
  }

  .page-section-press--hide-media .page-section-press__media {
    display: none;
  }

  .page-section-press--hide-media {
    min-height: 0;
  }

  .page-section-press--hide-media .page-section-press__layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    height: auto;
    min-height: 0;
  }

  .page-section-press--hide-media .page-section-press__divider {
    display: none;
  }

  .page-section-press--hide-media .page-section-press__links {
    flex: 0 0 auto;
    justify-content: center;
    width: 100%;
    max-width: none;
    margin-inline: 0;
    padding: 0;
  }

  .page-section-press--hide-media .page-section-press__links-grid {
    display: grid;
    width: 100%;
    max-width: none;
    height: auto;
    grid-auto-rows: auto;
  }

  .page-section-press--hide-media .page-section-press__link-cell {
    flex: initial;
    min-height: 0;
    border-bottom: 0;
    aspect-ratio: 16 / 9;
    width: 100%;
  }

  .page-section-press--hide-media.page-section-press--mobile-links-1 .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-2 .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-2 .page-section-press__link-cell:nth-child(1) {
    border-right: 1px solid var(--press-border);
    border-bottom: 0;
  }

  .page-section-press--hide-media.page-section-press--mobile-links-3 .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-3 .page-section-press__link-cell:nth-child(1) {
    grid-row: 1 / -1;
    align-self: start;
    border-right: 1px solid var(--press-border);
    border-bottom: 0;
  }

  .page-section-press--hide-media.page-section-press--mobile-links-3 .page-section-press__link-cell:nth-child(2) {
    border-bottom: 1px solid var(--press-border);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-4 .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-4 .page-section-press__link-cell:nth-child(1),
  .page-section-press--hide-media.page-section-press--mobile-links-4 .page-section-press__link-cell:nth-child(3) {
    border-right: 1px solid var(--press-border);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-4 .page-section-press__link-cell:nth-child(1),
  .page-section-press--hide-media.page-section-press--mobile-links-4 .page-section-press__link-cell:nth-child(2) {
    border-bottom: 1px solid var(--press-border);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-stack .page-section-press__links-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-section-press--hide-media.page-section-press--mobile-links-stack .page-section-press__link-cell:not(:last-child) {
    border-bottom: 1px solid var(--press-border);
  }
}

.page-section-press__card {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 0;
}

.page-section-press__card.is-active {
  opacity: 1;
  visibility: visible;
  z-index: 1;
}

.page-section-press__frame {
  container-type: inline-size;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.page-section-press__caption {
  margin: 0;
  z-index: 2;
  pointer-events: none;
}

.page-section-press__caption--handwritten {
  position: absolute;
  right: 10px;
  top: calc(100% + .75em);
  max-width: min(78%, 35rem);
  font-family: var(--handwritten);
  font-size: clamp(23px, 2.1vw, 40px);
  line-height: 1.05;
  text-align: right;
  color: var(--text-color);
  transform: rotate(-3deg);
  transform-origin: bottom right;
}

.page-section-press.is-media-valign-bottom .page-section-press__caption--handwritten {
  top: auto;
  bottom: calc(100% + .75em);
  transform-origin: top right;
}

.page-section-press__caption--bold {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 10cqi, 3rem);
  max-width: none;
  font-size: clamp(1.125rem, 13cqi, 5.25rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-align: center;
  text-wrap: balance;
  font-family: var(--condensed);
}

.page-section-press__caption--after-video {
  opacity: 0;
  transition: opacity 0.35s ease 0.15s;
}

.page-section-press__caption--after-video.is-visible {
  opacity: 1;
}

.page-section-press__card-media {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
}

.page-section-press__card-image,
.page-section-press :deep(.page-section-press__card-media) {
  object-fit: cover;
}

.page-section-press :deep(.section-loop-video),
.page-section-press :deep(.video-loop) {
  width: 100%;
  height: 100%;
  background: transparent;
}

.page-section-press :deep(.section-loop-video__el),
.page-section-press :deep(.video-loop__native),
.page-section-press :deep(.video-loop__iframe) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-press__link-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 1.5rem clamp(1.25rem, 6vw, 30px);
  text-decoration: none;
  text-align: center;
  color: inherit;
  cursor: default;
  transition: color 0.2s ease;
}

@media (min-width: 1000px) {
  .page-section-press__link-cell {
    flex: 1;
    min-height: clamp(5rem, 32vh, 32rem);
    border-bottom: 1px solid var(--press-border);
  }

  .page-section-press__link-cell:last-child {
    border-bottom: 0;
  }
}

.page-section-press__link-cell.is-active {
  color: var(--press-feature-color);
}

.page-section-press__link-inner {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
}

.page-section-press__link-text {
  cursor: pointer;
  pointer-events: auto;
}

.page-section-press__link-cell:focus-visible {
  outline: 2px solid var(--press-feature-color);
  outline-offset: 4px;
}

.page-section-press__link-icon {
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
  align-self: flex-end;
  box-sizing: content-box;
  width: 0;
  max-width: 0;
  padding-left: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.25em);
  transition:
    width 0.25s ease,
    max-width 0.25s ease,
    padding-left 0.25s ease,
    opacity 0.2s ease;
}

.page-section-press__link-cell.is-active .page-section-press__link-icon {
  width: 0.4em;
  max-width: 0.4em;
  padding-left: 0.35em;
  opacity: 1;
}

.page-section-press__link-icon--email {
  transform: translateY(-0.25em);
}

.page-section-press__link-icon svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>
