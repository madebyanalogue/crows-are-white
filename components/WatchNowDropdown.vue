<script setup lang="ts">
import { streamingLinks } from '~/data/site'

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'right'
    fullWidth?: boolean
  }>(),
  { align: 'left', fullWidth: false },
)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    close()
  }
}

watch(open, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      document.addEventListener('click', onClickOutside)
    } else {
      document.removeEventListener('click', onClickOutside)
    }
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
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="btn-primary gap-2"
      :class="props.fullWidth ? 'w-full justify-center' : ''"
      aria-haspopup="true"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      Watch Now
      <svg
        class="h-4 w-4 transition-transform"
        :class="open ? 'rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute top-full z-20 mt-2 w-72 border-2 border-wire-border bg-white py-2 shadow-lg"
      :class="align === 'right' ? 'right-0' : 'left-0'"
      role="menu"
    >
      <template v-for="link in streamingLinks" :key="link.label">
        <NuxtLink
          v-if="!isExternal(link.href)"
          :to="link.href"
          class="watch-now-item"
          :class="link.featured ? 'watch-now-item--featured' : ''"
          role="menuitem"
          @click="close"
        >
          {{ link.label }}
        </NuxtLink>
        <a
          v-else
          :href="link.href"
          target="_blank"
          rel="noopener"
          class="watch-now-item"
          role="menuitem"
          @click="close"
        >
          {{ link.label }}
        </a>
      </template>
    </div>
  </div>
</template>

<style scoped>
.watch-now-item {
  @apply block px-5 py-3 text-sm font-medium text-wire-muted transition-colors hover:bg-stone-50 hover:text-wire-ink;
}

.watch-now-item--featured {
  @apply border-b-2 border-wire-border font-semibold text-wire-ink;
}
</style>
