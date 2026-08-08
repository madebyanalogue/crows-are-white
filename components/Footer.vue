<template>
  <footer class="footer" :style="footerStyleVars">
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
} = useSiteSettings()

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
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  background: var(--footer-background-color);
  color: var(--footer-color);
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
  --trustpilot-wordmark-fill: var(--footer-color);
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
