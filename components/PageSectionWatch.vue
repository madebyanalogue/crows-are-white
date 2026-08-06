<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { film as defaultFilm } from '~/data/site'
import { streamingLinks as defaultStreamingLinks } from '~/data/site'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { film } = useSiteContent()

const previewVideo = computed(() => {
  const fromSection = resolveSectionLoopVideo(props.section, 'watchPreview')
  if (fromSection?.url720 || fromSection?.url) {
    const url720 = fromSection.url720 || fromSection.url
    const url1080 = fromSection.url1080 || url720
    return { url720, url1080 }
  }

  const videoSrc = film.value?.heroVideoSrc || defaultFilm.heroVideoSrc
  if (videoSrc) {
    return { url720: videoSrc, url1080: videoSrc }
  }

  return null
})

const activePreviewSrc = computed(() => {
  const video = previewVideo.value
  if (!video) return ''

  const prefer1080 = import.meta.client
    && window.matchMedia('(min-width: 1000px)').matches
    && video.url1080

  return prefer1080 ? video.url1080 : video.url720
})

const videoRef = ref(null)
const videoReady = ref(false)
let revealFallbackTimer = null

function revealVideo() {
  videoReady.value = true
}

function clearRevealFallback() {
  if (revealFallbackTimer) {
    clearTimeout(revealFallbackTimer)
    revealFallbackTimer = null
  }
}

function scheduleRevealFallback() {
  clearRevealFallback()
  revealFallbackTimer = setTimeout(revealVideo, 2000)
}

function attemptPlay() {
  const el = videoRef.value
  if (!el) return

  const play = () => {
    const result = el.play()
    if (result?.catch) result.catch(() => {})
  }

  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    play()
    return
  }

  el.addEventListener('loadeddata', play, { once: true })
}

function onVideoLoaded() {
  revealVideo()
  attemptPlay()
}

watch(activePreviewSrc, () => {
  videoReady.value = false
  clearRevealFallback()
  nextTick(() => {
    attemptPlay()
    scheduleRevealFallback()
  })
})

onMounted(() => {
  attemptPlay()
  scheduleRevealFallback()
})

onBeforeUnmount(clearRevealFallback)

useHead({
  link: computed(() => {
    const href = activePreviewSrc.value
    if (!href) return []
    return [{ rel: 'preload', as: 'video', href, type: 'video/mp4' }]
  }),
})

const title = computed(
  () => props.section?.watchTitle?.trim() || film.value?.title || defaultFilm.title,
)

const ctaLabel = computed(() => props.section?.watchCtaLabel?.trim() || 'Watch Now – £7.99')
const ctaHref = computed(() => {
  const link = props.section?.watchCtaLink
  if (!link) return null
  if (link.type === 'page' && link.page?.slug?.current) {
    const slug = link.page.slug.current
    return slug === 'home' ? '/' : `/${slug}`
  }
  if (link.url) return link.url
  return null
})

const platformsLabel = computed(
  () => props.section?.watchPlatformsLabel?.trim() || 'Also available on',
)

const platforms = computed(() => {
  const links = props.section?.watchPlatformLinks || []
  const mapped = links
    .map((item) => ({
      label: item.label?.trim() || '',
      href: item.url?.trim() || '',
    }))
    .filter((item) => item.label && item.href)
  if (mapped.length) return mapped
  return defaultStreamingLinks.filter((link) => !link.featured)
})
</script>

<template>
  <div class="page-section-watch">
    <section
      class="page-section-watch__hero"
      aria-label="Film preview"
    >
      <div class="page-section-watch__hero-media">
        <video
          v-if="activePreviewSrc"
          ref="videoRef"
          :key="activePreviewSrc"
          class="page-section-watch__video"
          :class="{ 'is-ready': videoReady }"
          :src="activePreviewSrc"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          disablepictureinpicture
          :aria-label="`${title} — preview`"
          @loadeddata="onVideoLoaded"
          @canplay="revealVideo"
          @playing="revealVideo"
        />
      </div>

      <div class="page-section-watch__hero-content">
        <component
          :is="ctaHref ? 'a' : 'button'"
          :href="ctaHref || undefined"
          type="button"
          class="page-section-watch__play"
          :aria-label="`Play ${title}`"
          :target="ctaHref?.startsWith('http') ? '_blank' : undefined"
          :rel="ctaHref?.startsWith('http') ? 'noopener noreferrer' : undefined"
        >
          <svg
            class="page-section-watch__play-circle"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="50"
              fill="var(--watch-accent)"
            />
          </svg>
          <div
            class="page-section-watch__play-triangle"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 38 40"
              fill="var(--watch-accent-text)"
            >
              <path d="M0 0 L0 40 L38 20 Z" />
            </svg>
          </div>
        </component>

        <div class="page-section-watch__hero-copy">
          <h1 class="page-section-watch__title serif">
            {{ title }}
          </h1>
          <component
            :is="ctaHref ? 'a' : 'button'"
            :href="ctaHref || undefined"
            type="button"
            class="page-section-watch__cta serif"
            :target="ctaHref?.startsWith('http') ? '_blank' : undefined"
            :rel="ctaHref?.startsWith('http') ? 'noopener noreferrer' : undefined"
          >
            {{ ctaLabel }}
          </component>
        </div>
      </div>
    </section>

    <section
      v-if="platforms.length"
      class="page-section-watch__platforms"
      aria-labelledby="watch-platforms-heading"
    >
      <div class="page-section-watch__platforms-inner">
        <h2
          id="watch-platforms-heading"
          class="page-section-watch__platforms-label handwritten"
        >
          {{ platformsLabel }}
        </h2>

        <ul class="page-section-watch__grid">
          <li
            v-for="link in platforms"
            :key="link.label"
            class="page-section-watch__grid-item serif"
          >
            <a
              :href="link.href"
              class="page-section-watch__grid-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-section-watch {
  --watch-accent: #ff555f;
  --watch-accent-text: #000;
  --watch-ink: #ffffff;
  --watch-muted: rgba(255, 255, 255, 0.7);
  --watch-line: rgba(255, 255, 255, 0.22);
  --watch-gutter: clamp(1.25rem, 3.5vw, 2.75rem);
  --watch-nav-clearance: calc(2rem + 50px + 1.25rem);
  --watch-content: min(100%, 1280px);
  min-height: 100dvh;
  padding:
    var(--watch-nav-clearance)
    var(--watch-gutter)
    clamp(3rem, 8vw, 6rem);
  color: var(--watch-ink);
  background: #000;
  --watch-gap: 6rem;
}

.page-section-watch {
  display: flex;
  flex-direction: column;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--watch-gap);
}

@media (min-width: 700px) {
  .page-section-watch {
    --watch-nav-clearance: calc(3.5rem + 50px + 1.5rem);
  }
}

.page-section-watch__hero {
  position: relative;
    width: calc(100%);
    /* height: clamp(600px, 70vh, 1140px); */
    min-height: 600px;
    margin: -10px;
    overflow: hidden;
    max-height: 110dvw;
    border-radius: 10px;
    max-width: 2200px;
    margin: 0 auto;
    margin-top:-30px;
    border-radius: 10px;
    aspect-ratio: 16/9;
}

.page-section-watch__hero-media {
  position: absolute;
  inset: 0;
}

.page-section-watch__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: #000;
}

.page-section-watch__video.is-ready {
  opacity: 1;
}

.page-section-watch__hero-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.page-section-watch__play {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 62px;
  height: 62px;
  margin: auto;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  pointer-events: auto;
  transition: transform 0.18s ease, filter 0.18s ease;
  display: none;
}

.page-section-watch__play-circle {
  display: block;
  width: 100%;
  height: 100%;
}

.page-section-watch__play-triangle {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.page-section-watch__play-triangle svg {
  display: block;
  width: 32%;
  transform: translateX(15%);
  height: auto;
}

.page-section-watch__play:hover {
  transform: scale(1.05);
  filter: brightness(1.05);
}

.page-section-watch__hero-copy {
  z-index: 2;
  position: absolute;
  left: 50%;
  bottom: clamp(3rem, 7vw, 5.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(30px, 2vw, 45px);
  width: 90%;
  text-align: center;
  pointer-events: auto;
  transform: translateX(-50%);
}

.page-section-watch__title {
  margin: 0;
  font-size: clamp(30px, 2.5vw, 3rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
}

.page-section-watch__cta {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0;
    margin: 0;
    padding: clamp(14px, 1vw, 1rem) clamp(20px, 2vw, 2rem);
    background: var(--watch-accent);
    color: var(--watch-accent-text);
    font-family: var(--serif);
    font-size: clamp(16px, 3vw, 18px);
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.15;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    min-width: clamp(200px, 50vw, 320px);
}

.page-section-watch__cta:hover {
  filter: brightness(1.05);
}

.page-section-watch__platforms {
  width: 100%;
  margin: 0 auto;
}

.page-section-watch__platforms-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--watch-gap);
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

.page-section-watch__platforms-label {
  margin: 0;
  text-align: center;
  font-size: clamp(1.65rem, 3vw, 2.15rem);
  font-weight: 400;
  line-height: 1;
  color: var(--watch-accent);
}

.page-section-watch__grid {
  list-style: none;
  width: 100%;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--watch-line);
  border-left: 1px solid var(--watch-line);
}

.page-section-watch__grid-item {
  min-width: 0;
  border-right: 1px solid var(--watch-line);
  border-bottom: 1px solid var(--watch-line);
  aspect-ratio: 2;
}

.page-section-watch__grid-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem 0.75rem;
  box-sizing: border-box;
  font-size: clamp(17px, 2vw, 30px);
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  color: var(--watch-muted);
  transition: color 0.18s ease;
}

.page-section-watch__grid-link:hover {
  color: var(--watch-ink);
}

@media (min-width: 700px) {
  .page-section-watch__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1000px) {
  .page-section-watch__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 699px) {
  .page-section-watch__grid-link {
    text-align: left;
  }
}
</style>
