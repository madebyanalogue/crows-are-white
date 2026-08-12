<template>
  <NuxtLink
    ref="linkRef"
    :to="getMenuItemUrl(item)"
    :target="getMenuItemTarget(item)"
    :rel="getMenuItemRel(item)"
    class="menu-link"
    :class="[
      linkClass,
      {
        'is-current': isCurrentPage(item),
        'is-button': item.isButton,
      },
    ]"
    @click="onLinkClick"
  >
    <div
      class="menu-link__content"
      :class="{ 'menu-link__content--button': item.isButton }"
    >
      <div class="menu-link__label">
        <span class="menu-link__text">{{ item.text }}</span>
        <div class="menu-link__underline" aria-hidden="true">
          <div class="menu-link__underline-base" />
          <div ref="hoverLineRef" class="menu-link__underline-hover" />
        </div>
      </div>
      <LinkArrow v-if="showArrow" :variant="arrowVariant" />
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  linkClass: {
    type: [String, Object, Array],
    default: '',
  },
  showArrow: {
    type: Boolean,
    default: undefined,
  },
  arrowVariant: {
    type: String,
    default: 'rotate',
    validator: (value) => ['rotate', 'scale'].includes(value),
  },
})

const showArrow = computed(() => props.showArrow ?? Boolean(props.item.isButton))

const emit = defineEmits(['click'])

const linkRef = ref(null)
const hoverLineRef = ref(null)

const {
  getMenuItemUrl,
  getMenuItemTarget,
  getMenuItemRel,
  isCurrentPage,
  isSamePageLink,
  isSamePageHref,
  isShopFilterHref,
  navigateInternalHref,
  getUrlHash,
  scrollToTop,
  scrollToHash,
} = useMenuLinks()

function onLinkClick(event) {
  const href = getMenuItemUrl(props.item)
  const hash = getUrlHash(href)

  if (href.startsWith('#')) {
    event.preventDefault()
    scrollToHash(href)
    emit('click', event)
    return
  }

  if (hash && isSamePageHref(href)) {
    event.preventDefault()
    scrollToHash(hash)
    emit('click', event)
    return
  }

  if (isShopFilterHref(href) && !isSamePageHref(href)) {
    event.preventDefault()
    navigateInternalHref(href, { replace: true })
    scrollToTop({ smooth: false })
    emit('click', event)
    return
  }

  if (isSamePageLink(props.item)) {
    event.preventDefault()
    scrollToTop()
  }

  emit('click', event)
}

useMenuLinkUnderline(linkRef, hoverLineRef)
</script>

<style scoped>
.menu-link {
  opacity: 1;
  line-height: var(--underline-link-line-height);
  transition: opacity 0.3s ease-out;
  display:block;
  padding: .35em 0;
  line-height: 1.2;
  letter-spacing: 0.02em;
}
.menu-link-group li:last-child .menu-link {
  padding-bottom: 0;
}

.menu-link__content--button {
  display: flex;
  align-items: center;
  gap: .5em;
}

.menu-link__label {
  display: inline-block;
  position: relative;
}

.menu-link__content--button:has(.link-arrow) .menu-link__label {
  width: max-content;
}

.menu-link:hover :deep(.link-arrow:not(.link-arrow--scale)) {
  transform: rotate(0) translate(0.2em, 0.1em);
}

.menu-link:hover :deep(.link-arrow--scale) {
  transform: scale(1);
}

.menu-link__text {
  display: inline-block;
  transition: transform 0.5s ease;
}

.menu-link:hover .menu-link__text {
  transform: translateY(-0px);
}

.menu-link__underline {
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 1px;
  pointer-events: none;
}

.menu-link__underline-base,
.menu-link__underline-hover {
  position: absolute;
  inset: 0;
  background-color: currentColor;
}

.menu-link__underline-base {
  opacity: 0;
}

.menu-link.is-button .menu-link__underline-base,
.menu-link.menu-link--underline .menu-link__underline-base {
  opacity: 0.2;
}

.menu-link__underline-hover {
  z-index: 1;
  transform: scale(0, 1);
  transform-origin: 0% 50%;
  will-change: transform;
}
</style>
