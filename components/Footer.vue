<template>
  <footer class="footer">
    <div class="footer-content wrapper">
      <div class="footer__inner grid-1 section-padding">


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
              aria-label="Footer"
            >
              <div
                v-for="group in footerMenuGroups"
                :key="group._key || group.title"
              >
                <div class="footer__menu grid-1">
                  <p v-if="group.title" class="footer__menu-title serif h6 light">
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


        <!-- <p
          v-if="footerShopifyLine"
          class="footer__shopify-line h8"
        >
          {{ footerShopifyLine }}
        </p> -->

        <div class="logo-social-container grid-1" >
          <LogoWide />

          <!-- <nav
            v-if="visibleSocialLinks.length"
            class="footer__social"
            aria-label="Social media"
          >
            <ul class="footer__social-list h7">
              <li
                v-for="link in visibleSocialLinks"
                :key="`${link.platform}-${link.url}`"
              >
                <a
                  class="footer__social-link underline-links"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ link.label?.trim() || formatSocialPlatform(link.platform) }}
                </a>
              </li>
            </ul>
          </nav> -->

        <div
          v-if="privacyMenuItems.length || footerLegal.length"
          class="footer__bottom"
        >
          <div class="footer__legal-row h8">
            <div
              v-if="footerLegal.length"
              class="footer__legal-copy"
            >
              <SanityContent :blocks="footerLegal" />
            </div>
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
          </div>
        </div>
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup>
const {
  footerMenus,
  footerStrapline,
  footerLegal,
  privacyMenu,
  footerShowTrustpilot,
  socialLinks,
  footerShopifyLine,
} = useSiteSettings()

const SOCIAL_PLATFORM_LABELS = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'Twitter',
  tiktok: 'TikTok',
}

function formatSocialPlatform(platform) {
  return SOCIAL_PLATFORM_LABELS[String(platform ?? '').trim()] || platform || 'Link'
}

const visibleSocialLinks = computed(() =>
  socialLinks.value.filter((link) => String(link?.url ?? '').trim()),
)

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
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  background: var(--background-color);
  color: var(--text-color);
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

.footer__menu-title {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.footer__inner {
  display: flex;
  flex-direction: column;
  gap: 150px;
  padding: 140px 40px 90px;
}
.menus--container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer__menus {
  max-width:1200px;
}

.logo-social-container {
  gap:40px;
}

@media (min-width: 1000px) {
  .footer__menus {
    grid-template-columns: 1fr 1fr 1fr auto;
    padding-right:20px;
  }
}

.footer__menus .h7 {
  font-size: 15px;
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
  line-height: 1.2;
}

.footer__menu-list :deep(.menu-item__spacer) {
  width: 100%;
  height: 80px;
}

.footer__menu-list :deep(.menu-link__underline) {
  display: none;
}

.footer__menu-list :deep(.menu-link) {
  transition: opacity 0.3s ease;
}

.footer__menu-list :deep(.menu-link:hover) {
  opacity: 0.6;
}

.footer__menu-list :deep(.menu-link:hover .menu-link__text) {
  transform: none;
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

.footer__legal-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0 1.5rem;
  width: 100%;
}

.footer__legal-copy {
  opacity: 0.4;
}

.footer__legal-copy :deep(p),
.footer__legal-copy :deep(h1),
.footer__legal-copy :deep(h2),
.footer__legal-copy :deep(h3),
.footer__legal-copy :deep(h4),
.footer__legal-copy :deep(h5),
.footer__legal-copy :deep(h6) {
  margin: 0;
  display: inline;
  font-size: inherit;
  line-height: inherit;
}

.footer__legal-copy :deep(a) {
  display: inline-block;
  color: inherit;
  text-decoration: none;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.footer__legal-copy :deep(a:hover) {
  opacity: 0.8;
}

.footer__social {
  display: flex;
  justify-content: center;
}

.footer__social-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer__social-link {
  display: inline-block;
  padding: 0.65rem 0;
  text-decoration: none;
  color: inherit;
}

.footer__shopify-line {
  margin: 0;
  text-align: center;
  opacity: 0.65;
}

.footer__bottom {
  width: 100%;
}

.footer__privacy {
  display: flex;
}

.footer__privacy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: center;
}

.footer__privacy-list :deep(.menu-link) {
  padding: 0.65rem 0;
  display: inline-block;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.footer__privacy-list :deep(.menu-link:hover) {
  opacity: 0.8;
}

.footer__privacy-list :deep(.menu-link__underline) {
  display: none;
}

.footer__privacy-list :deep(.menu-link:hover .menu-link__text) {
  transform: none;
}

.strapline--container {
  display: flex;
  flex-direction: column;
  --trustpilot-wordmark-fill: var(--text-color);
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
