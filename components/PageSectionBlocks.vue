<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="section-blocks section-padding"
  >
    <div class="wrapper grid-1 gap-section">
      <div v-if="titleBlocks.length" class="serif h2 section-blocks__heading">
        <SanityInline :blocks="titleBlocks" />
      </div>

      <div v-if="items.length" class="section-blocks__items grid-1 gap-3">
        <template
          v-for="(item, index) in items"
          :key="item._key"
        >
          <article
            class="section-blocks__item grid-1 grid-md-2"
            :class="{ 'section-blocks__item--open': !isDesktop && expandedMobileKey === item._key }"
            :style="{ '--item-index': index }"
          >
            <h3
              v-if="item.title"
              class="h5 section-blocks__title"
              :class="{ 'section-blocks__title--interactive': !isDesktop && hasItemDescription(item) }"
              :role="!isDesktop && hasItemDescription(item) ? 'button' : undefined"
              :tabindex="!isDesktop && hasItemDescription(item) ? 0 : undefined"
              :aria-expanded="!isDesktop && hasItemDescription(item) ? expandedMobileKey === item._key : undefined"
              @click="onTitleClick(item)"
              @keydown.enter.prevent="onTitleClick(item)"
              @keydown.space.prevent="onTitleClick(item)"
            >
              <span class="section-blocks__title-text">{{ item.title }}</span>

              <span
                v-if="!isDesktop && hasItemDescription(item)"
                class="section-blocks__toggle"
                aria-hidden="true"
              >
                <span
                  class="section-blocks__toggle-plus"
                  :class="{ 'section-blocks__toggle-plus--open': expandedMobileKey === item._key }"
                >
                  <span class="section-blocks__toggle-plus-bar section-blocks__toggle-plus-bar--horizontal" />
                  <span class="section-blocks__toggle-plus-bar section-blocks__toggle-plus-bar--vertical" />
                </span>
              </span>
            </h3>

            <div
              v-if="hasItemDescription(item)"
              class="section-blocks__description-wrap"
              :class="{ 'section-blocks__description-wrap--open': isDesktop || expandedMobileKey === item._key }"
              :aria-hidden="!isDesktop && expandedMobileKey !== item._key"
            >
              <SanityContent
                :blocks="item.description"
                class="section-blocks__description rich-text"
              />
            </div>
          </article>
        </template>
      </div>

      <div v-if="hasLink" class="section-blocks__link text-center">
        <MenuLink
          :item="menuItem"
          :show-arrow="false"
          class="menu-link--underline h4 serif"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { whatsappUrl } = useSiteSettings()
const { getMenuItemUrl } = useMenuLinks()

const isDesktop = ref(false)
const expandedMobileKey = ref(null)
const sectionRef = ref(null)

let desktopMediaQuery = null
let inViewObserver = null

function syncDesktop() {
  isDesktop.value = desktopMediaQuery?.matches ?? false
}

onMounted(() => {
  if (!import.meta.client) return

  desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  syncDesktop()
  desktopMediaQuery.addEventListener('change', syncDesktop)

  const section = sectionRef.value
  if (!section) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Gate the animated (hidden) start state behind a class so content stays
  // visible if JS never runs.
  section.classList.add('is--blocks-ready')

  inViewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        section.classList.toggle('in-view', entry.isIntersecting)
      })
    },
    { threshold: 0 },
  )

  inViewObserver.observe(section)
})

onUnmounted(() => {
  desktopMediaQuery?.removeEventListener('change', syncDesktop)
  inViewObserver?.disconnect()
  inViewObserver = null
})

watch(isDesktop, (desktop) => {
  if (desktop) expandedMobileKey.value = null
})

const titleBlocks = computed(() => props.section?.blocksTitle ?? [])
const items = computed(() => props.section?.blocksItems ?? [])

const menuItem = computed(() => ({
  text: props.section?.blocksLinkText,
  link: props.section?.blocksLink,
}))

const hasLink = computed(() => {
  const link = props.section?.blocksLink
  if (!props.section?.blocksLinkText || !link?.type) return false
  if (link.type === 'whatsapp') return Boolean(whatsappUrl.value)

  const href = getMenuItemUrl(menuItem.value)
  return Boolean(href && href !== '#')
})

const hasContent = computed(
  () => titleBlocks.value.length > 0
    || items.value.length > 0
    || hasLink.value,
)

function hasItemDescription(item) {
  return Array.isArray(item?.description) && item.description.length > 0
}

function onTitleClick(item) {
  if (isDesktop.value || !hasItemDescription(item)) return
  expandedMobileKey.value = expandedMobileKey.value === item._key ? null : item._key
}
</script>

<style scoped>
.section-blocks__items {
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
}

.section-blocks__title {
  margin: 0;
}

.section-blocks__title-text {
  display: block;
}

/* Mobile: accordions with dividing lines */
@media (max-width: 999px) {
  .section-blocks__heading :deep(br) {
    display: none;
  }

  .section-blocks__items {
    gap: 0;
  }

  .section-blocks__item {
    --item-index: 0;
    --item-delay: calc(var(--item-index) * 0.12s);
    --reveal-duration: 0.8s;
    position: relative;
    padding: 30px 0;
  }

  .section-blocks__item::before,
  .section-blocks__item:last-child::after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 1px;
    background: currentColor;
    opacity: 0.2;
    transform: scaleX(1);
    transform-origin: left center;
  }

  .section-blocks__item::before {
    top: 0;
  }

  .section-blocks__item:last-child::after {
    bottom: 0;
  }

  /* Scroll reveal: staggered scaleX on the divider pseudo-elements and a
     fade-in on the titles, gated behind `is--blocks-ready` / `in-view`. */
  .section-blocks.is--blocks-ready .section-blocks__item::before,
  .section-blocks.is--blocks-ready .section-blocks__item:last-child::after,
  .section-blocks.is--blocks-ready .section-blocks__title {
    transition-property: opacity, transform;
    transition-duration: var(--reveal-duration);
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .section-blocks.is--blocks-ready:not(.in-view) .section-blocks__item::before,
  .section-blocks.is--blocks-ready:not(.in-view) .section-blocks__item:last-child::after {
    transform: scaleX(0);
  }

  .section-blocks.is--blocks-ready:not(.in-view) .section-blocks__title {
    opacity: 0;
  }

  .section-blocks.is--blocks-ready.in-view .section-blocks__item::before {
    transition-delay: var(--item-delay);
  }

  .section-blocks.is--blocks-ready.in-view .section-blocks__title {
    transition-delay: calc(var(--item-delay) + 0.15s);
  }

  .section-blocks.is--blocks-ready.in-view .section-blocks__item:last-child::after {
    transition-delay: calc(var(--item-delay) + 0.15s);
  }

  .section-blocks__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .section-blocks__title--interactive {
    cursor: pointer;
  }

  .section-blocks__toggle {
    flex-shrink: 0;
    display: flex;
    align-items: start;
    justify-content: center;
    transform: translateY(10%);
  }

  .section-blocks__toggle-plus {
    position: relative;
    width: 25px;
    height: 25px;
    display: block;
  }

  .section-blocks__toggle-plus-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    background: currentColor;
    transform: translate(-50%, -50%);
  }

  .section-blocks__toggle-plus-bar--horizontal {
    width: 100%;
    height: 1px;
  }

  .section-blocks__toggle-plus-bar--vertical {
    width: 1px;
    height: 100%;
    transition: opacity 0.25s ease;
  }

  .section-blocks__toggle-plus--open .section-blocks__toggle-plus-bar--vertical {
    opacity: 0;
  }

  .section-blocks__description-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease;
  }

  .section-blocks__description-wrap--open {
    grid-template-rows: 1fr;
  }

  .section-blocks__description {
    overflow: hidden;
    min-height: 0;
  }
  .section-blocks__description > *:first-child {
    padding-top:60px;
  }
  .section-blocks__description > *:last-child {
    padding-bottom:20px;
  }
}
@media (max-width: 699px) {
  .section-blocks__toggle-plus {
    position: relative;
    width: 15px;
    height: 15px;
    display: block;
  }
}

/* Desktop: keep the boxed two-column layout */
@media (min-width: 1000px) {
  .section-blocks__item {
    display: grid;
    width: 100%;
    background: var(--crayon);
    padding: clamp(40px, 7vw, 80px);
  }
}
</style>
