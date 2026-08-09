<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Stay with the Story',
  },
  intro: {
    type: String,
    default: '',
  },
  submitLabel: {
    type: String,
    default: 'Stay in Touch',
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
  Boolean(props.background?.imageUrl || props.background?.videoUrl || props.background?.loop),
)

const introParagraphs = computed(() => {
  const text = props.intro?.trim() || ''
  if (!text) return []
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
})

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
    :aria-label="title"
  >
    <div
      v-if="hasMedia"
      class="newsletter-block__media-wrap"
    >
      <video
        v-if="background?.loop"
        class="newsletter-block__media"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
      >
        <source
          v-if="background.loop.url1080 && background.loop.url1080 !== background.loop.url720"
          media="(min-width: 1000px)"
          :src="background.loop.url1080"
          type="video/mp4"
        >
        <source
          :src="background.loop.url720 || background.loop.url"
          type="video/mp4"
        >
      </video>
      <video
        v-else-if="background?.videoUrl"
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
        class="newsletter-block__overlay"
        aria-hidden="true"
      />

      <div class="newsletter-block__panel">
        <h2 class="newsletter-block__panel-title serif">
          {{ title }}
        </h2>

        <div
          v-if="introParagraphs.length"
          class="newsletter-block__intro"
        >
          <p
            v-for="(paragraph, index) in introParagraphs"
            :key="index"
            class="newsletter-block__intro-paragraph serif"
          >
            {{ paragraph }}
          </p>
        </div>

        <form
          v-if="!submitted"
          class="newsletter-block__form newsletter-block__form--overlay"
          :action="mailchimpAction || undefined"
          method="post"
          target="_blank"
          @submit="onSubmit"
        >
          <div class="newsletter-block__field">
            <label
              class="newsletter-block__label serif"
              for="newsletter-block-email-overlay"
            >
              Email address
            </label>
            <input
              id="newsletter-block-email-overlay"
              v-model="email"
              class="newsletter-block__input serif"
              type="email"
              name="EMAIL"
              required
              autocomplete="email"
            >
          </div>
          <button
            type="submit"
            class="newsletter-block__submit serif"
            :disabled="!mailchimpAction"
          >
            {{ submitLabel }}
          </button>
        </form>

        <p
          v-else
          class="newsletter-block__thanks serif"
        >
          Thanks — check your inbox to confirm.
        </p>
      </div>
    </div>

    <template v-else>
      <h2 class="newsletter-block__title serif">
        {{ title }}
      </h2>

      <div
        v-if="introParagraphs.length"
        class="newsletter-block__intro"
      >
        <p
          v-for="(paragraph, index) in introParagraphs"
          :key="index"
          class="newsletter-block__intro-paragraph serif"
        >
          {{ paragraph }}
        </p>
      </div>

      <form
        v-if="!submitted"
        class="newsletter-block__form"
        :action="mailchimpAction || undefined"
        method="post"
        target="_blank"
        @submit="onSubmit"
      >
        <div class="newsletter-block__field">
          <label
            class="newsletter-block__label serif"
            for="newsletter-block-email"
          >
            Email address
          </label>
          <input
            id="newsletter-block-email"
            v-model="email"
            class="newsletter-block__input serif"
            type="email"
            name="EMAIL"
            required
            autocomplete="email"
          >
        </div>
        <button
          type="submit"
          class="newsletter-block__submit serif"
          :disabled="!mailchimpAction"
        >
          {{ submitLabel }}
        </button>
      </form>

      <p
        v-else
        class="newsletter-block__thanks serif"
      >
        Thanks — check your inbox to confirm.
      </p>
    </template>
  </section>
</template>

<style scoped>
.newsletter-block {
  --newsletter-ink: currentColor;
  --newsletter-overlay: 0;
  position: relative;
  isolation: isolate;
  color: var(--newsletter-ink);
}

.newsletter-block:not(.has-background) {
  padding: clamp(3.5rem, 10vw, 7rem) clamp(1.25rem, 4vw, 3rem) clamp(4rem, 12vw, 8rem);
}

.newsletter-block.is-light {
  --newsletter-ink: #fff;
}

.newsletter-block__media-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 2.5;
  min-height: clamp(420px, 60vh, 760px);
  overflow: hidden;
}

.newsletter-block__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Scrim tinted away from the text colour so the copy stays legible. */
.newsletter-block__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #fff;
  opacity: var(--newsletter-overlay);
  pointer-events: none;
}

.newsletter-block.is-light .newsletter-block__overlay {
  background: #000;
}

.newsletter-block__panel {
  position: relative;
  z-index: 2;
  width: min(100%, 34rem);
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--background-color);
  --newsletter-ink: var(--text-color);
}

.newsletter-block__panel-title {
  margin: 0 0 clamp(0.85rem, 2vw, 1.25rem);
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 400;
  line-height: 1.15;
}

.newsletter-block__intro {
  display: grid;
  gap: 0.85em;
  margin: 0 0 clamp(1rem, 2.5vw, 1.5rem);
}

.newsletter-block__panel .newsletter-block__intro-paragraph {
  font-size: clamp(0.875rem, 1.35vw, 1rem);
  line-height: 1.45;
}

.newsletter-block__intro-paragraph {
  margin: 0;
  font-size: clamp(0.875rem, 1.35vw, 1rem);
  line-height: 1.45;
}

.newsletter-block__title {
  margin: 0 0 clamp(1rem, 2.5vw, 1.5rem);
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 400;
  line-height: 1.15;
}

.newsletter-block__form {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 1rem;
  width: 100%;
}

.newsletter-block__form--overlay {
  gap: 0.75rem;
}

.newsletter-block__field {
  position: relative;
  min-width: 0;
}

.newsletter-block__label {
  display: block;
  margin-bottom: 0.65rem;
  font-size: clamp(0.8125rem, 1.2vw, 0.9375rem);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.newsletter-block__form:not(.newsletter-block__form--overlay) .newsletter-block__label {
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  text-transform: none;
  letter-spacing: 0;
}

.newsletter-block__input {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0 0 0.85rem;
  border: 0;
  border-bottom: 1px solid var(--newsletter-ink);
  background: transparent;
  color: var(--newsletter-ink);
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  line-height: 1;
  outline: none;
}

.newsletter-block__form--overlay .newsletter-block__label {
  font-size: clamp(0.8125rem, 1.2vw, 0.9375rem);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.newsletter-block__form--overlay .newsletter-block__input {
  padding-bottom: 0.65rem;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  text-transform: none;
  letter-spacing: 0;
}

.newsletter-block__form--overlay .newsletter-block__submit {
  padding-bottom: 0.55rem;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
}

.newsletter-block__submit {
  margin: 0;
  padding: 0 0 0.55rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
}

.newsletter-block__submit:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.newsletter-block__submit:hover {
  opacity: 0.7;
}

.newsletter-block__thanks {
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
}

.newsletter-block__panel .newsletter-block__thanks {
  font-size: clamp(0.8125rem, 1.2vw, 0.9375rem);
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
