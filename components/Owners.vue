<template>
  <section
    class="owners section-padding"
    :class="{ 'owners--no-pad-top': !paddingTop }"
  >
    <div class="owners__desktop">
      <div
        ref="viewportRef"
        class="owners__viewport"
        aria-label="Drag to browse owner key sets"
      >
        <div
          ref="trackRef"
          class="owners__track"
        >
          <article
            v-for="(item, setIndex) in displayItems"
            :key="item._key"
            class="owners__slide"
          >
            <OwnersKeySet
              :item="item"
              :set-index="setIndex"
              :id-prefix="`owners-desktop-${item._key}`"
              @key-ref="(keyIndex, el) => setKeyRef(setIndex, keyIndex, el)"
            />
          </article>
        </div>

        <div class="owners__hint caption" aria-hidden="true">
          Drag
        </div>
      </div>

      <div class="wrapper owners__copy-layer">
        <div class="owners__copy-col">
          <div
            class="owners__copy-inner"
            :style="{ opacity: copyOpacity }"
          >
            <Transition name="owners-fade" mode="out-in">
              <div
                v-if="activeItem?.title?.length"
                :key="`${activeItem._key}-title`"
                class="owners__title"
              >
                <h2 class="h3 serif">
                  <SanityInline :blocks="activeItem.title" />
                </h2>
              </div>
            </Transition>

            <Transition name="owners-fade" mode="out-in">
              <div
                v-if="activeItem?.description?.length"
                :key="`${activeItem._key}-description`"
                class="owners__description"
              >
                <SanityContent
                  :blocks="activeItem.description"
                  class="max-text-block-width"
                />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div class="owners__mobile">
      <div class="wrapper grid-1 gap-section">
        <article
          v-for="(item, setIndex) in displayItems"
          :key="`${item._key}-mobile`"
          class="owners__mobile-item grid-1 gap-4"
        >
          <div class="owners__mobile-set">
            <OwnersKeySet
              :item="item"
              :set-index="setIndex"
              :id-prefix="`owners-mobile-${item._key}`"
              static-keys
            />
          </div>

          <h2 v-if="item.title?.length" class="h4 serif">
            <SanityInline :blocks="item.title" />
          </h2>

          <SanityContent
            v-if="item.description?.length"
            :blocks="item.description"
            class="max-text-block-width"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import OwnersKeySet from '~/components/owners/OwnersKeySet.vue'
import { OWNERS_DISPLAY_COUNT, buildOwnersDisplayItems } from '~/utils/ownersItems'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const viewportRef = ref(null)
const trackRef = ref(null)
const keyRefs = ref([])
const activeIndex = ref(0)
const copyOpacity = ref(1)

const displayItems = computed(() => buildOwnersDisplayItems(props.section?.ownersItems))
const paddingTop = computed(() => props.section?.ownersPaddingTop !== false)
const activeItem = computed(() => displayItems.value[activeIndex.value] ?? displayItems.value[0] ?? null)

const isDesktop = ref(false)
let desktopMediaQuery = null

function syncDesktop() {
  isDesktop.value = desktopMediaQuery?.matches ?? false
}

function setKeyRef(setIndex, keyIndex, el) {
  if (!keyRefs.value[setIndex]) {
    keyRefs.value[setIndex] = []
  }
  keyRefs.value[setIndex][keyIndex] = el
}

function setActiveState({ index, copyOpacity: opacity }) {
  activeIndex.value = index
  copyOpacity.value = opacity
}

const carouselEnabled = computed(() => isDesktop.value)

onMounted(() => {
  if (!import.meta.client) return

  desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  syncDesktop()
  desktopMediaQuery.addEventListener('change', syncDesktop)
})

onUnmounted(() => {
  desktopMediaQuery?.removeEventListener('change', syncDesktop)
})

useOwnersCarousel({
  viewportRef,
  trackRef,
  keyRefs,
  itemCount: computed(() => OWNERS_DISPLAY_COUNT),
  displayItems,
  onActiveChange: setActiveState,
  enabled: carouselEnabled,
})
</script>

<style scoped>
.owners {
  --owners-object-scale: 2.5;
  --owners-ring-size-base: 105px;
  --owners-key-width-base: 72px;
  --owners-ring-size: calc(var(--owners-ring-size-base) * var(--owners-object-scale));
  --owners-key-width: calc(var(--owners-key-width-base) * var(--owners-object-scale));
  --owners-key-hole-radius: calc(var(--owners-ring-size) * 0.042);
  --owners-set-height: calc(var(--owners-ring-size) + var(--owners-key-width) * 2.75);
  --owners-set-width: calc(var(--owners-ring-size) + var(--owners-key-width) * 2);
}

.owners--no-pad-top {
  padding-top: 0;
}

.owners__desktop {
  display: none;
}

.owners__viewport {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  min-height: var(--owners-set-height);
  overflow: visible;
  touch-action: pan-x pinch-zoom;
  cursor: grab;
}

.owners__viewport:active {
  cursor: grabbing;
}

.owners__track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.owners__slide {
  flex: 0 0 100vw;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--unit) * 1.5) 0;
  box-sizing: border-box;
}

.owners__copy-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 4;
}

.owners__copy-col {
  display: flex;
  align-items: stretch;
  width: min(100%, 36rem);
  pointer-events: auto;
}

.owners__copy-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--unit) * 1.5);
  min-height: var(--owners-set-height);
  transition: opacity 0.2s ease;
}

.owners__title,
.owners__description {
  max-width: var(--max-text-block-width);
}

.owners__hint {
  position: absolute;
  right: var(--wrapper-padding);
  bottom: 0;
  margin: 0;
  opacity: 0.45;
  pointer-events: none;
  z-index: 2;
}

.owners__mobile {
  display: block;
  padding-top: var(--section-padding);
}

.owners__mobile-set {
  display: flex;
  justify-content: center;
}

.owners-fade-enter-active,
.owners-fade-leave-active {
  transition: opacity 0.35s ease;
}

.owners-fade-enter-from,
.owners-fade-leave-to {
  opacity: 0;
}

@media (min-width: 1000px) {
  .owners__desktop {
    position: relative;
    display: block;
  }

  .owners__mobile {
    display: none;
  }

  .owners--no-pad-top .owners__mobile {
    padding-top: 0;
  }
}

@media (max-width: 999px) {
  .owners--no-pad-top .owners__mobile {
    padding-top: 0;
  }
}
</style>
