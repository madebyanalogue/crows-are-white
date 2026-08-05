<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Newsletter',
  },
  // { imageUrl, videoUrl, alt, textColor: 'dark' | 'light', overlayOpacity }
  background: {
    type: Object,
    default: null,
  },
})

const {mailchimpAction} = useSiteSettings()
const submitted = ref(false)
const email = ref('')

const hasMedia = computed(() =>
  Boolean(props.background?.imageUrl || props.background?.videoUrl),
)

function onSubmit() {
  submitted.value = true
}
</script>

<template>
  <section
    class="newsletter-block"
    :class="{
      'has-background': hasMedia,
      'is-light': background?.textColor === 'light',
    }"
    :style="hasMedia ? {'--newsletter-overlay': background.overlayOpacity} : null"
    aria-label="Newsletter"
  >
    <video
      v-if="background?.videoUrl"
      class="newsletter-block__media"
      :src="background.videoUrl"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      aria-hidden="true"
    />
    <img
      v-else-if="background?.imageUrl"
      class="newsletter-block__media"
      :src="background.imageUrl"
      :alt="background.alt"
      draggable="false"
    >
    <div
      v-if="hasMedia"
      class="newsletter-block__overlay"
      aria-hidden="true"
    />

    <h2 class="newsletter-block__title handwritten">
      {{ title }}
    </h2>

    <form
      v-if="!submitted"
      class="newsletter-block__form"
      :action="mailchimpAction || undefined"
      method="post"
      target="_blank"
      @submit="onSubmit"
    >
      <div class="newsletter-block__field">
        <span
          class="newsletter-block__label serif"
          :class="{ 'is-hidden': email }"
          aria-hidden="true"
        >
          Email address
        </span>
        <input
          v-model="email"
          class="newsletter-block__input serif"
          type="email"
          name="EMAIL"
          required
          autocomplete="email"
          aria-label="Email address"
        >
      </div>
      <button
        type="submit"
        class="newsletter-block__submit handwritten"
      >
        submit
      </button>
    </form>

    <p
      v-else
      class="newsletter-block__thanks serif"
    >
      Thanks — check your inbox to confirm.
    </p>
  </section>
</template>

<style scoped>
.newsletter-block {
  --newsletter-ink: currentColor;
  --newsletter-overlay: 0;
  position: relative;
  isolation: isolate;
  padding: clamp(3.5rem, 10vw, 7rem) clamp(1.25rem, 4vw, 3rem) clamp(4rem, 12vw, 8rem);
  color: var(--newsletter-ink);
}

.newsletter-block.has-background {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: clamp(420px, 60vh, 760px);
  overflow: hidden;
}

.newsletter-block.is-light {
  --newsletter-ink: #fff;
}

.newsletter-block__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Scrim tinted away from the text colour so the copy stays legible. */
.newsletter-block__overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: #fff;
  opacity: var(--newsletter-overlay);
  pointer-events: none;
}

.newsletter-block.is-light .newsletter-block__overlay {
  background: #000;
}

.newsletter-block__title {
  margin: 0 0 clamp(1.5rem, 4vw, 2.5rem);
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  font-weight: 400;
  line-height: 0.9;
}

.newsletter-block__form {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 1rem;
  width: 100%;
}

.newsletter-block__field {
  position: relative;
  min-width: 0;
  border-bottom: 1px solid var(--newsletter-ink);
}

.newsletter-block__label {
  display: block;
  padding-bottom: 0.85rem;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  line-height: 1;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.newsletter-block__label.is-hidden {
  opacity: 0;
}

.newsletter-block__input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  padding: 0 0 0.85rem;
  border: 0;
  background: transparent;
  color: var(--newsletter-ink);
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  line-height: 1;
  outline: none;
}

.newsletter-block__submit {
  margin: 0;
  padding: 0 0 0.55rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
}

.newsletter-block__submit:hover {
  opacity: 0.7;
}

.newsletter-block__thanks {
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
}

@media (max-width: 699px) {
  .newsletter-block__form {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .newsletter-block__submit {
    justify-self: end;
  }
}
</style>
