<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { getMenuItemUrl, getMenuItemTarget, getMenuItemRel } = useMenuLinks()

const mediaItems = computed(() => props.section?.pressMediaItems || [])

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
        showChevron: /download/i.test(item.linkTitle || ''),
      }
    })
    .filter((item) => item.label && item.href && item.href !== '#')
})

function resolveMediaLoop(item) {
  if (item?.mediaType !== 'video') return null
  return resolveSectionLoopVideo({
    mediaVideoSource: item.videoSource,
    mediaLoopCloudflare720: item.loopCloudflare720,
    mediaLoopCloudflare1080: item.loopCloudflare1080,
    mediaVideoFile: item.videoFile,
    mediaVideoId: item.videoId,
  }, 'media')
}

function mediaImageUrl(item) {
  return resolveSanityAssetUrl(item?.image?.asset) || ''
}

function fanTransform(index, total, hovered) {
  const spread = hovered ? 1.4 : 1
  const center = (total - 1) / 2
  const offset = index - center
  const rotate = offset * 11 * spread
  const translateX = offset * 16 * spread
  const translateY = (Math.abs(offset) * 5 + (index === total - 1 ? 10 : 0)) * spread

  return {
    '--press-rotate': `${rotate}deg`,
    '--press-x': `${translateX}%`,
    '--press-y': `${translateY}%`,
    zIndex: index + 1,
  }
}

const isHovered = ref(false)
const isLoaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <section
    class="page-section-press"
    aria-label="Press"
  >
    <div class="page-section-press__layout">
      <div
        class="page-section-press__media"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          class="page-section-press__fan"
          :class="{
            'is-hovered': isHovered,
            'is-loaded': isLoaded,
          }"
        >
          <div
            v-for="(item, index) in mediaItems"
            :key="item._key || `press-media-${index}`"
            class="page-section-press__card"
            :style="fanTransform(index, mediaItems.length, isHovered)"
          >
            <SectionLoopVideo
              v-if="item.mediaType === 'video' && resolveMediaLoop(item)"
              :loop="resolveMediaLoop(item)"
              :title="item.alt || 'Press media'"
              aspect-class="page-section-press__card-media"
            />
            <img
              v-else-if="mediaImageUrl(item)"
              class="page-section-press__card-media page-section-press__card-image"
              :src="mediaImageUrl(item)"
              :alt="item.alt || ''"
              draggable="false"
              loading="lazy"
            >
            <div
              v-else
              class="page-section-press__card-media page-section-press__card-placeholder"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <nav
        v-if="links.length"
        class="page-section-press__links"
        aria-label="Press links"
      >
        <div
          v-for="link in links"
          :key="link._key"
          class="page-section-press__link-row"
        >
          <a
            :href="link.href"
            class="page-section-press__link large-title"
            :target="link.target"
            :rel="link.rel"
          >
            <span class="page-section-press__link-text">{{ link.label }}</span>
            <span
              v-if="link.showChevron"
              class="page-section-press__link-chevron"
              aria-hidden="true"
            >▾</span>
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
  min-height: calc(100dvh - var(--press-nav-clearance));
  margin-top: var(--press-nav-clearance);
}

@media (min-width: 900px) {
  .page-section-press__layout {
    grid-template-columns: 1fr 1fr;
    min-height: 100dvh;
    margin-top: 0;
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
  padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
  min-height: min(52vh, 520px);
}

@media (min-width: 900px) {
  .page-section-press__media {
    min-height: 0;
    padding: clamp(2rem, 5vw, 3.5rem);
  }
}

.page-section-press__fan {
  position: relative;
  width: min(100%, 420px);
  aspect-ratio: 4 / 5;
}

.page-section-press__card {
  position: absolute;
  inset: 8% 10%;
  overflow: hidden;
  transform: rotate(0deg) translate(0, 0) scale(0.94);
  opacity: 0;
  transition:
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s ease;
  will-change: transform;
}

.page-section-press__fan.is-loaded .page-section-press__card {
  opacity: 1;
  transform:
    rotate(var(--press-rotate, 0deg))
    translate(var(--press-x, 0), var(--press-y, 0));
}

.page-section-press__fan.is-hovered.is-loaded .page-section-press__card {
  transition-duration: 0.55s;
}

.page-section-press__card:nth-child(1) { transition-delay: 0.05s; }
.page-section-press__card:nth-child(2) { transition-delay: 0.12s; }
.page-section-press__card:nth-child(3) { transition-delay: 0.19s; }
.page-section-press__card:nth-child(4) { transition-delay: 0.26s; }
.page-section-press__card:nth-child(5) { transition-delay: 0.33s; }
.page-section-press__card:nth-child(6) { transition-delay: 0.4s; }

.page-section-press__card-media {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  background: color-mix(in srgb, var(--text-color) 8%, var(--background-color));
}

.page-section-press__card-image,
.page-section-press :deep(.page-section-press__card-media) {
  object-fit: cover;
}

.page-section-press :deep(.section-loop-video),
.page-section-press :deep(.video-loop) {
  width: 100%;
  height: 100%;
}

.page-section-press :deep(.section-loop-video__el),
.page-section-press :deep(.video-loop__native),
.page-section-press :deep(.video-loop__iframe) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-press__links {
  display: flex;
  flex-direction: column;
  flex: 1;
  border-top: 1px solid var(--press-border);
}

@media (min-width: 900px) {
  .page-section-press__links {
    border-top: 0;
    min-height: calc(100dvh - var(--press-nav-clearance));
  }
}

.page-section-press__link-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(5rem, 32vh, 32rem);
  padding: 1.5rem clamp(1.25rem, 6vw, 30px);
  border-bottom: 1px solid var(--press-border);
}

.page-section-press__link-row:last-child {
  border-bottom: 0;
}

.page-section-press__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-decoration: none;
  text-align: center;
  color: inherit;
  transition: color 0.2s ease;
}

.page-section-press__link:hover {
  color: var(--menu-highlight-color, var(--arancio));
}

.page-section-press__link:focus-visible {
  outline: 2px solid var(--menu-highlight-color, var(--arancio));
  outline-offset: 4px;
}

.page-section-press__link-chevron {
  font-size: 0.85em;
  line-height: 1;
  transform: translateY(0.08em);
}

@media (prefers-reduced-motion: reduce) {
  .page-section-press__card {
    opacity: 1;
    transform:
      rotate(var(--press-rotate, 0deg))
      translate(var(--press-x, 0), var(--press-y, 0));
    transition: none;
  }
}
</style>
