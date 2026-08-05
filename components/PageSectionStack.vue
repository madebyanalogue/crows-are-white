<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="section-stack"
    :class="{
      'section-stack--no-pad-top': !paddingTop,
      'section-stack--single': items.length <= 1,
    }"
  >
    <div ref="pinRef" class="section-stack__pin">
      <div class="wrapper">
        <div class="section-stack__layout">
          <div class="section-stack__copy-col">
            <div
              class="section-stack__copy-inner"
              :style="{ opacity: copyOpacity }"
            >
              <Transition name="section-stack-fade" mode="out-in">
                <div
                  v-if="activeItem?.title?.length"
                  :key="activeItem._key"
                  class="section-stack__title"
                >
                  <h2 class="h4">
                    <SanityInline :blocks="activeItem.title" />
                  </h2>
                </div>
              </Transition>

              <Transition name="section-stack-fade" mode="out-in">
                <div
                  v-if="activeItem?.description?.length"
                  :key="`${activeItem._key}-description`"
                  class="section-stack__description"
                >
                  <SanityContent
                    :blocks="activeItem.description"
                    class="max-text-block-width"
                  />
                </div>
              </Transition>
            </div>
          </div>

          <div
            ref="centerRef"
            class="section-stack__center"
          >
            <div
              ref="pinLineRef"
              class="section-stack__pin-line"
              aria-hidden="true"
            />
            <div ref="gridRef" class="section-stack__grid">
              <div
                ref="coverBackdropRef"
                class="section-stack__cover-backdrop"
                aria-hidden="true"
              >
                <div class="section-stack__cover-book">
                  <StackCoverSvg class="section-stack__cover-svg section-stack__cover-svg--backdrop" />
                </div>
              </div>

              <figure
                v-for="(item, index) in displayItems"
                :key="item._key"
                class="section-stack__card"
                :style="{ zIndex: index + 1 }"
              >
                <div
                  class="section-stack__image-container"
                  :style="{ '--stack-image-ratio': imageAspectRatio(item) }"
                >
                  <AppImage
                    v-if="imageSrc(item)"
                    :src="imageSrc(item)"
                    :width="imageWidth(item)"
                    :height="imageHeight(item)"
                    :alt="imageAlt(item)"
                    class="section-stack__img"
                    sizes="half"
                  />
                </div>
              </figure>

              <div
                ref="coverRef"
                class="section-stack__cover"
                aria-hidden="true"
              >
                <div class="section-stack__cover-surface">
                  <div class="section-stack__cover-book">
                    <div class="section-stack__cover-panel section-stack__cover-panel--primary">
                      <div class="section-stack__cover-panel-inner">
                        <div class="section-stack__cover-face section-stack__cover-face--front">
                          <StackCoverSvg class="section-stack__cover-svg section-stack__cover-svg--primary" />
                        </div>
                        <div
                          class="section-stack__cover-face section-stack__cover-face--back"
                          aria-hidden="true"
                        >
                          <StackCoverSvg class="section-stack__cover-svg section-stack__cover-svg--primary-back" />
                        </div>
                      </div>
                    </div>
                    <div class="section-stack__cover-panel section-stack__cover-panel--duplicate">
                      <div class="section-stack__cover-panel-inner">
                        <div class="section-stack__cover-face section-stack__cover-face--front">
                          <StackCoverSvg
                            class="section-stack__cover-svg section-stack__cover-svg--duplicate"
                            aria-hidden="true"
                          />
                        </div>
                        <div
                          class="section-stack__cover-face section-stack__cover-face--back"
                          aria-hidden="true"
                        >
                          <StackCoverSvg class="section-stack__cover-svg section-stack__cover-svg--duplicate-back" />
                        </div>
                      </div>
                    </div>
                    <div class="section-stack__cover-strip-layer">
                      <StackCoverSvg class="section-stack__cover-svg section-stack__cover-svg--strip" />
                    </div>
                    <div
                      v-if="STACK_TEAR_STRIP_MODE === 'svg'"
                      class="section-stack__cover-tear-layer"
                    >
                      <StackCoverSvg
                        show-tear-segments
                        class="section-stack__cover-svg section-stack__cover-svg--tear"
                      />
                    </div>
                  </div>
                </div>
                <div
                  v-if="STACK_TEAR_STRIP_MODE === 'three'"
                  class="section-stack__cover-tear-layer section-stack__cover-tear-layer--three"
                >
                  <ClientOnly>
                    <StackCoverTearStripThree ref="tearStripThreeRef" />
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>

          <div class="section-stack__aside" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div class="section-stack__mobile">
      <div class="wrapper grid-1 gap-6">
        <article
          v-for="item in items"
          :key="`${item._key}-mobile`"
          class="section-stack__mobile-item grid-1 gap-3"
        >
          <h2 v-if="item.title?.length" class="h3 serif">
            <SanityInline :blocks="item.title" />
          </h2>

          <SanityContent
            v-if="item.description?.length"
            :blocks="item.description"
            class="max-text-block-width"
          />

          <figure v-if="imageSrc(item)" class="section-stack__mobile-figure">
            <div class="section-stack__image-container">
              <AppImage
                :src="imageSrc(item)"
                :width="imageWidth(item)"
                :height="imageHeight(item)"
                :alt="imageAlt(item)"
                class="section-stack__img"
                sizes="full"
              />
            </div>
          </figure>
          
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { STACK_SCROLL_REVERSED, STACK_TEAR_STRIP_MODE } from '~/composables/useStackScroll'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)
const pinRef = ref(null)
const centerRef = ref(null)
const coverRef = ref(null)
const coverBackdropRef = ref(null)
const pinLineRef = ref(null)
const gridRef = ref(null)
const tearStripThreeRef = ref(null)
const activeIndex = ref(0)
const copyOpacity = ref(1)

const items = computed(() => props.section?.stackItems ?? [])
const displayItems = computed(() => (
  STACK_SCROLL_REVERSED ? [...items.value].reverse() : items.value
))
const paddingTop = computed(() => props.section?.stackPaddingTop !== false)
const hasContent = computed(() => items.value.length > 0)
const activeItem = computed(() => displayItems.value[activeIndex.value] ?? displayItems.value[0] ?? null)

const isDesktop = ref(false)
let desktopMediaQuery = null

function syncDesktop() {
  isDesktop.value = desktopMediaQuery?.matches ?? false
}

onMounted(() => {
  if (!import.meta.client) return

  desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  syncDesktop()
  desktopMediaQuery.addEventListener('change', syncDesktop)
})

onUnmounted(() => {
  desktopMediaQuery?.removeEventListener('change', syncDesktop)
})

const scrollEnabled = computed(() => isDesktop.value && items.value.length > 1)

function imageSrc(item) {
  return item?.image?.asset?._id || ''
}

function imageWidth(item) {
  return item?.image?.asset?.metadata?.dimensions?.width
}

function imageHeight(item) {
  return item?.image?.asset?.metadata?.dimensions?.height
}

function imageAlt(item) {
  const alt = item?.image?.alt
  return typeof alt === 'string' && alt.trim() ? alt.trim() : ''
}

function imageAspectRatio(item) {
  const width = imageWidth(item)
  const height = imageHeight(item)
  if (width && height) return `${width} / ${height}`
  return 'var(--stack-ratio-w) / var(--stack-ratio-h)'
}

function setScrollState({ index, copyOpacity: opacity }) {
  activeIndex.value = index
  copyOpacity.value = opacity
}

useStackScroll({
  sectionRef,
  pinRef,
  centerRef,
  coverRef,
  coverBackdropRef,
  pinLineRef,
  trackRef: gridRef,
  tearStripThreeRef,
  itemCount: computed(() => items.value.length),
  onActiveChange: setScrollState,
  enabled: scrollEnabled,
  tearStripMode: STACK_TEAR_STRIP_MODE,
})
</script>

<style scoped>

.section-stack {
  --stack-ratio-w: 6;
  --stack-ratio-h: 8.5;
  --stack-image-ratio: calc(var(--stack-ratio-w) / var(--stack-ratio-h));
  --section-padding-top: 40px;
  --section-padding-bottom: 80px;
  --stack-layout-inner-height: 100%;
  --stack-grid-gap: calc(var(--section-padding) * 4);
  --stack-pin-line: 0px;
  --stack-max-height: clamp(600px, calc(100dvh - 80px - 80px), 940px);
  --stack-center-ratio: 2.83 / 4;
  --stack-center-max-width: calc(var(--stack-max-height) * 2.83 / 4);
  --stack-cover-panel-primary: var(--obsidian);
  --stack-cover-panel-duplicate: var(--obsidian);
  --stack-cover-back-primary: var(--obsidian);
  --stack-cover-back-duplicate: var(--obsidian);
  --stack-cover-backdrop: #000
  --stack-cover-perspective: 12000px;

  --stack-cover-spine-x: 76.6%;
  overflow: visible;
}

.section-stack--no-pad-top .section-stack__pin {
  padding-top: 0;
}

.section-stack__pin {
  position: relative;
  overflow: visible;
}

.section-stack__cover-backdrop {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: auto;
  pointer-events: none;
  will-change: transform;
  overflow: visible;
  transform: translate3d(0, 145%, 0);
}

.section-stack__cover-backdrop .section-stack__cover-book {
  position: relative;
  height: 100%;
  aspect-ratio: 123.6 / 175;
}

.section-stack__cover-backdrop .section-stack__cover-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.section-stack__cover-backdrop .section-stack__cover-svg--backdrop :deep(.stack-cover-svg__body),
.section-stack__cover-backdrop .section-stack__cover-svg--backdrop :deep(.stack-cover-svg__strip),
.section-stack__cover-backdrop .section-stack__cover-svg--backdrop :deep(.section-stack__cover-segment) {
  fill: var(--stack-cover-backdrop);
}

.section-stack__cover-backdrop .section-stack__cover-svg--backdrop :deep(.stack-cover-svg__label) {
  visibility: hidden;
}

.section-stack__cover {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: auto;
  pointer-events: none;
  will-change: transform;
  overflow: visible;
  transform: translate3d(0, 145%, 0);
}

.section-stack__cover .section-stack__cover-surface {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: stretch;
  height: 100%;
  min-height: 0;
  background-color: var(--black);
  perspective: var(--stack-cover-perspective);
  perspective-origin: 50% 50%;
  overflow: visible;
  transform-style: preserve-3d;
}

.section-stack__cover .section-stack__cover-book {
  position: relative;
  height: 100%;
  aspect-ratio: 123.6 / 175;
  transform-style: preserve-3d;
  overflow: visible;
}

.section-stack__cover .section-stack__cover-panel {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform-style: preserve-3d;
  backface-visibility: visible;
}

.section-stack__cover .section-stack__cover-panel--primary {
  z-index: 1;
  transform-origin: 0% 50%;
}

.section-stack__cover .section-stack__cover-panel--duplicate {
  z-index: 3;
  pointer-events: none;
  transform-origin: 100% 50%;
}

.section-stack__cover .section-stack__cover-panel-inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.section-stack__cover .section-stack__cover-face {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transform-origin: var(--stack-cover-spine-x) 50%;
}

.section-stack__cover .section-stack__cover-face--front {
  transform: rotateY(0deg) translateZ(0.1px);
}

.section-stack__cover .section-stack__cover-face--back {
  transform: rotateY(180deg) translateZ(0.1px);
}

.section-stack__cover .section-stack__cover-face .section-stack__cover-svg,
.section-stack__cover .section-stack__cover-face .stack-cover-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.section-stack__cover .section-stack__cover-face--back .section-stack__cover-svg,
.section-stack__cover .section-stack__cover-face--back .stack-cover-svg {
  transform: scaleX(-1);
  transform-origin: var(--stack-cover-spine-x) 50%;
}

.section-stack__cover .section-stack__cover-face--back :deep(.stack-cover-svg__label),
.section-stack__cover .section-stack__cover-face--back :deep(.section-stack__cover-segment) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover .section-stack__cover-svg--primary-back :deep(.stack-cover-svg__body) {
  fill: var(--stack-cover-back-primary);
}

.section-stack__cover .section-stack__cover-svg--primary-back :deep(.stack-cover-svg__strip) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover .section-stack__cover-svg--duplicate-back :deep(.stack-cover-svg__body) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover .section-stack__cover-svg--duplicate-back :deep(.stack-cover-svg__strip) {
  fill: var(--stack-cover-back-duplicate);
}

.section-stack__cover .section-stack__cover-svg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: auto;
  transform-style: preserve-3d;
}

.section-stack__cover .section-stack__cover-strip-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.section-stack__cover .section-stack__cover-strip-layer .section-stack__cover-svg {
  left: 0;
  right: auto;
}

.section-stack__cover .section-stack__cover-tear-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

.section-stack__cover .section-stack__cover-tear-layer--three {
  z-index: 10;
  top: 0;
  left: 0;
  right: auto;
  bottom: auto;
  width: 100%;
  height: 100%;
  transform: translateZ(4px);
  transform-style: preserve-3d;
  overflow: visible;
}

.section-stack__cover .section-stack__cover-tear-layer .section-stack__cover-svg {
  left: 0;
  right: auto;
  perspective: 800px;
  perspective-origin: 76.6% 50%;
  transform-style: preserve-3d;
  overflow: visible;
}

.section-stack__cover .section-stack__cover-tear-layer :deep(.tear-strip) {
  transform-style: preserve-3d;
}

.section-stack__cover .section-stack__cover-tear-layer :deep(.tear-segment) {
  transform-box: fill-box;
  transform-style: preserve-3d;
}

.section-stack__cover .section-stack__cover-svg--strip :deep(.stack-cover-svg__body),
.section-stack__cover .section-stack__cover-svg--strip :deep(.stack-cover-svg__strip),
.section-stack__cover .section-stack__cover-svg--strip :deep(.stack-cover-svg__label),
.section-stack__cover .section-stack__cover-svg--tear :deep(.stack-cover-svg__body),
.section-stack__cover .section-stack__cover-svg--tear :deep(.stack-cover-svg__strip),
.section-stack__cover .section-stack__cover-svg--tear :deep(.stack-cover-svg__label) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover .section-stack__cover-svg--primary :deep(.section-stack__cover-segment),
.section-stack__cover .section-stack__cover-svg--duplicate :deep(.section-stack__cover-segment) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover .section-stack__cover-svg--duplicate :deep(.stack-cover-svg__label) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover.is--cover-reveal .section-stack__cover-svg--primary :deep(.stack-cover-svg__body) {
  fill: var(--stack-cover-panel-primary);
}

.section-stack__cover.is--cover-reveal .section-stack__cover-svg--primary :deep(.stack-cover-svg__strip) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover.is--cover-reveal .section-stack__cover-svg--duplicate {
  visibility: visible;
}

.section-stack__cover.is--cover-reveal .section-stack__cover-svg--duplicate :deep(.stack-cover-svg__body) {
  opacity: 0;
  visibility: hidden;
}

.section-stack__cover.is--cover-reveal .section-stack__cover-svg--duplicate :deep(.stack-cover-svg__strip) {
  fill: var(--stack-cover-panel-duplicate);
}

.section-stack__cover .stack-cover-svg {
  height: 100%;
  width: auto;
}

.section-stack__layout {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  width: 100%;
  max-height: calc(100dvh - calc(var(--header-height) * 1px));
  height: calc(100dvh - calc(var(--header-height) * 1px));
  padding-top: var(--section-padding-top);
  padding-bottom: var(--section-padding-bottom);
  box-sizing: border-box;
  overflow: visible;
}

.section-stack__copy-col {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--stack-card-height, auto);
  min-height: 0;
}

.section-stack__copy-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap:30px;
  width: 100%;
  height: 100%;
  min-height: 0;

}
@media (min-width: 1000px) {
  .section-stack__copy-inner {
    padding: 0 20% 0 10%;
  }
}

.section-stack__title {
  line-height: 1.4;
}
.section-stack__title,
.section-stack__description {
  width:100%;
  max-width: var(--max-text-block-width);
}

.section-stack__center {
  container-type: inline-size;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  overflow: visible;
  height: var(--stack-card-height, auto);
  min-height: 0;
  max-height: var(--stack-layout-inner-height);
}

.section-stack__pin-line {
  position: absolute;
  left: var(--stack-pin-line);
  bottom: 0;
  width: 0;
  height: 100%;
  pointer-events: none;
}

.section-stack__grid {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: var(--stack-grid-gap);
  align-items: stretch;
  justify-content: start;
  width: max-content;
  height: 100%;
  align-self: stretch;
}

.section-stack__card {
  display: flex;
  flex-direction: column;
  width: auto;
  height: 100%;
  align-self: stretch;
  max-height: none;
  min-height: 0;
  margin: 0;
  will-change: transform;
}

.section-stack__image-container {
  position: relative;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  width: auto;
  aspect-ratio: var(--stack-image-ratio);
  overflow: hidden;
}

.section-stack__image-container :deep(.app-image),
.section-stack__image-container :deep(.app-image__media) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.section-stack__image-container :deep(.app-image__img),
.section-stack__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover;
  object-position: left bottom;
}

.section-stack__mobile {
  display: block;
  padding-bottom: var(--section-padding) 0;
}

.section-stack__mobile-figure {
  width: 100%;
  margin: 0;
}

.section-stack__mobile-figure .section-stack__image-container {
  width: 100%;
  height: auto;
}

.section-stack__mobile-figure .section-stack__image-container :deep(.app-image),
.section-stack__mobile-figure .section-stack__image-container :deep(.app-image__media),
.section-stack__mobile-figure .section-stack__image-container :deep(.app-image__img),
.section-stack__mobile-figure .section-stack__img {
  position: static;
  width: 100%;
  height: auto;
  max-width: 100%;
}

.section-stack-fade-enter-active,
.section-stack-fade-leave-active {
  transition: opacity 0.35s ease;
}

.section-stack-fade-enter-from,
.section-stack-fade-leave-to {
  opacity: 0;
}

@media (min-width: 1000px) {
  .section-stack:not(.section-stack--single):not(.is--stack-ready):not(.is--stack-suspended) .section-stack__pin {
    visibility: hidden;
  }

  .section-stack.is--stack-suspended .section-stack__pin {
    visibility: visible;
  }

  .section-stack__layout {
    --stack-content-height: calc(
      100dvh - calc(var(--header-height) * 1px) - var(--section-padding-top) - var(--section-padding-bottom)
    );
    --stack-item-height: min(var(--stack-content-height), var(--stack-max-height));
    --stack-card-height: var(--stack-item-height);
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .section-stack__cover-backdrop,
  .section-stack__cover {
    display: flex;
    height: 100%;
    max-height: 100%;
  }

  .section-stack__cover .section-stack__cover-surface {
    height: 100%;
    max-height: 100%;
  }

  .section-stack__aside {
    display: none;
  }

  .section-stack__copy-col {
    height: var(--stack-item-height);
    max-height: var(--stack-max-height);
    align-self: center;
    /* border: 1px solid red; */
  }

  .section-stack__center {
    width: min(100%, var(--stack-center-max-width));
    max-height: var(--stack-max-height);
    aspect-ratio: var(--stack-center-ratio);
    height: auto;
    align-self: center;
    justify-self: start;
  }

  .section-stack__grid,
  .section-stack__card,
  .section-stack__image-container {
    height: 100%;
    max-height: 100%;
  }

  .section-stack__mobile {
    display: none;
  }

  .section-stack--single .section-stack__pin {
    min-height: auto;
  }

  .section-stack--single .section-stack__layout {
    height: auto;
    max-height: none;
  }
}

@media (max-width: 999px) {
  .section-stack__pin {
    display: none;
  }

  .section-stack__cover-backdrop,
  .section-stack__cover {
    display: none;
  }

  .section-stack--no-pad-top .section-stack__mobile {
    padding-top: 0;
  }
}
</style>
