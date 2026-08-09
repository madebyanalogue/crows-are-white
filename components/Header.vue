<template>
  <header
    class="site-header"
    :class="{
      'is-open': menuOpen,
      'is-cart-open': cartOpen && cartDisplayMode === 'dropdown',
      'is-over-hero': heroMenuActive,
      'is-over-hero-frosted': heroMenuFrosted,
    }"
  >
    <div
      v-if="menuOpen"
      class="site-header__backdrop"
      aria-hidden="true"
      @click="closeMenu"
    />

    <div
      v-if="cartOpen && cartDisplayMode === 'dropdown'"
      class="site-header__backdrop site-header__cart-backdrop"
      aria-hidden="true"
      @click="closeCart"
    />

    <div class="site-header__panel">
      <div
        class="site-header__bar"
        :class="{ 'site-header__bar--interactive': !menuOpen }"
        @click="onBarClick"
      >
        <div class="site-header__leading">
          <button
            ref="menuToggleRef"
            type="button"
            class="site-header__toggle"
            :aria-expanded="menuOpen"
            aria-controls="site-header-menu"
            :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
            @click.stop="toggleMenu"
          >
            <span class="site-header__toggle-icon" :class="{ 'is-open': menuOpen }" aria-hidden="true" />
          </button>
        </div>

        <div
          ref="pageNameWrapRef"
          class="site-header__page-name-wrap"
          @click.stop="onPageNameClick"
        >
          <NuxtLink
            v-if="pageNameLink"
            :to="pageNameLink"
            class="site-header__page-name site-header__page-name--link serif"
            :tabindex="menuOpen || cartOpen ? -1 : undefined"
            :aria-hidden="menuOpen ? 'true' : undefined"
          >
            <span
              v-for="(char, index) in pageNameChars"
              :key="`link-${index}-${char}`"
              class="site-header__page-name-char"
            >{{ char }}</span>
          </NuxtLink>
          <p
            v-else
            class="site-header__page-name serif"
            aria-current="page"
            :aria-hidden="menuOpen ? 'true' : undefined"
          >
            <span
              v-for="(char, index) in pageNameChars"
              :key="`text-${index}-${char}`"
              class="site-header__page-name-char"
            >{{ char }}</span>
          </p>
        </div>

        <div class="site-header__actions">
          <button
            type="button"
            class="site-header__cart"
            :aria-label="cartOpen ? 'Close cart' : 'Open cart'"
            :aria-expanded="cartOpen"
            @click.stop="onCartClick"
          >
            <svg
              class="site-header__cart-icon"
              viewBox="0 0 22 22"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M7 2h8v4h4v14H3V6h4V2zm1 1v3h6V3H8zM4 7v12h14V7H4z"
              />
            </svg>
            <span v-if="cartCount > 0" class="site-header__cart-count">{{ cartCount }}</span>
          </button>
        </div>
      </div>

      <nav
        id="site-header-menu"
        class="site-header__nav"
        aria-label="Main"
        :inert="menuOpen ? undefined : true"
        :aria-hidden="menuOpen ? undefined : 'true'"
      >
        <div
          ref="navInnerRef"
          class="site-header__nav-inner"
        >
          <ul class="site-header__list">
            <li
              v-for="item in menuItems"
              :key="item._key || item.text"
              class="site-header__item"
            >
              <MenuItem
                :item="item"
                link-class="site-header__link serif"
                :show-arrow="false"
                @click="onMenuNavigate"
              />
            </li>
          </ul>

          <ul
            v-if="subMenuItems.length || copyrightLabel"
            class="site-header__sublist"
            aria-label="Secondary"
          >
            <li
              v-for="item in subMenuItems"
              :key="item._key || item.text"
              class="site-header__subitem"
            >
              <MenuItem
                :item="item"
                link-class="site-header__sublink"
                :show-arrow="false"
                @click="onMenuNavigate"
              />
            </li>
            <li
              v-if="copyrightLabel"
              class="site-header__subitem site-header__subitem--copyright"
            >
              <span class="site-header__sublink">{{ copyrightLabel }}</span>
            </li>
          </ul>
        </div>
      </nav>

      <CartDropdown v-if="cartDisplayMode === 'dropdown'" />
    </div>
  </header>
</template>

<script setup>
import gsap from 'gsap'
import { defaultMainMenu, defaultMainMenuSub } from '~/data/site'
import { shopFilterFromQuery, shopIndexHref } from '~/utils/shopCollections'

const { primaryMenu, secondaryMenu, cartDisplayMode } = useSiteSettings()
const { count: cartCount, isOpen: cartOpen, toggleCart, closeCart } = useCart()
const route = useRoute()
const menuOpen = ref(false)
const heroMenuActive = useHeroMenuActive()
const heroMenuFrosted = useHeroMenuFrosted()
const pageTitle = useState('pageTitle', () => '')
const awaitingPageTitle = ref(false)
const { getMenuItemUrl } = useMenuLinks()
const navInnerRef = ref(null)
const pageNameWrapRef = ref(null)
const menuToggleRef = ref(null)
const displayedPageName = ref('')
let menuItemsTween = null
let menuItemsDelay = null
let pageNameTween = null
let titleSettleTimer = null
let pageNameHidden = false
let suppressPageNameIn = false
let openingCartFromMenu = false
const MENU_OPEN_MS = 320
const TITLE_SETTLE_MS = 60

const menuItems = computed(() =>
  (primaryMenu.value?.items || defaultMainMenu.items || []).filter(
    (item) => item?.itemType !== 'divider' && item?.itemType !== 'spacer',
  ),
)

const subMenuItems = computed(() =>
  (secondaryMenu.value?.items || defaultMainMenuSub.items || []).filter(
    (item) => item?.itemType !== 'divider' && item?.itemType !== 'spacer',
  ),
)

const pageNameChars = computed(() => {
  const label = (displayedPageName.value || '').toUpperCase()
  if (!label) return []
  return Array.from(label).map((char) => (char === ' ' ? '\u00a0' : char))
})

function normalizePath(path = '') {
  if (!path) return '/'
  const bare = path.split(/[?#]/)[0] || '/'
  if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1)
  return bare || '/'
}

function humanizePath(path) {
  const segment = normalizePath(path).split('/').filter(Boolean).pop()
  if (!segment) return 'Home'
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function labelFromMenu(path) {
  const current = normalizePath(path)
  const items = [...menuItems.value, ...subMenuItems.value]

  for (const item of items) {
    const href = getMenuItemUrl(item)
    if (!href || href.startsWith('#') || href.startsWith('http')) continue
    if (normalizePath(href) === current && item.text?.trim()) {
      return item.text.trim()
    }
  }

  return ''
}

function isShopProductPath(path) {
  const current = normalizePath(path)
  if (!current.startsWith('/shop/')) return false
  if (current === '/shop/cart') return false
  if (current.startsWith('/shop/collections')) return false
  return true
}

const currentPageName = computed(() => {
  const path = normalizePath(route.path)
  if (path === '/') return 'Home'
  if (isShopProductPath(path)) return 'Shop'

  if (awaitingPageTitle.value) {
    return labelFromMenu(path) || humanizePath(path)
  }

  const title = pageTitle.value?.trim()
  if (title) return title

  return labelFromMenu(path) || humanizePath(path)
})

const pageNameLink = computed(() => {
  if (displayedPageName.value === 'Cart') return null
  if (cartOpen.value) return null
  if (isShopProductPath(route.path)) {
    return shopIndexHref(shopFilterFromQuery(route.query.filter))
  }
  return null
})

const copyrightLabel = computed(() => {
  const year = new Date().getFullYear()
  return `©${year} ALL RIGHTS RESERVED`
})

watch(() => route.path, () => {
  awaitingPageTitle.value = true
}, { flush: 'pre' })

watch(pageTitle, (title) => {
  if (title?.trim()) awaitingPageTitle.value = false
})

function setDisplayedPageName(name) {
  killPageNameTween()
  displayedPageName.value = name || ''

  if (!import.meta.client) return

  nextTick(() => {
    const chars = pageNameCharEls()
    if (chars.length) gsap.set(chars, { yPercent: 0 })
    pageNameHidden = false
    if (pageNameWrapRef.value) gsap.set(pageNameWrapRef.value, { autoAlpha: 1 })
  })
}

function toggleMenu() {
  if (!menuOpen.value && cartOpen.value) {
    menuOpen.value = true
    closeCart()
    return
  }
  menuOpen.value = !menuOpen.value
}

function openMenu() {
  if (!menuOpen.value) menuOpen.value = true
}

function onBarClick(event) {
  if (menuOpen.value) return
  if (event.target.closest('a, button')) return
  if (cartOpen.value) return
  openMenu()
}

function onPageNameClick() {
  if (cartOpen.value) {
    closeCart()
    return
  }

  if (menuOpen.value || pageNameLink.value) return
  openMenu()
}

function onCartClick() {
  if (menuOpen.value && !cartOpen.value) {
    openingCartFromMenu = true
    suppressPageNameIn = true
  }

  closeMenu()

  if (cartOpen.value) {
    openingCartFromMenu = false
    suppressPageNameIn = false
    closeCart()
    return
  }

  toggleCart()
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false

  if (!import.meta.client) return

  nextTick(() => {
    const active = document.activeElement
    const coarsePointer = window.matchMedia('(hover: none)').matches

    if (coarsePointer) {
      if (active instanceof HTMLElement) active.blur()
      return
    }

    if (active && navInnerRef.value?.contains(active)) {
      menuToggleRef.value?.focus()
    }
  })
}

function onMenuNavigate() {
  // Keep title clipped through navigation; route watcher swaps + rises new title
  const pathBefore = route.fullPath
  suppressPageNameIn = true
  dropPageName()
  closeMenu()

  // Same-page link: route won't change, so restore title after close
  setTimeout(() => {
    if (route.fullPath !== pathBefore) return
    if (!suppressPageNameIn || menuOpen.value) return
    suppressPageNameIn = false
    animatePageNameIn()
  }, 120)
}

function menuItemEls() {
  const root = navInnerRef.value
  if (!root) return []
  return root.querySelectorAll('.site-header__item, .site-header__subitem')
}

function killMenuItemsTween() {
  if (menuItemsDelay != null) {
    clearTimeout(menuItemsDelay)
    menuItemsDelay = null
  }
  if (menuItemsTween) {
    menuItemsTween.kill()
    menuItemsTween = null
  }
}

function pageNameCharEls() {
  return pageNameWrapRef.value?.querySelectorAll?.('.site-header__page-name-char') || []
}

function killPageNameTween() {
  if (pageNameTween) {
    pageNameTween.kill()
    pageNameTween = null
  }
}

function dropPageName() {
  return new Promise((resolve) => {
    const chars = pageNameCharEls()
    if (!chars.length) {
      pageNameHidden = true
      resolve()
      return
    }

    if (pageNameHidden) {
      gsap.set(chars, { yPercent: 135 })
      resolve()
      return
    }

    killPageNameTween()
    pageNameTween = gsap.to(chars, {
      yPercent: 135,
      duration: 0.34,
      delay: 0,
      stagger: 0.018,
      ease: 'power3.in',
      overwrite: true,
      onComplete: () => {
        pageNameHidden = true
        pageNameTween = null
        resolve()
      },
    })
  })
}

function animatePageNameOut() {
  dropPageName()
}

function animatePageNameIn() {
  const chars = pageNameCharEls()
  if (!chars.length) return
  killPageNameTween()
  gsap.set(chars, { yPercent: 135 })
  // Reverse of the drop: rise back up from below into the clip
  pageNameTween = gsap.to(chars, {
    yPercent: 0,
    duration: 0.42,
    delay: 0,
    stagger: {
      each: 0.02,
      from: 'end',
    },
    ease: 'power3.out',
    overwrite: true,
    onComplete: () => {
      pageNameHidden = false
      pageNameTween = null
    },
  })
}

async function revealPageName(name) {
  displayedPageName.value = name || ''
  await nextTick()
  const chars = pageNameCharEls()
  gsap.set(chars, { yPercent: 135 })
  pageNameHidden = true
  if (menuOpen.value || suppressPageNameIn) return
  animatePageNameIn()
}

function waitForTitleSettle() {
  return new Promise((resolve) => {
    if (titleSettleTimer != null) {
      clearTimeout(titleSettleTimer)
      titleSettleTimer = null
    }

    let stopWatch = null
    const finish = () => {
      if (titleSettleTimer != null) {
        clearTimeout(titleSettleTimer)
        titleSettleTimer = null
      }
      stopWatch?.()
      resolve(currentPageName.value)
    }

    stopWatch = watch(currentPageName, () => {
      if (titleSettleTimer != null) clearTimeout(titleSettleTimer)
      titleSettleTimer = setTimeout(finish, TITLE_SETTLE_MS)
    })

    titleSettleTimer = setTimeout(finish, TITLE_SETTLE_MS)
  })
}

function normalizeRoutePath(fullPath = '') {
  const path = fullPath.split(/[?#]/)[0] || '/'
  return normalizePath(path)
}

async function onRouteChange(fullPath, oldFullPath) {
  if (!import.meta.client) return
  if (!oldFullPath || fullPath === oldFullPath) return
  if (normalizeRoutePath(fullPath) === normalizeRoutePath(oldFullPath)) return

  suppressPageNameIn = true
  if (cartOpen.value) closeCart()
  const dropPromise = dropPageName()
  if (menuOpen.value) closeMenu()
  await dropPromise

  const nextName = await waitForTitleSettle()
  awaitingPageTitle.value = false
  suppressPageNameIn = false
  await revealPageName(nextName)
}

async function animateMenuItemsIn() {
  await nextTick()
  const items = menuItemEls()
  if (!items.length) return

  killMenuItemsTween()
  gsap.set(items, { autoAlpha: 0, y: 14 })

  // Wait for panel width / nav expand to finish before revealing items
  menuItemsDelay = setTimeout(() => {
    menuItemsDelay = null
    if (!menuOpen.value) return
    menuItemsTween = gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      duration: 0.38,
      stagger: 0.055,
      ease: 'power2.out',
    })
  }, MENU_OPEN_MS)
}

function resetMenuItems() {
  killMenuItemsTween()
  const items = menuItemEls()
  if (items.length) gsap.set(items, { autoAlpha: 0, y: 14 })
}

watch(() => route.fullPath, onRouteChange)

watch(menuOpen, (open) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('is-nav-open', open)
  document.body.style.overflow = open ? 'hidden' : ''

  if (open) {
    // Start letter drop immediately — don't wait on panel expand
    animatePageNameOut()
    animateMenuItemsIn()
    return
  }

  resetMenuItems()
  if (!suppressPageNameIn && !cartOpen.value) animatePageNameIn()
})

watch(cartOpen, (open) => {
  if (!import.meta.client) return

  if (open) {
    if (openingCartFromMenu) {
      openingCartFromMenu = false
      suppressPageNameIn = false
      revealPageName('Cart')
      return
    }

    setDisplayedPageName('Cart')
    return
  }

  if (menuOpen.value || suppressPageNameIn) {
    if (displayedPageName.value === 'Cart') {
      displayedPageName.value = currentPageName.value
      nextTick(() => {
        const chars = pageNameCharEls()
        if (chars.length) gsap.set(chars, { yPercent: 135 })
        pageNameHidden = true
      })
    }
    return
  }

  setDisplayedPageName(currentPageName.value)
})

let keyHandler = null

onMounted(() => {
  if (!import.meta.client) return
  displayedPageName.value = currentPageName.value
  if (pageNameWrapRef.value) gsap.set(pageNameWrapRef.value, { autoAlpha: 1 })
  keyHandler = (event) => {
    if (event.key === 'Escape') closeMenu()
  }
  window.addEventListener('keydown', keyHandler)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  killMenuItemsTween()
  killPageNameTween()
  if (titleSettleTimer != null) clearTimeout(titleSettleTimer)
  document.documentElement.classList.remove('is-nav-open')
  document.body.style.overflow = ''
  if (keyHandler) window.removeEventListener('keydown', keyHandler)
})
</script>

<style scoped>
.site-header {
  --site-header-bar-height: 50px;
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  z-index: var(--z-site-header);
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding: 0 var(--wrapper-padding);
}

@media (min-width: 700px) {
  .site-header {
    top: 25px;
  }
}

.site-header__backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}

.site-header.is-cart-open .site-header__panel {
  width: min(100%, var(--site-header-panel-width-open));
  overflow: hidden;
}

.site-header.is-cart-open .site-header__panel::before {
  inset: 0;
}

.site-header.is-cart-open .site-header__bar {
  padding: 12px;
  height: calc(var(--site-header-bar-height) + 24px);
}

.site-header.is-cart-open .site-header__nav {
  padding-top: 0;
}

.site-header__panel {
  --site-header-panel-width-closed: 360px;
  --site-header-panel-hover-expand: 5px;
  --site-header-panel-width-open: 440px;

  position: relative;
  z-index: 1;
  width: min(100%, var(--site-header-panel-width-closed));
  max-width: 100%;
  min-height: var(--site-header-bar-height);
  background-color: transparent;
  color: var(--menu-text-color, var(--obsidian));
  pointer-events: auto;
  overflow: visible;
  transition: width 0.32s ease;
}

.site-header__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--menu-background-color, var(--crema));
  border: 3px double var(--menu-border-color, #999);
  pointer-events: none;
  transition: inset 0.32s ease;
}

@media (hover: hover) {
  .site-header:not(.is-open) .site-header__panel:hover::before {
    inset: calc(var(--site-header-panel-hover-expand) * -1);
  }
}

.site-header.is-open .site-header__panel {
  width: min(100%, var(--site-header-panel-width-open));
  overflow: hidden;
}

.site-header.is-open .site-header__panel::before {
  inset: 0;
}

.site-header.is-over-hero-frosted .site-header__panel::before {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(20px);
  border-color: var(--menu-border-color, #999);
}

.site-header__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  box-sizing: border-box;
  height: var(--site-header-bar-height);
  padding: 0;
  transition:
    padding 0.32s ease,
    height 0.32s ease;
}

.site-header__bar--interactive {
  cursor: pointer;
}

.site-header.is-open .site-header__bar {
  padding: 12px;
  height: calc(var(--site-header-bar-height) + 24px);
}

.site-header__leading {
  display: flex;
  align-items: center;
  justify-self: start;
  min-width: 0;
}

.site-header__page-name-wrap {
  justify-self: center;
  max-width: 100%;
  overflow: hidden;
  line-height: 1.2;
}

.site-header__page-name {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
}

.site-header:not(.is-open) .site-header__page-name-wrap {
  pointer-events: none;
}

.site-header.is-cart-open .site-header__page-name-wrap {
  pointer-events: auto;
  cursor: pointer;
}

.site-header__page-name-char {
  display: inline-block;
  will-change: transform;
}

.site-header__page-name--link {
  color: inherit;
  text-decoration: none;
}

.site-header.is-open .site-header__page-name--link {
  pointer-events: none;
}

.site-header__page-name--link:hover {
  color: var(--menu-highlight-color, var(--arancio));
}

.site-header__toggle {
  width: auto;
  height: var(--site-header-bar-height);
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 14px 20px;
  flex-shrink: 0;
}

.site-header__toggle-icon {
  --hamburger-width: 20px;
  --hamburger-line: 1px;
  --hamburger-gap: 5px;
  --hamburger-gap-hover: 7px;
  position: relative;
  width: var(--hamburger-width);
  height: calc(var(--hamburger-line) * 2 + var(--hamburger-gap));
  display: block;
  transition: height 0.32s ease;
}

.site-header__toggle-icon::before,
.site-header__toggle-icon::after {
  content: '';
  position: absolute;
  left: 0;
  height: var(--hamburger-line);
  background: currentColor;
  transform-origin: center;
  transition:
    transform 0.32s ease,
    top 0.32s ease,
    width 0.32s ease;
}

.site-header__toggle-icon::before {
  top: 0;
  width: var(--hamburger-width);
}

.site-header__toggle-icon::after {
  top: calc(var(--hamburger-line) + var(--hamburger-gap));
  width: calc(var(--hamburger-width) * 0.8);
}

@media (hover: hover) {
  .site-header:not(.is-open) .site-header__panel:hover .site-header__toggle-icon:not(.is-open),
  .site-header__toggle:hover .site-header__toggle-icon:not(.is-open) {
    height: calc(var(--hamburger-line) * 2 + var(--hamburger-gap-hover));
  }

  .site-header:not(.is-open) .site-header__panel:hover .site-header__toggle-icon:not(.is-open)::before,
  .site-header:not(.is-open) .site-header__panel:hover .site-header__toggle-icon:not(.is-open)::after,
  .site-header__toggle:hover .site-header__toggle-icon:not(.is-open)::before,
  .site-header__toggle:hover .site-header__toggle-icon:not(.is-open)::after {
    width: var(--hamburger-width);
  }

  .site-header:not(.is-open) .site-header__panel:hover .site-header__toggle-icon:not(.is-open)::after,
  .site-header__toggle:hover .site-header__toggle-icon:not(.is-open)::after {
    top: calc(var(--hamburger-line) + var(--hamburger-gap-hover));
  }
}

.site-header__toggle-icon.is-open::before,
.site-header__toggle-icon.is-open::after {
  top: calc((var(--hamburger-line) + var(--hamburger-gap)) / 2);
  width: var(--hamburger-width);
  transition:
    transform 0.32s ease,
    top 0.32s ease,
    width 0.32s ease;
}

.site-header__toggle-icon.is-open::before {
  transform: rotate(45deg);
}

.site-header__toggle-icon.is-open::after {
  transform: rotate(-45deg);
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-end;
  justify-self: end;
  flex-shrink: 0;
}

.site-header__cart {
  position: relative;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--basket-icon-color, currentColor);
  cursor: pointer;
  padding: 14px;
  margin: 0;
  line-height: 0;
}

.site-header__cart-icon {
  display: block;
  width: 22px;
  height: 22px;
}

.site-header__cart-count {
  position: absolute;
  top: 12px;
  right: 9px;
  min-width: 13px;
  height: 13px;
  line-height: 9px;
  padding: 0 0.1rem;
  /* border-radius: 30px; */
  background: var(--menu-text-color);
  color: var(--menu-background-color);
  font-size: 9px;
  line-height: 0.85rem;
  text-align: center;
}

.site-header.is-over-hero-frosted .site-header__cart-count {
  color: #111010;
}

.site-header.is-over-hero-frosted :deep(.cart-panel__checkout) {
 
  color: #111010;
}

.site-header__nav {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 0.32s ease,
    padding-top 0.32s ease;
  padding-top: var(--site-header-bar-height);
}

.site-header.is-open .site-header__nav {
  grid-template-rows: 1fr;
  padding-top: calc(var(--site-header-bar-height) + 24px);
}

.site-header__nav-inner {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
}

.site-header.is-open .site-header__nav-inner {
  padding: 10px 47px 35px;
  gap: 40px;
}

.site-header__list {
  list-style: none;
  margin: 0;
  padding: 0.35rem 0 0.35rem;
}

.site-header__item,
.site-header__subitem {
  opacity: 0;
}

.site-header__item :deep(.site-header__link),
.site-header__item :deep(.menu-link) {
  display: flex;
  align-items: center;
  min-height: 3.5rem;
  padding: 0;
  font-family: var(--serif);
  font-size: clamp(28px, 7.2vw, 36px);
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  line-height: 1;
  transition: color 0.2s ease;
}

.site-header__item :deep(.site-header__link:hover),
.site-header__item :deep(.menu-link:hover),
.site-header__item :deep(.menu-link.is-current) {
  color: var(--menu-highlight-color, var(--arancio));
}

.site-header__item :deep(.menu-link__underline) {
  display: none;
}

.site-header__sublist {
  list-style: none;
  margin: 0;
  padding: 1.65rem 0 0;
}

.site-header__subitem :deep(.site-header__sublink),
.site-header__subitem :deep(.menu-link),
.site-header__subitem .site-header__sublink {
  display: flex;
  align-items: center;
  min-height: 2rem;
  padding: 0;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  line-height: 1.2;
  transition: color 0.2s ease;
}

.site-header__subitem :deep(.site-header__sublink:hover),
.site-header__subitem :deep(.menu-link:hover),
.site-header__subitem :deep(.menu-link.is-current) {
  color: var(--menu-highlight-color, var(--arancio));
}

.site-header__subitem :deep(.menu-link__underline) {
  display: none;
}

.site-header__subitem--copyright .site-header__sublink {
  cursor: default;
}

.site-header__subitem--copyright .site-header__sublink:hover {
  color: inherit;
}
</style>
