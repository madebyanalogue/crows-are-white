<script setup lang="ts">
import { siteConfig } from '~/data/site'

const submitted = ref(false)

function onSubmit() {
  submitted.value = true
}
</script>

<template>
  <div>
    <p class="label-caps mb-4">Newsletter</p>
    <p class="mb-5 text-sm leading-relaxed text-wire-muted">
      Screening updates, streaming news, and merch drops.
    </p>

    <form
      v-if="!submitted"
      :action="siteConfig.mailchimpAction"
      method="post"
      target="_blank"
      class="relative space-y-3"
      @submit="onSubmit"
    >
      <label class="sr-only" for="footer-newsletter-email">Email address</label>
      <input
        id="footer-newsletter-email"
        type="email"
        name="EMAIL"
        required
        placeholder="Email address"
        class="input-wire"
      />
      <div aria-hidden="true" class="absolute -left-[5000px]">
        <input type="text" name="b_PLACEHOLDER_PLACEHOLDER" tabindex="-1" value="" />
      </div>
      <button type="submit" class="btn-primary w-full justify-center">
        Subscribe
      </button>
    </form>

    <p v-else class="text-sm font-medium text-wire-ink">
      Thanks — check your inbox to confirm.
    </p>
  </div>
</template>
