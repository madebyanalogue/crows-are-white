<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { getLoopVideoHeadLinks } from '~/utils/loopVideoPreload'
import { toCssColor, isLightColor } from '~/utils/pageColors'
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

const previewPlaybackUrl = computed(() => previewVideo.value?.url720 || '')
const hasDesktopPreviewSource = computed(() => {
  const video = previewVideo.value
  return Boolean(video?.url1080 && video.url1080 !== video.url720)
})

const previewHeadLoop = computed(() => {
  const video = previewVideo.value
  if (!video) return null
  return {
    kind: 'mp4',
    url720: video.url720,
    url1080: video.url1080,
    url: video.url720,
  }
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

watch(previewPlaybackUrl, () => {
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
  link: computed(() => getLoopVideoHeadLinks(previewHeadLoop.value)),
})

const title = computed(
  () => props.section?.watchTitle?.trim() || film.value?.title || defaultFilm.title,
)

const filmYear = computed(() => {
  const year = props.section?.watchYear
  if (year == null || year === '') return null

  const parsed = Number(year)
  return Number.isFinite(parsed) ? parsed : null
})

const filmRuntimeMinutes = computed(() => {
  const runtime = props.section?.watchRuntimeMinutes
  if (runtime == null || runtime === '') return null

  const parsed = Number(runtime)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null
})

const showFilmMeta = computed(() =>
  Boolean(filmYear.value || filmRuntimeMinutes.value),
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

const heroOverlayOpacity = computed(() => {
  const value = props.section?.watchHeroOverlayOpacity
  if (value == null) return 1
  return Math.min(100, Math.max(0, value)) / 100
})

const showHeroOverlay = computed(() => heroOverlayOpacity.value > 0)

const fillScreen = computed(() => props.section?.watchFillScreen === true)

const sectionStyle = computed(() => {
  const style = {}
  const accent = props.section?.watchAccentColor

  if (accent) {
    style['--watch-accent'] = toCssColor(accent, '#ff555f')
    style['--watch-accent-text'] = isLightColor(accent) ? '#000' : '#fff'
  }

  const labelColor = props.section?.watchPlatformsLabelColor
  if (labelColor) {
    style['--watch-platforms-label-color'] = toCssColor(labelColor, '#ff555f')
  }

  return style
})
</script>

<template>
  <div
    class="page-section-watch"
    :class="{ 'page-section-watch--fill-screen': fillScreen }"
    :style="sectionStyle"
  >
    <section
      class="page-section-watch__hero"
      aria-label="Film preview"
    >
      <div class="page-section-watch__hero-media">
        <video
          v-if="previewPlaybackUrl"
          ref="videoRef"
          class="page-section-watch__video"
          :class="{ 'is-ready': videoReady }"
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
        >
          <source
            v-if="hasDesktopPreviewSource"
            media="(min-width: 1000px)"
            :src="previewVideo.url1080"
            type="video/mp4"
          >
          <source
            :src="previewPlaybackUrl"
            type="video/mp4"
          >
        </video>
        <div
          v-if="showHeroOverlay"
          class="page-section-watch__hero-overlay"
          :style="{ '--watch-overlay-opacity': heroOverlayOpacity }"
          aria-hidden="true"
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

          <div
            v-if="showFilmMeta"
            class="page-section-watch__meta serif"
          >
            <span v-if="filmYear">{{ filmYear }}</span>
            <span
              v-if="filmYear && filmRuntimeMinutes"
              class="page-section-watch__meta-divider"
              aria-hidden="true"
            >|</span>
            <span v-if="filmRuntimeMinutes">{{ filmRuntimeMinutes }}min</span>
          </div>

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
  --watch-ink: #222;
  --watch-muted: rgba(0,0,0, 0.75);
  --watch-line: rgba(0,0,0, 0.22);
  --watch-gutter: clamp(1.25rem, 3.5vw, 2.75rem);
  --watch-nav-clearance: calc(2rem + 50px + 1.25rem);
  --watch-content: min(100%, 1280px);
  min-height: 100dvh;
  padding:
    var(--watch-nav-clearance)
    var(--wrapper-padding)
    clamp(3rem, 8vw, 6rem);
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
    max-height: calc(100dvh - var(--watch-nav-clearance));
    border-radius: 10px;
    max-width: 2200px;
    margin: 0 auto;
    margin-top:-30px;
    border-radius: 10px;
    aspect-ratio: 16/9;
}
@media all and (min-width:1000px) {
  .page-section-watch__hero {
  margin-top:-100px;
  }
}

.page-section-watch__hero-media {
  position: absolute;
  inset: 0;
  background:black;
}

.page-section-watch__hero-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 50%;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, var(--watch-overlay-opacity, 1)) 0%,
    transparent 100%
  );
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
  background:black;
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
  font-weight: 300;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
  color:white;
}

.page-section-watch__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.45rem, 1vw, 0.65rem);
  margin: 0;
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.88);
}

.page-section-watch__meta-divider {
  opacity: 0.65;
}

.page-section-watch__cta {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0;
  margin: 0;
  padding: 16px;
  background: var(--watch-accent);
  color: var(--watch-accent-text);
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 300;
  letter-spacing: 0.07em;
  line-height: 1.1;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  min-width: clamp(200px, 50vw, 280px);
  border-radius: 0;
  height:50px;
}
@media (min-width: 700px) {
  .page-section-watch__cta {
    font-size: 18px;
  }
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
    /* font-weight: 400; */
    line-height: 1;
    letter-spacing: 0.03em;
    font-weight: 300;
    font-family: var(--serif);
}

.page-section-watch__grid {
  list-style: none;
  width: 100%;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap:15px;
  max-width: 360px;
  margin: 0 auto;
}

.page-section-watch__grid-item {
  min-width: 0;
  border: 1px solid var(--watch-line);
  font-size: 20px;
}

@media (min-width: 700px) {
  .page-section-watch__grid-item {
    border-left: none;
    border-top: none;
    aspect-ratio: 2;
  }
  .page-section-watch__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--watch-line);
    border-left: 1px solid var(--watch-line);
    border-top: 1px solid var(--watch-line);
    border-left: 1px solid var(--watch-line);
    gap:0px;
    max-width: unset;
  }
}

.page-section-watch__grid-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem 0.75rem;
  box-sizing: border-box;
  font-size: clamp(18px, 2vw, 35px);
  font-weight: 300;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
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

.page-section-watch--fill-screen {
  --watch-nav-clearance: 0px;
}

@media (min-width: 700px) {
  .page-section-watch--fill-screen {
    --watch-nav-clearance: 0px;
  }
}

.page-section-watch--fill-screen .page-section-watch__hero {
  width: calc(100% + (2 * var(--watch-gutter)));
  max-width: none;
  margin-top: 0;
  margin-left: calc(-1 * var(--watch-gutter));
  margin-right: calc(-1 * var(--watch-gutter));
  border-radius: 0;
}


.page-section-watch__play {
    display: block;
  }
/* 
@media (min-width: 1000px) {
  .page-section-watch__hero-copy {
    flex-direction: row;
    gap:40px;
  }
  .page-section-watch__title {
  flex: 1;
    text-align: left;
  }
  .page-section-watch__play {
    display: block;
  }
  .page-section-watch__title span,
  .page-section-watch__cta span {
    display:none;
  }
} */
</style>
