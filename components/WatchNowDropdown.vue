<script setup lang="ts">
const { watchNowDropdown } = useSiteSettings()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function toggle(e: Event) {
  e.stopPropagation()
  open.value = !open.value
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    close()
  }
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.addEventListener('click', onClickOutside)
  } else {
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', onClickOutside)
  }
})

function isExternal(href: string) {
  return href.startsWith('http')
}

const buttonLabel = computed(() => watchNowDropdown.value?.buttonLabel || 'Watch Now')
const platformsLabel = computed(() => watchNowDropdown.value?.platformsLabel || 'Also available on')
const featuredLink = computed(() => {
  const link = watchNowDropdown.value?.featuredLink
  if (!link?.label || !link?.href) return null
  return link
})
const platforms = computed(() => watchNowDropdown.value?.platforms || [])
const hasMenuContent = computed(() => Boolean(featuredLink.value) || platforms.value.length > 0)
</script>

<template>
  <div
    v-if="hasMenuContent"
    ref="root"
    class="watch-menu"
    :class="{'watch-menu--open': open}"
  >
    <button
      type="button"
      class="watch-menu__btn"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      {{ buttonLabel }}
      <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div class="watch-menu__panel" role="menu">
      <NuxtLink
        v-if="featuredLink && !isExternal(featuredLink.href)"
        :to="featuredLink.href"
        class="watch-menu__featured"
        role="menuitem"
        @click="close"
      >
        {{ featuredLink.label }}
      </NuxtLink>
      <a
        v-else-if="featuredLink"
        :href="featuredLink.href"
        class="watch-menu__featured"
        target="_blank"
        rel="noopener"
        role="menuitem"
        @click="close"
      >
        {{ featuredLink.label }}
      </a>

      <div v-if="platforms.length" class="watch-menu__section">
        <span class="watch-menu__section-label">{{ platformsLabel }}</span>
      </div>

      <template v-for="link in platforms" :key="link.label">
        <NuxtLink
          v-if="!isExternal(link.href)"
          :to="link.href"
          class="watch-menu__link"
          role="menuitem"
          @click="close"
        >
          {{ link.label }}
        </NuxtLink>
        <a
          v-else
          :href="link.href"
          class="watch-menu__link"
          target="_blank"
          rel="noopener"
          role="menuitem"
          @click="close"
        >
          {{ link.label }}
        </a>
      </template>
    </div>
  </div>
</template>
