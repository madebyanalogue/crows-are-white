<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { toCssColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const {
  getMenuItemUrl,
  getMenuItemTarget,
  getMenuItemRel,
  isExternalUrl,
  isSamePageLink,
  isSamePageHref,
  getUrlHash,
  scrollToTop,
  scrollToHash,
} = useMenuLinks()

const sectionRef = ref(null)
const parallaxRef = ref(null)

const loop = computed(() => resolveSectionLoopVideo(props.section, 'letterbox'))
const hasVideo = computed(() => Boolean(
  loop.value?.url720
  || loop.value?.url
  || loop.value?.youtubeId,
))

const overlayLink = computed(() => {
  const label = props.section?.letterboxLinkText?.trim()
  const link = props.section?.letterboxLink
  if (!label || !link) return null

  const menuItem = {
    text: label,
    link: {
      type: link.type,
      page: link.page,
      url: link.url,
    },
  }

  const href = getMenuItemUrl(menuItem)
  if (!href || href === '#') return null

  const target = getMenuItemTarget(menuItem)
  const useRouterLink = target !== '_blank'
    && !href.startsWith('mailto:')
    && !href.startsWith('tel:')
    && !isExternalUrl(href)

  return {
    label,
    href,
    target,
    rel: getMenuItemRel(menuItem),
    useRouterLink,
    menuItem,
  }
})

function onLinkClick(event) {
  const link = overlayLink.value
  if (!link?.useRouterLink) return

  const { href, menuItem } = link
  const hash = getUrlHash(href)

  if (href.startsWith('#')) {
    event.preventDefault()
    scrollToHash(href)
    return
  }

  if (hash && isSamePageHref(href)) {
    event.preventDefault()
    scrollToHash(hash)
    return
  }

  if (isSamePageLink(menuItem)) {
    event.preventDefault()
    scrollToTop()
  }
}

const sectionStyle = computed(() => {
  const style = {}
  const backgroundColor = props.section?.letterboxBackgroundColor
  if (backgroundColor) {
    style.background = toCssColor(backgroundColor, DEFAULT_PAGE_COLOR)
  }
  return style
})

useVideoParallax(sectionRef, parallaxRef, { speed: 0.22 })
</script>

<template>
  <section
    v-if="hasVideo"
    ref="sectionRef"
    class="page-section-letterbox-video"
    :style="sectionStyle"
    aria-label="Video"
  >
    <div class="page-section-letterbox-video__frame">
      <div
        ref="parallaxRef"
        class="page-section-letterbox-video__parallax"
      >
        <SectionLoopVideo
          :loop="loop"
          title="Letterbox video"
          aspect-class="page-section-letterbox-video__video"
        />
      </div>

      <div
        v-if="overlayLink"
        class="page-section-letterbox-video__link-wrap"
      >
        <NuxtLink
          v-if="overlayLink.useRouterLink"
          :to="overlayLink.href"
          class="page-section-letterbox-video__link large-title"
          @click="onLinkClick"
        >
          {{ overlayLink.label }}
        </NuxtLink>
        <a
          v-else
          :href="overlayLink.href"
          class="page-section-letterbox-video__link large-title"
          :target="overlayLink.target"
          :rel="overlayLink.rel"
        >
          {{ overlayLink.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-letterbox-video {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 2.5;
  min-height: 500px;
  overflow: hidden;
  background: var(--obsidian, #111010);
}

.page-section-letterbox-video__frame {
  position: relative;
  width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  overflow: hidden;
}

.page-section-letterbox-video__parallax {
  position: absolute;
  left: 0;
  width: 100%;
  top: -7.5%;
  height: 115%;
  will-change: transform;
}

.page-section-letterbox-video__parallax :deep(.page-section-letterbox-video__video) {
  width: 100%;
  height: 100%;
}

.page-section-letterbox-video__parallax :deep(.section-loop-video__el) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-letterbox-video__link-wrap {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem clamp(1.25rem, 6vw, 30px);
  pointer-events: none;
}

.page-section-letterbox-video__link {
  display: inline-flex;
  pointer-events: auto;
  padding: 0.25em 0.7em 0.33em;
  border: 3px double var(--screenings-ink);
  border-radius: 10px;
  corner-shape: notch;
  text-align: center;
  text-decoration: none;
  color: var(--screenings-ink);
  background: var(--background-color);
  transition: color 0.2s ease;
}

.page-section-letterbox-video__link:hover {
  color: var(--menu-highlight-color, var(--arancio));
}

.page-section-letterbox-video__link:focus-visible {
  outline: 2px solid var(--menu-highlight-color, var(--arancio));
  outline-offset: 4px;
}
</style>
