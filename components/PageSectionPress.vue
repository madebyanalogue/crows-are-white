<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  section: {
    type: Object,
    required: true,
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
    }
  }

  const imageUrl = resolveSanityAssetUrl(item?.image?.asset) || ''
  if (!imageUrl) return null

  return {
    kind: 'image',
    imageUrl,
    alt: item.alt || '',
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

const pressMediaStyle = computed(() => ({
  '--press-aspect-w': activeAspectRatio.value.width,
  '--press-aspect-h': activeAspectRatio.value.height,
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
  const next = event.relatedTarget
  if (next instanceof Element && next.closest('.page-section-press__link-text')) return
  resetToDefault()
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
</script>

<template>
  <section
    class="page-section-press"
    aria-label="Press"
  >
    <div class="page-section-press__layout">
      <div
        class="page-section-press__media"
        :class="{ 'page-section-press__media--empty': !showMediaPanel }"
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
              />
              <img
                v-else-if="defaultMedia?.kind === 'image'"
                class="page-section-press__card-media page-section-press__card-image"
                :src="defaultMedia.imageUrl"
                :alt="defaultMedia.alt"
                draggable="false"
                loading="lazy"
              >
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
                class="page-section-press__caption handwritten"
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
        <div
          v-for="(link, index) in links"
          :key="link._key"
          class="page-section-press__link-row"
        >
          <a
            :href="link.href"
            class="page-section-press__link large-title"
            :class="{ 'is-active': activeLinkKey === link._key }"
            :target="link.target"
            :rel="link.rel"
            @focus="onLinkHover(index)"
            @blur="resetToDefault"
          >
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
  --press-nav-clearance: calc(2rem + 50px + 1.25rem);
  --press-aspect-w: 9;
  --press-aspect-h: 16;
  position: relative;
  min-height: 100dvh;
  color: var(--text-color);
  background: var(--background-color);
}

@media (min-width: 700px) {
  .page-section-press {
    --press-nav-clearance: calc(3.5rem + 50px + 1.5rem);
  }
}

.page-section-press__layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: calc(100dvh - var(--press-nav-clearance));
  padding-top: var(--press-nav-clearance);
}

@media (min-width: 900px) {
  .page-section-press__layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    min-height: calc(100dvh - var(--press-nav-clearance));
    padding-top: var(--press-nav-clearance);
  }
}

.page-section-press__divider {
  display: none;
}

@media (min-width: 900px) {
  .page-section-press__divider {
    display: block;
    position: absolute;
    left: 50%;
    top: calc(var(--press-nav-clearance) + clamp(1.5rem, 6vh, 3.5rem));
    bottom: clamp(1.5rem, 6vh, 3.5rem);
    width: 1px;
    background: var(--press-border);
    transform: translateX(-50%);
    pointer-events: none;
  }
}

.page-section-press__media {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: min(420px, 45dvh);
  padding: clamp(1rem, 4vw, 2rem) ;
}

@media (min-width: 900px) {
  .page-section-press__media {
    min-height: 0;
    height: 100%;
    overflow: visible;
    container-type: size;
    padding: clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 6vw, 4rem);
  }
}

.page-section-press__stack {
  position: relative;
  flex: 0 0 auto;
  aspect-ratio: var(--press-aspect-w) / var(--press-aspect-h);
  width: min(
    100%,
    calc((100dvh - var(--press-nav-clearance) - 14rem) * var(--press-aspect-w) / var(--press-aspect-h)),
    calc(480px * var(--press-aspect-w) / var(--press-aspect-h))
  );
}

@media (min-width: 900px) {
  .page-section-press__stack {
    width: min(100cqw, calc(100cqh * var(--press-aspect-w) / var(--press-aspect-h)));
    max-height: 100cqh;
  }
}

.page-section-press__links {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border-top: 1px solid var(--press-border);
}

@media (min-width: 900px) {
  .page-section-press__links {
    border-top: 0;
    height: 100%;
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
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.page-section-press__caption {
  position: absolute;
  right: -20px;
  top: calc(100% + .5em);
  z-index: 2;
  margin: 0;
  max-width: min(72%, 35rem);
  font-size: clamp(18px, 2.1vw, 40px);
  line-height: 1.05;
  text-align: right;
  color: var(--text-color);
  transform: rotate(-3deg);
  transform-origin: bottom right;
  pointer-events: none;
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

.page-section-press__link-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(5rem, 32vh, 32rem);
  padding: 1.5rem clamp(1.25rem, 6vw, 30px);
  border-bottom: 1px solid var(--press-border);
  cursor: default;
}

.page-section-press__link-row:last-child {
  border-bottom: 0;
}

.page-section-press__link {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  text-decoration: none;
  text-align: center;
  color: inherit;
  cursor: default;
  transition: color 0.2s ease;
}

.page-section-press__link.is-active {
  color: var(--menu-highlight-color, var(--arancio));
}

.page-section-press__link-text {
  cursor: pointer;
  pointer-events: auto;
}

.page-section-press__link:focus-visible {
  outline: 2px solid var(--menu-highlight-color, var(--arancio));
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

.page-section-press__link.is-active .page-section-press__link-icon {
  width: 0.4em;
  max-width: 0.4em;
  padding-left: 0.35em;
  opacity: 1;
}

.page-section-press__link-icon--email {
  transform: translateY(-0.2em);
}

.page-section-press__link-icon svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>
