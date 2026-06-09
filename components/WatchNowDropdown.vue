<script setup lang="ts">
import { streamingLinks } from '~/data/site'

const open = ref(false)

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'right'
    fullWidth?: boolean
  }>(),
  { align: 'left', fullWidth: false },
)
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="btn-primary"
      :class="props.fullWidth ? 'w-full justify-center' : ''"
      @click="open = !open"
    >
      Watch Now
    </button>
    <div
      v-if="open"
      class="absolute top-full z-10 mt-2 min-w-[220px] border-2 border-wire-border bg-white py-2"
      :class="align === 'right' ? 'right-0' : 'left-0'"
    >
      <a
        v-for="link in streamingLinks"
        :key="link"
        href="#"
        class="block px-5 py-3 text-sm font-medium text-wire-muted transition-colors hover:bg-stone-50 hover:text-wire-ink"
      >
        {{ link }}
      </a>
    </div>
  </div>
</template>
