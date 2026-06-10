<script setup lang="ts">
import { navItems, siteConfig } from '~/data/site'

const route = useRoute()
const menuOpen = ref(false)
const { count } = useCart()

function closeMenu() {
  menuOpen.value = false
}

watch(() => route.path, closeMenu)
</script>

<template>
  <header class="sticky top-0 z-50 border-b-2 border-wire-border bg-white">
    <div class="nav-wrap relative flex h-20 items-center">
      <div class="flex items-center gap-4">
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
      </div>

      <nav class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex" aria-label="Main">
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
          <svg class="h-[22px] w-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
            />
          </svg>
          <span
            v-if="count > 0"
            class="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wire-ink px-1 text-[10px] font-semibold leading-none text-white"
          >
            {{ count }}
          </span>
        </NuxtLink>

        <div class="hidden items-center gap-3 sm:flex">
          <WatchNowDropdown align="right" />
          <NuxtLink v-if="siteConfig.theatricalReleaseActive" to="/tickets" class="btn-secondary">
            Get Tickets
          </NuxtLink>
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
                @click="closeMenu"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-auto space-y-3 border-t-2 border-wire-border pt-8">
            <WatchNowDropdown full-width />
            <NuxtLink
              v-if="siteConfig.theatricalReleaseActive"
              to="/tickets"
              class="btn-secondary w-full justify-center"
              @click="closeMenu"
            >
              Get Tickets
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Teleport>
  </header>
</template>
