<script setup lang="ts">
import { navItems } from '~/data/site'
</script>

<template>
  <footer class="mt-auto border-t-2 border-wire-border bg-white">
    <div class="nav-wrap py-16 md:py-24">
      <div class="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
        <div class="lg:col-span-1">
          <p class="text-lg font-semibold tracking-[0.1em] uppercase">Crows Are White</p>
          <p class="mt-5 text-base leading-relaxed text-wire-muted">
            Documentary · 2022 · Directed by Ahsen Nadeem
          </p>
          <a
            href="https://www.imdb.com/title/tt10332620/"
            target="_blank"
            rel="noopener"
            class="mt-4 inline-block text-sm font-semibold text-wire-ink underline underline-offset-4"
          >
            IMDb tt10332620
          </a>
        </div>

        <div>
          <p class="label-caps mb-6">Explore</p>
          <ul class="space-y-4">
            <li v-for="item in navItems.slice(0, 6)" :key="item.to">
              <NuxtLink :to="item.to" class="text-base text-wire-muted transition-colors hover:text-wire-ink">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="label-caps mb-6">Connect</p>
          <ul class="space-y-4 text-base text-wire-muted">
            <li><a href="#" class="transition-colors hover:text-wire-ink">Instagram</a></li>
            <li><NuxtLink to="/contact" class="transition-colors hover:text-wire-ink">Contact</NuxtLink></li>
            <li><NuxtLink to="/book-a-screening" class="transition-colors hover:text-wire-ink">Book a Screening</NuxtLink></li>
          </ul>
        </div>

        <div>
          <p class="label-caps mb-6">Legals &amp; Credits</p>
          <ul class="space-y-4 text-base text-wire-muted">
            <li><NuxtLink to="/legals" class="transition-colors hover:text-wire-ink">Privacy Policy</NuxtLink></li>
            <li><NuxtLink to="/legals" class="transition-colors hover:text-wire-ink">Terms of Use</NuxtLink></li>
            <li><NuxtLink to="/legals" class="transition-colors hover:text-wire-ink">Credits</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-wire-border pt-8 text-sm text-wire-muted">
        <span>Wireframe preview — not the final site</span>
        <span>© Crows Are White</span>
      </div>
    </div>
  </footer>
</template>
