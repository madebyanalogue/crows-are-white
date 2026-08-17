<template>
  <footer class="footer" :style="footerStyle">
    <div class="footer-content wrapper">
      <div class="footer__inner grid-1 section-padding">


        <div class="grid-1 gap-section gap-md-0">
          <div
            v-if="footerStrapline.length"
            class="strapline--container gap-section gap-md-gutter"
          >
            <div class="footer__strapline h3 serif">
              <SanityContent :blocks="footerStrapline" />
            </div>
          </div>

          <div
            v-if="footerMenuGroups.length"
            class="menus--container"
          >
            <nav
              class="footer__menus grid-1 grid-sm-3 gap-x-7"
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
                    @click.capture="onFooterNavigate"
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

        <div
          v-if="footerShowLogo || visibleSocialLinks.length"
          class="logo-social-container grid-1"
        >
          <LogoWide v-if="footerShowLogo" interactive />

          <nav
            v-if="visibleSocialLinks.length"
            class="footer__social"
            aria-label="Social media"
          >
            <ul
              class="footer__social-list"
              :class="`footer__social-list--${footerSocialStyle}`"
            >
              <template v-if="footerSocialStyle === 'initials'">
                <template
                  v-for="(link, index) in visibleSocialLinks"
                  :key="`${link.platform}-${link.url}`"
                >
                  <li
                    v-if="index > 0"
                    class="footer__social-divider"
                    aria-hidden="true"
                  >
                    ·
                  </li>
                  <li>
                    <a
                      class="footer__social-link"
                      :href="link.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      :aria-label="link.label?.trim() || formatSocialPlatform(link.platform)"
                    >
                      {{ formatSocialInitials(link.platform) }}
                    </a>
                  </li>
                </template>
              </template>

              <template v-else>
                <li
                  v-for="link in visibleSocialLinks"
                  :key="`${link.platform}-${link.url}`"
                >
                  <a
                    class="footer__social-link"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="link.label?.trim() || formatSocialPlatform(link.platform)"
                  >
                    <SocialIcon :platform="link.platform" />
                  </a>
                </li>
              </template>
            </ul>
          </nav>

        <div
          v-if="privacyMenuItems.length || footerLegal.length"
          class="footer__bottom"
        >
          <div class="footer__legal-row h8">
            <div
              v-if="footerLegal.length"
              class="footer__legal-copy"
            >
              <SanityContent :blocks="footerLegalBlocks" />
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
                @click.capture="onFooterNavigate"
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
import { toCssColor } from '~/utils/pageColors'
import {
  applyPortableTextTokens,
  getDefaultPortableTextTokens,
} from '~/utils/portableTextTokens'

const {
  footerMenus,
  footerStrapline,
  footerLegal,
  privacyMenu,
  socialLinks,
  footerShowLogo,
  footerSocialStyle,
  footerSocialFeatureColor,
  footerMenuHoverColor,
  footerShopifyLine,
} = useSiteSettings()

const { onFooterNavigate } = useFooterMobileNav()

const footerStyle = computed(() => ({
  '--footer-social-feature-color': toCssColor(footerSocialFeatureColor.value, 'arancio'),
  '--footer-menu-hover-color': toCssColor(footerMenuHoverColor.value, 'arancio'),
}))

const footerLegalBlocks = computed(() =>
  applyPortableTextTokens(footerLegal.value, getDefaultPortableTextTokens()),
)

const SOCIAL_PLATFORM_LABELS = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X',
  tiktok: 'TikTok',
}

const SOCIAL_PLATFORM_INITIALS = {
  instagram: 'IG',
  youtube: 'YT',
  twitter: 'TW',
  tiktok: 'TT',
}

function formatSocialPlatform(platform) {
  return SOCIAL_PLATFORM_LABELS[String(platform ?? '').trim()] || platform || 'Link'
}

function formatSocialInitials(platform) {
  const key = String(platform ?? '').trim().toLowerCase()
  return SOCIAL_PLATFORM_INITIALS[key] || key.slice(0, 2).toUpperCase() || 'SO'
}

const MAIN_SOCIAL_PLATFORMS = new Set(['instagram', 'youtube', 'twitter', 'tiktok'])

const visibleSocialLinks = computed(() =>
  socialLinks.value.filter((link) => {
    const platform = String(link?.platform ?? '').trim().toLowerCase()
    return String(link?.url ?? '').trim() && MAIN_SOCIAL_PLATFORMS.has(platform)
  }),
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

@media (min-width: 1000px) {
  .footer.footer--videos-mobile-only {
    display: none;
  }
}

.footer-content {
  position: relative;
  z-index: 2;
}
@media (min-width: 700px) {
.footer-content {
  padding-left: 20px;
  padding-right: 20px;
}
}

.footer-content a:not(.logo-wide__link):not(.footer__social-link) {
  pointer-events: auto;
  padding: .65rem 0;
  display: block;
}

.footer-content .logo-wide__link,
.footer-content .footer__social-link {
  padding: 0;
}

.footer__menu-title {
  font-size: clamp(31px, 3vw, 40px);
  font-weight: 300;
  letter-spacing: -0.03em;
  margin-bottom: 13px;
  font-family: var(--condensed);
  text-transform: uppercase;
  text-align: center;
}

.footer__inner {
  display: flex;
  flex-direction: column;
  gap: 110px;
  padding: 90px 0 50px;
}
@media (min-width: 1000px) {
  .footer__inner {
    gap: 190px;
    padding: 140px 40px 90px;
  }
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

.footer__menus .h7 {
  font-size: 23px;
}

.footer__menu {
  gap: calc(var(--unit) * 1.2);
}

.footer__menu-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: 1;
  font-family: var(--serif);
  font-weight: 300;
}

.footer__menu-list :deep(.menu-item__spacer) {
  width: 100%;
  height: 80px;
}

.footer__menu-list :deep(.menu-link__underline) {
  display: none;
}

.footer__menu-list :deep(.menu-link) {
  transition: color 0.3s ease;
}

.footer__menu-list :deep(.menu-link:hover),
.footer__menu-list :deep(.menu-link:focus-visible) {
  color: var(--footer-menu-hover-color);
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
  gap: 1.1rem;
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
  align-items: center;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer__social-list--initials {
  font-family: var(--serif);
  text-transform: uppercase;
}

.footer__social-list--icons {
  gap: 1.5rem;
}

.footer__social-divider {
  padding: 0 0.35em;
  opacity: 0.4;
  user-select: none;
}

.footer__social-list--initials .footer__social-link {
  display: inline-block;
  padding: 0.65rem 0;
  color: inherit;
  text-decoration: none;
  opacity: 0.4;
  letter-spacing: 0.02em;
  transition: opacity 0.3s ease;
}

.footer__social-list--initials .footer__social-link:hover,
.footer__social-list--initials .footer__social-link:focus-visible {
  opacity: 0.8;
}

.footer__social-list--icons .footer__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 8px;
  background: var(--text-color);
  border: 1px solid var(--text-color);
  color: var(--background-color);
  border-radius: 40px;
  box-sizing: border-box;
  text-decoration: none;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.footer__social-list--icons .footer__social-link:hover,
.footer__social-list--icons .footer__social-link:focus-visible {
  background: var(--footer-social-feature-color);
  border-color: var(--footer-social-feature-color);
  color: #fff;
}

.footer__social-list--icons .footer__social-link :deep(.social-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.footer__social-list--square {
  gap: 0;
  border-top: 1px solid var(--text-color);
  border-left: 1px solid var(--text-color);
}

.footer__social-list--square .footer__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  padding: 13px;
  border-right: 1px solid var(--text-color);
  border-bottom: 1px solid var(--text-color);
  color: #555;
  border-radius: 0;
  box-sizing: border-box;
  text-decoration: none;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.footer__social-list--square .footer__social-link:hover,
.footer__social-list--square .footer__social-link:focus-visible {
  position: relative;
  z-index: 1;
  border: 1px solid var(--footer-social-feature-color);
  background: var(--footer-social-feature-color);
  color: #fff;
}

.footer__social-list--square .footer__social-link :deep(.social-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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
  display: inline-block;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}
@media (min-width: 700px) {
  .footer__privacy-list :deep(.menu-link) {
    padding: 0.65rem 0;
}
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
}

.footer__strapline {
  flex: 1;
  font-size: clamp(var(--h3), 5vw, 200px);
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
