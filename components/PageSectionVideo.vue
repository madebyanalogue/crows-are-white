<template>
  <section v-if="videoSrc" ref="sectionRef" class="section-video">
    <div class="section-video__inner">
      <Video ref="videoRef" :src="videoSrc" />

      <div
        v-if="showOverlay"
        class="section-video__overlay"
        :style="overlayStyle"
        aria-hidden="true"
      />

      <div
        v-if="titleBlocks.length || links.length || showTrustpilot"
        class="section-video__title-wrap wrapper"
      >
        <div class="section-video__title-content grid-1 gap-6 section-padding">

          <div class="grid-1 gap-3">
            
            <h2
              v-if="titleBlocks.length"
              ref="titleRef"
              class="section-video__title h2 serif line-reveal"
            >
              <SanityInline :blocks="titleBlocks" />
            </h2>

            <nav
              v-if="links.length"
              ref="linksRef"
              class="section-video__links"
              aria-label="Calls to action"
            >
              <MenuLink
                v-for="link in links"
                :key="link._key"
                :item="toMenuItem(link)"
                :show-arrow="false"
              />
            </nav>
          </div>

          <div
            v-if="showTrustpilot"
            ref="trustpilotRef"
            class="section-video__trustpilot section-trustpilot__summary grid-1 gap-2"
          >
            <TrustpilotStars
              :linked="Boolean(trustpilotUrl)"
              light-wordmark
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'
import { pageBackgroundVar } from '~/utils/pageColors'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { trustpilotUrl, preloaderDisabled } = useSiteSettings()

const titleRef = ref(null)
const linksRef = ref(null)
const trustpilotRef = ref(null)
const sectionRef = ref(null)
const videoRef = ref(null)
let linksTween = null
let trustpilotTween = null
let preloaderRevealListener = null

const videoSrc = computed(() => props.section?.videoFile?.asset?.url ?? '')
const showTrustpilot = computed(() => props.section?.videoShowTrustpilot === true)
const titleBlocks = computed(() => props.section?.videoTitle ?? [])
const links = computed(() => props.section?.videoLinks ?? [])
const hasTitle = computed(() => titleBlocks.value.length > 0)
const hasLinks = computed(() => links.value.length > 0)

function toMenuItem(link) {
  return {
    text: link.linkTitle,
    link: {
      type: link.type,
      page: link.page,
      url: link.url,
    },
    isButton: true,
  }
}

const overlayOpacity = computed(() => {
  const value = props.section?.videoOverlayOpacity
  if (value == null) return 0
  return Math.min(100, Math.max(0, value)) / 100
})

const showOverlay = computed(() => overlayOpacity.value > 0)

const overlayStyle = computed(() => ({
  background: pageBackgroundVar(props.section?.videoOverlayColor ?? 'obsidian'),
  opacity: overlayOpacity.value,
}))

async function revealTrustpilot() {
  if (!showTrustpilot.value || !trustpilotRef.value) return

  const trustpilotEl = trustpilotRef.value
  const { default: gsap } = await import('gsap')
  if (!trustpilotRef.value) return

  trustpilotTween?.kill()
  trustpilotTween = gsap.to(trustpilotEl, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  })
}

let linksRevealed = false

async function revealLinks() {
  if (linksRevealed) return
  linksRevealed = true

  if (!hasLinks.value || !linksRef.value) {
    revealTrustpilot()
    return
  }

  const linksEl = linksRef.value
  const { default: gsap } = await import('gsap')
  if (!linksRef.value) return

  linksTween?.kill()
  linksTween = gsap.to(linksEl, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  })

  if (showTrustpilot.value) {
    gsap.delayedCall(0.15, revealTrustpilot)
  }
}

function scheduleWithoutTitleReveal() {
  if (hasTitle.value) return
  if (!hasLinks.value && !showTrustpilot.value) return

  const start = () => nextTick(revealLinks)

  if (document.body.classList.contains('preloader-complete')) {
    start()
    return
  }

  preloaderRevealListener = start
  document.addEventListener('preloader-complete', preloaderRevealListener, { once: true })
}

const titleRevealDelay = computed(() => (preloaderDisabled.value ? 0.6 : 0))

useSplitTextAnimation(titleRef, {
  enabled: hasTitle,
  trigger: 'preloader',
  lineBreaks: 'explicit',
  stagger: 0.1,
  duration: 1,
  ease: 'power3.out',
  delay: titleRevealDelay,
  onLastLineStart: revealLinks,
})

function resolveElement(value) {
  if (!value) return null
  if (value instanceof HTMLElement) return value
  if (value.value instanceof HTMLElement) return value.value
  return null
}

function resolveVideoParallaxTarget(component) {
  if (!component) return null
  return resolveElement(component.parallaxRef)
    ?? resolveElement(component.mediaRef)
}

const parallaxTargetRef = computed(() => resolveVideoParallaxTarget(videoRef.value))

const { init: initVideoParallax } = useVideoParallax(sectionRef, parallaxTargetRef)

onMounted(() => {
  nextTick(() => {
    scheduleWithoutTitleReveal()
    initVideoParallax()
  })
})

onUnmounted(() => {
  linksTween?.kill()
  trustpilotTween?.kill()
  if (preloaderRevealListener) {
    document.removeEventListener('preloader-complete', preloaderRevealListener)
    preloaderRevealListener = null
  }
})
</script>

<style scoped>
.section-video {
  width: 100%;
}

.section-video__inner {
  position: relative;
}

.section-video__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.section-video__title-wrap {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
  color: var(--fuji);
  text-align: left;
}

.section-video__trustpilot {
  opacity: 0;
}

.section-trustpilot__summary {
  justify-items: start;
  pointer-events: auto;
}

.section-video__title-content {
  justify-items: start;
  width: 100%;
}

.section-video__title {
  max-width: min(90vw, 28em);
  margin: 0;
  line-height: 1.1;
}

.section-video__links {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  pointer-events: auto;
  opacity: 0;
}

.section-video__links:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.section-video__links:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}
</style>
