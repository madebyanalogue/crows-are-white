<script setup lang="ts">
import { navItems } from '~/data/site'

const route = useRoute()
const menuOpen = ref(false)
const shareOpen = ref(false)
const { count } = useCart()

function closeMenu() {
  menuOpen.value = false
}

watch(() => route.path, closeMenu)
</script>

<template>
  <header class="sticky top-0 z-50 border-b-2 border-wire-border bg-white">
    <div class="nav-wrap flex h-20 items-center gap-6">
      <button
        type="button"
        class="p-2 text-wire-muted transition-colors hover:text-wire-ink lg:hidden"
        aria-label="Open menu"
        @click="menuOpen = true"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <NuxtLink to="/" class="shrink-0 text-base font-semibold tracking-[0.12em] uppercase text-wire-ink md:text-lg">
        Crows Are White
      </NuxtLink>

      <nav class="ml-4 hidden flex-1 items-center gap-2 lg:flex" aria-label="Main">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-4 py-2.5 text-sm font-medium text-wire-muted transition-colors hover:text-wire-ink"
          active-class="!text-wire-ink underline decoration-2 underline-offset-8"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="p-2.5 text-wire-muted transition-colors hover:text-wire-ink"
          aria-label="Share"
          @click="shareOpen = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <a href="#" class="p-2.5 text-wire-muted transition-colors hover:text-wire-ink" aria-label="Instagram">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke-width="2" />
            <circle cx="12" cy="12" r="3.5" stroke-width="2" />
          </svg>
        </a>

        <NuxtLink
          to="/shop/cart"
          class="relative p-2.5 text-wire-muted transition-colors hover:text-wire-ink"
          aria-label="Cart"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 9m10-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span
            v-if="count > 0"
            class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center bg-wire-ink px-1 text-[10px] font-bold text-white"
          >
            {{ count }}
          </span>
        </NuxtLink>

        <div class="hidden items-center gap-3 sm:flex">
          <WatchNowDropdown align="right" />
          <NuxtLink to="/tickets" class="btn-secondary">Get Tickets</NuxtLink>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="menuOpen" class="fixed inset-0 z-[60] lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="closeMenu" />
        <nav class="absolute left-0 top-0 flex h-full w-80 flex-col border-r-2 border-wire-border bg-white p-8">
          <div class="mb-10 flex items-center justify-between">
            <span class="label-caps">Menu</span>
            <button type="button" class="text-3xl leading-none text-wire-muted" @click="closeMenu">&times;</button>
          </div>
          <ul class="space-y-2">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="block px-4 py-3.5 text-base font-medium text-wire-muted transition-colors hover:bg-stone-50 hover:text-wire-ink"
                active-class="!text-wire-ink bg-stone-50"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-auto space-y-3 border-t-2 border-wire-border pt-8">
            <WatchNowDropdown full-width />
            <NuxtLink to="/tickets" class="btn-secondary w-full justify-center" @click="closeMenu">
              Get Tickets
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="shareOpen" class="modal-overlay" @click.self="shareOpen = false">
        <div class="modal-panel max-w-md">
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-2xl font-semibold">Share</h2>
            <button type="button" class="text-2xl text-wire-muted" @click="shareOpen = false">&times;</button>
          </div>
          <p class="mb-6 text-wire-muted">Reference: hundredsofbeavers.com share pattern</p>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="btn-secondary text-xs">Copy Link</button>
            <button type="button" class="btn-secondary text-xs">Share on X</button>
            <button type="button" class="btn-secondary text-xs">Facebook</button>
            <button type="button" class="btn-secondary text-xs">Email</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>
