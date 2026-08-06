<template>
  <div
    ref="sectionRef"
    class="page-section-videos"
    :class="{
      'is-stack-layout': isStackLayout,
      'is-player-open': isPlayerOpen,
      'is-navigation-suspended': isNavigationSuspended,
    }"
  >
    <div
      v-if="pending && !videos.length"
      class="page-section-videos__loading serif"
    >
      Loading videos…
    </div>

    <div
      v-else-if="!videos.length"
      class="page-section-videos__empty serif"
    >
      No videos yet.
    </div>

    <template v-else>
      <div
        v-if="isStackLayout"
        class="page-section-videos__stack"
      >
        <article
          v-for="(video, index) in videos"
          :key="video._id"
          class="page-section-videos__stack-item"
        >
          <VideosScrollItem
            :ref="(el) => setItemRef(el, index)"
            :video="video"
            :index="index"
            layout="stack"
            :interactable="true"
            @playing="onPlaying"
            @closed="onClosed"
            @runtime="onRuntime"
          />
        </article>
      </div>

      <template v-else>
        <div
          ref="sliderElement"
          class="page-section-videos__slider"
          :class="{ 'is-settled': sliderSettled }"
          data-slider
        >
          <div
            v-for="(video, index) in videos"
            :key="video._id"
            class="page-section-videos__slide"
          >
            <VideosScrollItem
              :ref="(el) => setItemRef(el, index)"
              :video="video"
              :index="index"
              layout="slider"
              :interactable="!isDragging && focusedIndex === index"
              @playing="onPlaying"
              @closed="onClosed"
              @runtime="onRuntime"
            />
          </div>
        </div>

        <aside
          class="page-section-videos__counter handwritten"
          aria-live="polite"
          :aria-label="`${currentLabel} of ${totalLabel}`"
        >
          <div
            class="page-section-videos__counter-window"
            aria-hidden="true"
          >
            <div
              ref="reelRef"
              class="page-section-videos__counter-reel"
            >
              <span
                v-for="entry in reelEntries"
                :key="entry.key"
                class="page-section-videos__counter-num"
              >
                {{ entry.label }}
              </span>
            </div>
          </div>
          <span
            class="page-section-videos__counter-rule"
            aria-hidden="true"
          />
          <span class="page-section-videos__counter-total">{{ totalLabel }}</span>
        </aside>
      </template>
    </template>
  </div>
</template>

<script setup>
import gsap from 'gsap'

defineProps({
  section: {
    type: Object,
    required: true,
  },
})

// Thumbnail media is taller than the frame so it can drift without exposing edges.
// Max yPercent must equal half the extra height, expressed as a % of the media element.
const THUMB_EXTRA_HEIGHT_PERCENT = 10
const THUMB_HEIGHT_PERCENT = 100 + THUMB_EXTRA_HEIGHT_PERCENT
const PARALLAX_STRENGTH = ((THUMB_EXTRA_HEIGHT_PERCENT / 2) / THUMB_HEIGHT_PERCENT) * 100

const { data, pending } = await useAsyncData('videos', () => $fetch('/api/videos'), {
  default: () => [],
})

const videos = ref([])
watch(
  data,
  (value) => {
    videos.value = Array.isArray(value) ? value.map((video) => ({ ...video })) : []
  },
  { immediate: true },
)

const sliderElement = ref(null)
const sectionRef = ref(null)
const reelRef = ref(null)
const currentIndex = ref(0)
const focusedIndex = ref(0)
const isDragging = ref(false)
const sliderSettled = ref(false)
const isPlayerOpen = ref(false)
const isStackLayout = ref(false)
const isNavigationSuspended = ref(false)
const itemRefs = []
let lenisWasStopped = false
let parallaxNodes = []
let reelTween = null
let reelOffset = 0
let stackMediaQuery = null

const currentLabel = computed(() => String(currentIndex.value + 1))
const totalLabel = computed(() => String(videos.value.length || 0))

// Enough repeats so wrap spins feel continuous (fruit-machine reel)
const reelEntries = computed(() => {
  const total = videos.value.length
  if (!total) return []
  const loops = 5
  const entries = []
  for (let loop = 0; loop < loops; loop += 1) {
    for (let i = 0; i < total; i += 1) {
      entries.push({
        key: `${loop}-${i}`,
        label: String(i + 1),
        index: i,
      })
    }
  }
  return entries
})

const reelMidLoop = computed(() => Math.floor(5 / 2))

function reelUnit() {
  const el = reelRef.value?.querySelector?.('.page-section-videos__counter-num')
  return el?.getBoundingClientRect?.().height || 18
}

function setReelToIndex(index, { animate = true, direction = 1 } = {}) {
  const total = videos.value.length
  const reel = reelRef.value
  if (!total || !reel) return

  const unit = reelUnit()
  const midBase = reelMidLoop.value * total
  let targetSlot = midBase + index

  if (animate) {
    const currentSlot = Math.round(reelOffset / unit)
    const currentMod = ((currentSlot % total) + total) % total
    let delta = index - currentMod
    if (direction > 0 && delta <= 0) delta += total
    if (direction < 0 && delta >= 0) delta -= total
    // Prefer traveling in the slide direction by at least one full step
    if (delta === 0) delta = direction > 0 ? total : -total
    targetSlot = currentSlot + delta
  }

  const y = -targetSlot * unit
  reelOffset = -y

  if (reelTween) reelTween.kill()

  if (!animate) {
    gsap.set(reel, { y })
    return
  }

  reelTween = gsap.to(reel, {
    y,
    duration: 0.7,
    ease: 'power4.out',
    onComplete: () => {
      // Recenter onto the middle loop so future spins never run out of strip
      const centered = -(midBase + index) * unit
      reelOffset = -centered
      gsap.set(reel, { y: centered })
      reelTween = null
    },
  })
}

const { slider, destroy: destroySlider, pauseUpdates } = useSmooothy(sliderElement, () => ({
  vertical: true,
  infinite: true,
  snap: true,
  variableWidth: true,
  scrollInput: true,
  lerpFactor: 0.42,
  snapStrength: 0.14,
  scrollSensitivity: 1.8,
  dragSensitivity: 0.008,
  speedDecay: 0.97,
  setOffset: ({ wrapperHeight, itemWidth, vertical }) =>
    vertical ? wrapperHeight / 2 : itemWidth,
  virtualScroll: {
    mouseMultiplier: 1,
    touchMultiplier: 2,
    firefoxMultiplier: 24,
    useKeyboard: false,
    passive: true,
  },
  onSlideChange: (current) => {
    const prev = currentIndex.value
    const total = videos.value.length
    let direction = 1
    if (total > 1) {
      if (current === prev) direction = 1
      else if (prev === total - 1 && current === 0) direction = 1
      else if (prev === 0 && current === total - 1) direction = -1
      else direction = current > prev ? 1 : -1
    }

    currentIndex.value = current
    setReelToIndex(current, { animate: true, direction })
    stopAllExcept(current)
    if (slider.value) slider.value.paused = false
  },
  onUpdate: (instance) => {
    if (isNavigationSuspended.value) return
    const dragging = Boolean(instance.isDragging)
    isDragging.value = dragging
    applyParallax(instance)
    focusedIndex.value = getCenteredSlideIndex(instance)
    if (!dragging) syncCurrentToCenter(instance)
  },
  onResize: (instance) => {
    if (instance.isDragging || snapLock || isNavigationSuspended.value) return
    syncSliderPosition(currentIndex.value, instance)
  },
  onReady: (instance) => {
    snapSliderInstant(currentIndex.value, instance)
  },
}))

let snapLock = false

function getCenteredSlideIndex(instance = slider.value) {
  if (!instance?.items?.length) return 0

  const viewportCenterY = window.innerHeight / 2
  let bestIndex = 0
  let bestDistance = Infinity

  instance.items.forEach((slideEl, i) => {
    const slideRect = slideEl.getBoundingClientRect()
    const slideCenterY = slideRect.top + slideRect.height / 2
    const distance = Math.abs(slideCenterY - viewportCenterY)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = i
    }
  })

  return bestIndex
}

function syncCurrentToCenter(instance = slider.value, { animateReel = false } = {}) {
  if (!instance?.items?.length) return

  const centered = getCenteredSlideIndex(instance)
  focusedIndex.value = centered
  if (centered === currentIndex.value) return

  const prev = currentIndex.value
  const total = videos.value.length
  let direction = 1
  if (total > 1) {
    if (centered === prev) direction = 1
    else if (prev === total - 1 && centered === 0) direction = 1
    else if (prev === 0 && centered === total - 1) direction = -1
    else direction = centered > prev ? 1 : -1
  }

  currentIndex.value = centered
  setReelToIndex(centered, { animate: animateReel, direction })
  stopAllExcept(centered)
}

function syncSliderPosition(index = 0, instance = slider.value) {
  if (!instance?.items?.length) return

  instance.goToIndex(index)
  instance.current = instance.target
  instance.update?.()
  applyParallax(instance)
  syncCurrentToCenter(instance)
}

function snapSliderInstant(index = 0, instance = slider.value) {
  if (!instance?.items?.length || snapLock) return

  snapLock = true
  instance.resize?.()
  syncSliderPosition(index, instance)
  sliderSettled.value = true
  snapLock = false
  nextTick(() => syncCurrentToCenter(instance))
}

function setItemRef(el, index) {
  if (!el) {
    itemRefs[index] = null
    return
  }
  itemRefs[index] = el
}

function stopAllExcept(keepIndex = -1) {
  itemRefs.forEach((item, i) => {
    if (i !== keepIndex) item?.stop?.()
  })
}

function onPlaying(index) {
  isPlayerOpen.value = true
  stopAllExcept(index)
  if (!isStackLayout.value && slider.value) slider.value.paused = true
}

function onClosed() {
  isPlayerOpen.value = false
  if (!isStackLayout.value && slider.value) slider.value.paused = false
}

function onRuntime({ index, runtimeSeconds }) {
  if (!videos.value[index]) return
  videos.value[index] = {
    ...videos.value[index],
    runtimeSeconds,
  }
}

function collectParallaxNodes() {
  parallaxNodes = sliderElement.value
    ? [...sliderElement.value.querySelectorAll('[data-p]')]
    : []
}

function applyParallax(instance) {
  if (!instance?.items?.length || !sliderElement.value) return
  if (parallaxNodes.length !== instance.items.length) collectParallaxNodes()

  const wrapperRect = sliderElement.value.getBoundingClientRect()
  const viewportCenterY = wrapperRect.top + instance.viewport.wrapperHeight / 2
  const normalizeRange = Math.max(instance.viewport.wrapperHeight / 2, 1)

  instance.items.forEach((slideEl, i) => {
    const media = parallaxNodes[i]
    if (!media || !slideEl) return

    const slideRect = slideEl.getBoundingClientRect()
    const slideCenterY = slideRect.top + slideRect.height / 2
    const normalized = (slideCenterY - viewportCenterY) / normalizeRange
    const offset = normalized * PARALLAX_STRENGTH

    gsap.set(media, { yPercent: offset, force3D: true })
  })
}

const videosScrollLocked = useState('videosScrollLocked', () => false)

function stopLenis() {
  const lenis = useNuxtApp().$lenis
  if (!lenis) return
  lenisWasStopped = true
  lenis.stop()
}

function startLenis() {
  const lenis = useNuxtApp().$lenis
  videosScrollLocked.value = false
  if (!lenis || !lenisWasStopped) return
  lenis.start()
  lenisWasStopped = false
}

function lockPageScroll() {
  if (!import.meta.client) return
  videosScrollLocked.value = true
  document.documentElement.classList.add('is-videos-slider')
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

function unlockPageScroll() {
  if (!import.meta.client) return
  videosScrollLocked.value = false
  document.documentElement.classList.remove('is-videos-slider')
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

function handleKeydown(event) {
  if (isStackLayout.value || !slider.value || slider.value.paused) return
  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault()
    slider.value.goToNext()
  } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    slider.value.goToPrev()
  }
}

watch(
  () => videos.value.length,
  async (count) => {
    if (!count || isStackLayout.value || isNavigationSuspended.value) return
    await nextTick()
    collectParallaxNodes()
    snapSliderInstant(currentIndex.value)
  },
)

watch(
  slider,
  (instance) => {
    if (!instance || isStackLayout.value || isNavigationSuspended.value) return
    nextTick(() => snapSliderInstant(currentIndex.value, instance))
  },
  { flush: 'post' },
)

function updateStackLayout() {
  isStackLayout.value = stackMediaQuery?.matches ?? false
}

function bootSlider() {
  if (isStackLayout.value) return
  holdNativeScrollOff()
  nextTick(() => {
    collectParallaxNodes()
    snapSliderInstant(currentIndex.value)
    setReelToIndex(currentIndex.value, { animate: false })
  })
}

function teardownSlider({ unlockScroll = true } = {}) {
  window.removeEventListener('keydown', handleKeydown)
  if (reelTween) reelTween.kill()
  stopAllExcept(-1)
  destroySlider()
  isPlayerOpen.value = false
  isNavigationSuspended.value = false

  if (unlockScroll) {
    releaseDeferredScrollUnlock()
  } else {
    scheduleDeferredScrollUnlock()
  }
}

watch(isStackLayout, (stack) => {
  if (stack) {
    teardownSlider()
    return
  }

  window.addEventListener('keydown', handleKeydown)
  bootSlider()
})

function holdNativeScrollOff() {
  if (isStackLayout.value || isNavigationSuspended.value) return
  const isTransitioning = useState('pageTransitioning', () => false)
  if (isTransitioning.value) return
  lockPageScroll()
  stopLenis()
}

function suspendForNavigation() {
  if (isNavigationSuspended.value || isStackLayout.value) return

  isNavigationSuspended.value = true
  pauseUpdates()

  const instance = slider.value
  if (instance) {
    instance.paused = true
    instance.target = instance.current
  }

  if (reelTween) {
    reelTween.kill()
    reelTween = null
  }
}

function suspendForPageLeave(event) {
  const section = sectionRef.value
  const leavingRoot = event?.detail?.leavingRoot
  if (!section || !leavingRoot?.contains(section)) return
  suspendForNavigation()
}

function releaseDeferredScrollUnlock() {
  unlockPageScroll()
  startLenis()
}

function scheduleDeferredScrollUnlock() {
  const isTransitioning = useState('pageTransitioning', () => false)
  if (!isTransitioning.value) {
    releaseDeferredScrollUnlock()
    return
  }

  const handler = () => {
    document.removeEventListener('page-transition-complete', handler)
    releaseDeferredScrollUnlock()
  }

  document.addEventListener('page-transition-complete', handler, { once: true })
}

onMounted(() => {
  if (import.meta.client) {
    stackMediaQuery = window.matchMedia('(max-width: 999px)')
    updateStackLayout()
    stackMediaQuery.addEventListener('change', updateStackLayout)
  }

  if (!isStackLayout.value) {
    holdNativeScrollOff()
    window.addEventListener('keydown', handleKeydown)
    document.addEventListener('crows:page-transition-before-leave', suspendForPageLeave)
  }

  const boot = () => {
    if (isStackLayout.value) return
    bootSlider()
  }

  if (document.body.classList.contains('preloader-complete')) {
    boot()
  } else {
    document.addEventListener('preloader-complete', boot, { once: true })
  }

  if (!isStackLayout.value) {
    document.addEventListener('crows:lenis-ready', holdNativeScrollOff)
    document.addEventListener('crows:scroll-system-ready', holdNativeScrollOff)
    nextTick(() => {
      setReelToIndex(currentIndex.value, { animate: false })
    })
  }
})

onBeforeRouteLeave(() => {
  suspendForNavigation()
})

onBeforeUnmount(() => {
  stackMediaQuery?.removeEventListener('change', updateStackLayout)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('crows:page-transition-before-leave', suspendForPageLeave)
  document.removeEventListener('crows:lenis-ready', holdNativeScrollOff)
  document.removeEventListener('crows:scroll-system-ready', holdNativeScrollOff)

  const isTransitioning = useState('pageTransitioning', () => false)
  teardownSlider({ unlockScroll: !isTransitioning.value })
})
</script>

<style scoped>
.page-section-videos {
  position: relative;
  height: 100svh;
  overflow: hidden;
  --videos-slide-gap: clamp(24px, 7vw, 200px);
}

.page-section-videos.is-stack-layout {
  height: auto;
  min-height: 100svh;
  overflow: visible;
  padding-top: calc(var(--header-height, 112) * 1px + clamp(1.5rem, 4vw, 2.5rem));
  padding-bottom: clamp(2.5rem, 8vw, 5rem);
}

.page-section-videos__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 6vw, 3.5rem);
  width: 100%;
}

.page-section-videos__stack-item {
  width: calc(100% - 80px);
}

.page-section-videos__loading,
.page-section-videos__empty {
  display: grid;
  place-items: center;
  min-height: 100svh;
  padding: calc(var(--header-height, 112) * 1px) var(--gutter);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: clamp(14px, 1.2vw, 18px);
}

.page-section-videos__slider {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  touch-action: none;
  visibility: hidden;
  cursor: grab;
}

.page-section-videos__slider:active {
  cursor: grabbing;
}

.page-section-videos.is-player-open,
.page-section-videos.is-player-open .page-section-videos__slider {
  cursor: pointer;
}

.page-section-videos__slider.is-settled {
  visibility: visible;
}

.page-section-videos__slide {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: auto;
  padding-block: calc(var(--videos-slide-gap) / 2);
  box-sizing: border-box;
}

.page-section-videos__counter {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 5;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(0px, .75vw, 50px);
  transform: translateY(-50%);
  font-family: var(--handwritten);
  font-size: clamp(20px, 1.65vw, 40px);
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1;
  pointer-events: none;
  color: var(--obsidian, #111);
  width: calc(calc(100% - var(--video-frame-width)) / 2);
  opacity: 0.75;
  justify-content: center;
}

.page-section-videos__counter-window {
  height: 1em;
  overflow: hidden;
}

.page-section-videos__counter-reel {
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.page-section-videos__counter-num,
.page-section-videos__counter-total {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  line-height: 1;
}

.page-section-videos__counter-rule {
  display: block;
  width: clamp(20px, 1.9vw, 100px);
  height: clamp(1px, 0.1vw, 2px);
  background: currentColor;
  transform: none;
  opacity: 1;
}

@media (max-width: 699px) {
  .page-section-videos__stack-item {
    width: calc(100% - 50px);
  }

  .page-section-videos__counter {
    right: 10px;
  }
}
</style>
