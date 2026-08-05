<template>
  <footer ref="footerRef" class="footer" :style="footerStyleVars">
    <div class="footer-content wrapper">
      <div class="footer__inner grid-1 gap-section section-padding">
        <div class="grid-1 gap-section gap-md-0">
          <div
            v-if="footerStrapline.length || footerShowTrustpilot"
            class="strapline--container gap-section gap-md-gutter"
          >
            <div
              v-if="footerStrapline.length"
              class="footer__strapline h3 serif"
            >
              <SanityContent :blocks="footerStrapline" />
            </div>
            <div v-if="footerShowTrustpilot" class="footer-trustpilot">
              <TrustpilotSummary
                fetch-business-unit
                light-wordmark
              />
            </div>
          </div>

          <div
            v-if="footerMenuGroups.length"
            class="menus--container"
          >
            <nav
              class="footer__menus grid-1 grid-sm-2 grid-md-4 gap-x-5"
              :class="{ 'is-menu-hovering': hoveredKey !== null }"
              aria-label="Footer"
              @pointerover="onPointerOver"
              @pointerleave="onPointerLeave"
            >
              <div
                v-for="group in footerMenuGroups"
                :key="group._key || group.title"
              >
                <div class="footer__menu grid-1">
                  <p v-if="group.title" class="footer__menu-title h8">
                    {{ group.title }}
                  </p>
                  <MenuLinkGroup
                    :items="group.items"
                    :group-key="group._key || group.title"
                    list-class="footer__menu-list h7"
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div
          v-if="privacyMenuItems.length || footerLegal.length"
          class="footer__bottom"
        >
          <div class="footer__legal">
            <nav
              v-if="privacyMenuItems.length"
              class="footer__privacy"
              aria-label="Legal"
            >
              <MenuLinkGroup
                :items="privacyMenuItems"
                group-key="privacy"
                list-class="footer__privacy-list h8"
              />
            </nav>
            <div
              v-else-if="footerLegal.length"
              class="footer__legal-copy underline-links"
            >
              <SanityContent :blocks="footerLegal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { toCssColor } from '~/utils/pageColors'

const {
  footerMenus,
  footerStrapline,
  footerLegal,
  privacyMenu,
  footerShowTrustpilot,
  footerBackgroundColor,
  footerTextColor,
  disableFooterBackgroundFade,
} = useSiteSettings()

const FOOTER_FADE_OBSERVER_MARGIN = '0px 0px 100% 0px'

const footerRef = ref(null)
let footerBackgroundApply = null
let footerScrollHandler = null
let footerFadeObserver = null
let footerFadeInitialized = false
let footerScrubTimeout = null
let refreshFooterBackgroundFade = null
let layoutRefreshHandler = null

const footerMenuGroups = computed(() =>
  footerMenus.value
    .filter((group) => group.menu?.items?.length)
    .map((group) => ({
      _key: group._key,
      title: group.title,
      items: group.menu.items,
    })),
)

const privacyMenuItems = computed(() => privacyMenu.value?.items || [])

const {
  hoveredKey,
  onPointerOver,
  onPointerLeave,
} = provideMenuLinkGroupHover()

const footerStyleVars = computed(() => ({
  '--footer-background-color': toCssColor(footerBackgroundColor.value, 'crayon'),
  '--footer-color': toCssColor(footerTextColor.value, 'racing-green'),
}))

function waitForLenisReady() {
  return new Promise((resolve) => {
    if (useNuxtApp().$lenis) {
      resolve()
      return
    }

    document.addEventListener('crows:lenis-ready', () => resolve(), { once: true })
  })
}

function getMaxScroll(lenis) {
  const docMax = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  )

  return Math.min(lenis.limit, docMax)
}

function measureFooterFadeStartScroll(lenis) {
  const footer = footerRef.value
  if (!footer) return 0

  return lenis.scroll + footer.getBoundingClientRect().top - window.innerHeight
}

function getFooterFadeProgress(lenis) {
  const maxScroll = getMaxScroll(lenis)
  if (maxScroll <= 0) return 1

  const start = Math.max(0, Math.min(measureFooterFadeStartScroll(lenis), maxScroll - 1))
  const distance = maxScroll - start
  const scroll = lenis.scroll

  if (distance <= 0) return 1
  if (scroll <= start) return 0
  if (scroll >= maxScroll - 1) return 1

  return Math.min(1, (scroll - start) / distance)
}

function attachFooterScrollListener() {
  const lenis = useNuxtApp().$lenis
  if (!lenis || footerScrollHandler) return

  footerScrollHandler = () => {
    const root = document.documentElement
    root.classList.add('is-footer-background-fade-scrubbing')

    if (footerScrubTimeout) clearTimeout(footerScrubTimeout)
    footerScrubTimeout = setTimeout(() => {
      root.classList.remove('is-footer-background-fade-scrubbing')
      footerScrubTimeout = null
    }, 80)

    footerBackgroundApply?.()
  }

  lenis.on('scroll', footerScrollHandler)
}

function detachFooterScrollListener() {
  const lenis = useNuxtApp().$lenis

  if (footerScrubTimeout) {
    clearTimeout(footerScrubTimeout)
    footerScrubTimeout = null
  }

  if (lenis && footerScrollHandler) {
    lenis.off('scroll', footerScrollHandler)
    footerScrollHandler = null
  }
}

function setFooterFadeColorStops(root) {
  root.style.setProperty('--footer-fade-start-bg', 'var(--background-color)')
  root.style.setProperty('--footer-fade-start-color', 'var(--text-color)')
  root.style.setProperty('--footer-fade-end-bg', toCssColor(footerBackgroundColor.value, 'crayon'))
  root.style.setProperty('--footer-fade-end-color', toCssColor(footerTextColor.value, 'racing-green'))
}

function destroyFooterBackgroundFade() {
  footerFadeObserver?.disconnect()
  footerFadeObserver = null
  footerFadeInitialized = false
  footerBackgroundApply = null
  refreshFooterBackgroundFade = null

  if (import.meta.client) {
    const root = document.documentElement
    root.classList.remove('is-footer-background-fade', 'is-footer-background-fade-scrubbing')
    root.style.removeProperty('--footer-fade-progress')
    root.style.removeProperty('--footer-fade-start-bg')
    root.style.removeProperty('--footer-fade-start-color')
    root.style.removeProperty('--footer-fade-end-bg')
    root.style.removeProperty('--footer-fade-end-color')
  }

  detachFooterScrollListener()
}

function initFooterBackgroundFade() {
  if (footerFadeInitialized || disableFooterBackgroundFade.value) return

  const lenis = useNuxtApp().$lenis
  const footer = footerRef.value
  if (!lenis || !footer || !import.meta.client) return

  footerFadeInitialized = true
  footerFadeObserver?.disconnect()
  footerFadeObserver = null

  const root = document.documentElement
  root.classList.add('is-footer-background-fade')
  setFooterFadeColorStops(root)

  const applyFade = () => {
    const progress = getFooterFadeProgress(lenis)
    root.style.setProperty('--footer-fade-progress', String(progress))
  }

  applyFade()
  footerBackgroundApply = applyFade
  attachFooterScrollListener()

  refreshFooterBackgroundFade = () => {
    lenis.resize?.()
    setFooterFadeColorStops(root)
    applyFade()
  }
}

function scheduleFooterBackgroundFade() {
  if (disableFooterBackgroundFade.value) return

  const footer = footerRef.value
  if (!footer || footerFadeInitialized || !import.meta.client) return

  footerFadeObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      initFooterBackgroundFade()
    }
  }, { rootMargin: FOOTER_FADE_OBSERVER_MARGIN })

  footerFadeObserver.observe(footer)
}

watch([footerBackgroundColor, footerTextColor], () => {
  if (!footerFadeInitialized || !import.meta.client || disableFooterBackgroundFade.value) return
  setFooterFadeColorStops(document.documentElement)
  refreshFooterBackgroundFade?.()
})

watch(disableFooterBackgroundFade, (disabled) => {
  if (disabled) {
    destroyFooterBackgroundFade()
    return
  }

  scheduleFooterBackgroundFade()
})

onMounted(async () => {
  if (!import.meta.client || !footerRef.value) return

  await nextTick()
  await waitForLenisReady()

  if (!disableFooterBackgroundFade.value) {
    scheduleFooterBackgroundFade()
  }

  layoutRefreshHandler = () => {
    nextTick(() => {
      refreshFooterBackgroundFade?.()
    })
  }

  document.addEventListener('crows:scroll-system-ready', layoutRefreshHandler)
  document.addEventListener('crows:scroll-layout-changed', layoutRefreshHandler)
})

onBeforeUnmount(() => {
  if (layoutRefreshHandler) {
    document.removeEventListener('crows:scroll-system-ready', layoutRefreshHandler)
    document.removeEventListener('crows:scroll-layout-changed', layoutRefreshHandler)
    layoutRefreshHandler = null
  }

  footerFadeObserver?.disconnect()
  footerFadeObserver = null
  destroyFooterBackgroundFade()
  detachFooterScrollListener()
})
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  background: var(--footer-transition-background, var(--footer-background-color));
  color: var(--footer-transition-footer-color, var(--footer-color));
  transition: background-color 0.6s ease, color 0.6s ease;
}

.footer-content {
  position: relative;
  z-index: 2;
}

.footer-content a {
  pointer-events: auto;
  padding: .65rem 0;
  display: block;
}

.footer__inner {
  display: flex;
  flex-direction: column;
}

.footer__menu {
  gap: calc(var(--unit) * 1.2);
}

.footer__menu-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: var(--underline-link-line-height);
}

.footer__menu-list :deep(.menu-item__spacer) {
  width: 100%;
  height: 80px;
}

.footer__menus.is-menu-hovering :deep(.menu-link) {
  opacity: 0.2;
}

.footer__menus.is-menu-hovering :deep(.menu-link.is-group-hover-target) {
  opacity: 1;
}

.footer__strapline :deep(p),
.footer__strapline :deep(h1),
.footer__strapline :deep(h2),
.footer__strapline :deep(h3),
.footer__strapline :deep(h4),
.footer__strapline :deep(h5),
.footer__strapline :deep(h6) {
  margin: 0;
  display: block;
}

.footer__legal {
  max-width: 49rem;
}

.footer__privacy {
  display: flex;
  justify-content: flex-end;
}

.footer__privacy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: flex-end;
}

.footer__privacy-list :deep(.menu-link) {
  padding: 0.65rem 0;
  display: inline-block;
}

.footer__privacy-list :deep(.menu-link__underline-base) {
  opacity: 0.2;
}

.footer__legal-copy :deep(p),
.footer__legal-copy :deep(h1),
.footer__legal-copy :deep(h2),
.footer__legal-copy :deep(h3),
.footer__legal-copy :deep(h4),
.footer__legal-copy :deep(h5),
.footer__legal-copy :deep(h6) {
  margin: 0;
  font-size: var(--h8);
  line-height: 2;
}

.strapline--container {
  display: flex;
  flex-direction: column;
  --trustpilot-wordmark-fill: var(--footer-transition-footer-color, var(--footer-color));
}

.footer__strapline {
  flex: 1;
  font-size: clamp(var(--h3), 5vw, 200px);
}

.footer-trustpilot {
  display: flex;
}

@media (min-width: 700px) {
  .strapline--container {
    flex-direction: row;
    align-items: center;
    gap: var(--gutter);
  }

  .footer__strapline {
    font-size: var(--h3);
  }
}
</style>
