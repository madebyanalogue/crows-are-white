<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="section-horizontal-gallery"
    :class="{ 'section-horizontal-gallery--single': !scrollEnabled }"
  >
    <div ref="pinRef" class="section-horizontal-gallery__pin">
      <div
        v-if="titleBlocks.length"
        ref="titleRef"
        class="section-horizontal-gallery__title-panel section-padding"
      >
        <h2 class="h2 serif section-horizontal-gallery__title wrapper">
          <SanityInline :blocks="titleBlocks" />
        </h2>
      </div>

      <div ref="trackRef" class="section-horizontal-gallery__track">
        <div
          class="section-horizontal-gallery__spacer"
          aria-hidden="true"
        />

        <div ref="itemsRef" class="section-horizontal-gallery__items">
            <figure
              v-for="item in items"
              :key="item._key"
              class="section-horizontal-gallery__item"
              :class="itemClasses(item)"
            >
              <NuxtLink
                v-if="itemPageHref(item)"
                :to="itemPageHref(item)"
                class="section-horizontal-gallery__image-container section-horizontal-gallery__image-container--linked"
                :style="imageContainerStyle(item)"
                :aria-label="imageLinkLabel(item)"
              >
                <AppImage
                  v-if="imageSrc(item)"
                  :src="imageSrc(item)"
                  :width="imageWidth(item)"
                  :height="imageHeight(item)"
                  :alt="imageAlt(item)"
                  class="section-horizontal-gallery__img"
                  sizes="gallery"
                />
              </NuxtLink>
              <div
                v-else
                class="section-horizontal-gallery__image-container"
                :style="imageContainerStyle(item)"
              >
                <AppImage
                  v-if="imageSrc(item)"
                  :src="imageSrc(item)"
                  :width="imageWidth(item)"
                  :height="imageHeight(item)"
                  :alt="imageAlt(item)"
                  class="section-horizontal-gallery__img"
                  sizes="gallery"
                />
              </div>
              <figcaption
                v-if="item.caption"
                class="section-horizontal-gallery__caption caption"
              >
                {{ item.caption }}
              </figcaption>
            </figure>
        </div>
      </div>
    </div>

    <div class="section-horizontal-gallery__mobile">
      <div class="wrapper grid-1 gap-section">
        <div
          v-if="titleBlocks.length"
          class="section-horizontal-gallery__mobile-title"
        >
          <h2 class="h2 serif">
            <SanityInline :blocks="titleBlocks" />
          </h2>
        </div>

        <figure
          v-for="item in items"
          :key="`${item._key}-mobile`"
          class="section-horizontal-gallery__mobile-item"
        >
          <NuxtLink
            v-if="itemPageHref(item)"
            :to="itemPageHref(item)"
            class="section-horizontal-gallery__mobile-image-container section-horizontal-gallery__image-container--linked"
            :aria-label="imageLinkLabel(item)"
          >
            <AppImage
              v-if="imageSrc(item)"
              :src="imageSrc(item)"
              :width="imageWidth(item)"
              :height="imageHeight(item)"
              :alt="imageAlt(item)"
              class="section-horizontal-gallery__img"
              sizes="full"
            />
          </NuxtLink>
          <div
            v-else
            class="section-horizontal-gallery__mobile-image-container"
          >
            <AppImage
              v-if="imageSrc(item)"
              :src="imageSrc(item)"
              :width="imageWidth(item)"
              :height="imageHeight(item)"
              :alt="imageAlt(item)"
              class="section-horizontal-gallery__img"
              sizes="full"
            />
          </div>
          <figcaption
            v-if="item.caption"
            class="section-horizontal-gallery__caption caption"
          >
            {{ item.caption }}
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup>
const { getMenuItemUrl } = useMenuLinks()

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)
const pinRef = ref(null)
const trackRef = ref(null)
const titleRef = ref(null)
const itemsRef = ref(null)

const titleBlocks = computed(() => props.section?.horizontalGalleryTitle ?? [])
const items = computed(() => props.section?.horizontalGalleryItems ?? [])

const hasContent = computed(
  () => titleBlocks.value.length > 0 || items.value.length > 0,
)

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

const scrollEnabled = computed(() => isDesktop.value && hasContent.value)

function itemClasses(item) {
  return [
    `section-horizontal-gallery__item--size-${item.size || 'medium'}`,
    `section-horizontal-gallery__item--align-${item.align || 'middle'}`,
  ]
}

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
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  return item?.caption || ''
}

function imageAspectRatio(item) {
  const width = imageWidth(item)
  const height = imageHeight(item)
  if (width && height) return `${width} / ${height}`
  return null
}

function imageContainerStyle(item) {
  const ratio = imageAspectRatio(item)
  return ratio ? { '--item-aspect-ratio': ratio } : undefined
}

function itemPageHref(item) {
  const slug = item?.page?.slug?.current
  if (slug == null) return ''

  const href = getMenuItemUrl({
    link: {
      type: 'page',
      page: item.page,
    },
  })

  return href && href !== '#' ? href : ''
}

function imageLinkLabel(item) {
  const caption = item?.caption?.trim()
  if (caption) return caption
  return imageAlt(item) || 'View page'
}

useHorizontalGalleryScroll({
  sectionRef,
  pinRef,
  trackRef,
  titleRef,
  itemsRef,
  hasTitle: computed(() => titleBlocks.value.length > 0),
  enabled: scrollEnabled,
})
</script>

<style scoped>
.section-horizontal-gallery {
  --horizontal-gallery-gap: calc(var(--section-padding) * 2.5);
  --horizontal-gallery-track-height: calc(100dvh - calc(var(--header-height) * 1px));
  --horizontal-gallery-title-ratio: 3 / 4;
  --horizontal-gallery-size-small: 45%;
  --horizontal-gallery-size-medium: 72.5%;
  --horizontal-gallery-size-full: 100%;
  --horizontal-gallery-intro-width: calc(50vw - var(--horizontal-gallery-gap));
  overflow: visible;
}

.section-horizontal-gallery__pin {
  position: relative;
  overflow: hidden;
  height: var(--horizontal-gallery-track-height);
}

.section-horizontal-gallery__track {
  display: flex;
  align-items: stretch;
  gap: var(--horizontal-gallery-gap);
  width: max-content;
  height: 100%;
  box-sizing: border-box;
  will-change: transform;
}

.section-horizontal-gallery__title-panel {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 0;
  flex: 0 0 var(--horizontal-gallery-intro-width);
  width: 50vw;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}

.section-horizontal-gallery__spacer {
  flex: 0 0 var(--horizontal-gallery-intro-width);
  width: var(--horizontal-gallery-intro-width);
  height: 100%;
  align-self: stretch;
  pointer-events: none;
}

.section-horizontal-gallery__items {
  display: flex;
  align-items: stretch;
  gap: var(--horizontal-gallery-gap);
  height: 100%;
}

.section-horizontal-gallery__title {
  margin: 0;
  max-width: calc(var(--wrapper-max-width) / 2);
  line-height: 1.2;
}

.section-horizontal-gallery__item {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  height: 100%;
  margin: 0;
}

.section-horizontal-gallery__item--align-top {
  justify-content: flex-start;
}

.section-horizontal-gallery__item--align-middle {
  justify-content: center;
}

.section-horizontal-gallery__item--align-bottom {
  justify-content: flex-end;
}

.section-horizontal-gallery__item--size-small .section-horizontal-gallery__image-container {
  height: var(--horizontal-gallery-size-small);
}

.section-horizontal-gallery__item--size-medium .section-horizontal-gallery__image-container {
  height: var(--horizontal-gallery-size-medium);
}

.section-horizontal-gallery__item--size-fullHeight .section-horizontal-gallery__image-container {
  height: var(--horizontal-gallery-size-full);
}

.section-horizontal-gallery__image-container {
  position: relative;
  width: auto;
  height: var(--horizontal-gallery-size-medium);
  aspect-ratio: var(--item-aspect-ratio, auto);
  /* overflow: hidden; */
}

.section-horizontal-gallery__image-container--linked {
  display: block;
  text-decoration: none;
  color: inherit;
}

.section-horizontal-gallery__image-container :deep(.app-image),
.section-horizontal-gallery__image-container :deep(.app-image__media) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.section-horizontal-gallery__image-container :deep(.app-image__img),
.section-horizontal-gallery__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover;
}

.section-horizontal-gallery__caption {
  flex: 0 0 auto;
}

.section-horizontal-gallery__mobile {
  display: block;
  padding: var(--section-padding) 0;
}

.section-horizontal-gallery__mobile-title {
  max-width: var(--max-text-block-width);
}

.section-horizontal-gallery__mobile-item {
  margin: 0;
}

.section-horizontal-gallery__mobile-image-container {
  width: 100%;
  max-width: 24rem;
}

.section-horizontal-gallery__mobile-image-container :deep(.app-image),
.section-horizontal-gallery__mobile-image-container :deep(.app-image__media),
.section-horizontal-gallery__mobile-image-container :deep(.app-image__img),
.section-horizontal-gallery__mobile-image-container .section-horizontal-gallery__img {
  position: static;
  width: 100%;
  height: auto;
  max-width: 100%;
}

@media (min-width: 1000px) {
  .section-horizontal-gallery:not(.section-horizontal-gallery--single):not(.is--horizontal-gallery-ready) .section-horizontal-gallery__pin {
    visibility: hidden;
  }

  .section-horizontal-gallery__mobile {
    display: none;
  }
}

@media (max-width: 999px) {
  .section-horizontal-gallery__pin {
    display: none;
  }
}
</style>
