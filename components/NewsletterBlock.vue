<script setup>
import { REFLECTION_COUNTRIES } from '~/utils/reflections'

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
  layout: {
    type: String,
    default: 'overlay',
    validator: (value) => ['overlay', 'split', 'map'].includes(value),
  },
})

const { mailchimpAction } = useSiteSettings()
const submitted = ref(false)
const email = ref('')
const city = ref('')
const country = ref('')
const leaveReflection = ref(false)

const hasMedia = computed(() =>
  Boolean(props.background?.imageUrl || props.background?.videoUrl || props.background?.loop),
)

const isSplitLayout = computed(() => props.layout === 'split' && hasMedia.value)
const isMapLayout = computed(() => props.layout === 'map')

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
      'has-background': hasMedia && !isSplitLayout && !isMapLayout,
      'is-light': !isSplitLayout && !isMapLayout && background?.textColor === 'light',
      'newsletter-block--split': isSplitLayout,
      'newsletter-block--map': isMapLayout,
    }"
    :style="hasMedia && !isSplitLayout && !isMapLayout ? {'--newsletter-overlay': background.overlayOpacity} : null"
    :aria-label="title"
  >
    <div
      v-if="isMapLayout"
      class="newsletter-block__map"
    >
      <div class="newsletter-block__content">
        <h2 class="newsletter-block__title h3 serif light">
          {{ title }}
        </h2>

        <div
          v-if="introParagraphs.length"
          class="newsletter-block__intro"
        >
          <p
            v-for="(paragraph, index) in introParagraphs"
            :key="index"
            class="newsletter-block__intro-paragraph serif light"
          >
            {{ paragraph }}
          </p>
        </div>

        <form
          v-if="!submitted"
          class="newsletter-block__form newsletter-block__form--stacked"
          :action="mailchimpAction || undefined"
          method="post"
          target="_blank"
          @submit="onSubmit"
        >
          <div class="newsletter-block__field">
            <label
              class="newsletter-block__label serif"
              for="newsletter-block-email-map"
            >
              Email address
            </label>
            <input
              id="newsletter-block-email-map"
              v-model="email"
              class="newsletter-block__input serif"
              type="email"
              name="EMAIL"
              required
              autocomplete="email"
            >
          </div>

          <fieldset class="newsletter-block__fieldset">
            <legend class="newsletter-block__legend serif">
              Where are you watching from?
            </legend>

            <div class="newsletter-block__field">
              <label
                class="newsletter-block__label serif"
                for="newsletter-block-city-map"
              >
                City
              </label>
              <input
                id="newsletter-block-city-map"
                v-model="city"
                class="newsletter-block__input serif"
                type="text"
                maxlength="80"
                autocomplete="address-level2"
              >
            </div>

            <div class="newsletter-block__field">
              <label
                class="newsletter-block__label serif"
                for="newsletter-block-country-map"
              >
                Country
                <span
                  v-if="city.trim()"
                  class="newsletter-block__label-note"
                >(required if city is entered)</span>
              </label>
              <select
                id="newsletter-block-country-map"
                v-model="country"
                class="newsletter-block__select serif"
                :required="Boolean(city.trim())"
              >
                <option value="">
                  Select a country
                </option>
                <option
                  v-for="countryOption in REFLECTION_COUNTRIES"
                  :key="countryOption"
                  :value="countryOption"
                >
                  {{ countryOption }}
                </option>
              </select>
            </div>
          </fieldset>

          <label class="newsletter-block__checkbox serif">
            <input
              v-model="leaveReflection"
              class="newsletter-block__checkbox-input"
              type="checkbox"
            >
            <span>Leave a reflection</span>
          </label>

          <button
            type="submit"
            class="newsletter-block__submit newsletter-block__submit--stacked serif"
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

      <div class="newsletter-block__map-col">
        <slot name="map" />
      </div>
    </div>

    <div
      v-else-if="isSplitLayout"
      class="newsletter-block__split"
    >
      <div class="newsletter-block__content">
        <h2 class="newsletter-block__title h3 serif light">
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
              for="newsletter-block-email-split"
            >
              Email address
            </label>
            <input
              id="newsletter-block-email-split"
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

      <div class="newsletter-block__media-col">
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
      </div>
    </div>

    <div
      v-else-if="hasMedia"
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
      <h2 class="newsletter-block__title h3 serif light">
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

.newsletter-block:not(.has-background):not(.newsletter-block--split):not(.newsletter-block--map) {
  padding: clamp(3.5rem, 10vw, 7rem) clamp(1.25rem, 4vw, 3rem) clamp(4rem, 12vw, 8rem);
}

.newsletter-block--split,
.newsletter-block--map {
  width: 100%;
}

.newsletter-block__split,
.newsletter-block__map {
  display: grid;
  align-items: start;
  gap: clamp(1.5rem, 4vw, 3rem);
  width: 100%;
}

.newsletter-block__split {
  grid-template-columns: 2fr 3fr;
  align-items: center;
}

.newsletter-block__map {
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
}

.newsletter-block__content {
  width: 100%;
  max-width: 500px;
  justify-self: start;
}

.newsletter-block__map-col {
  min-width: 0;
}

.newsletter-block__media-col {
  position: relative;
  width: 100%;
  min-height: clamp(280px, 42vw, 560px);
  overflow: hidden;
}

.newsletter-block__media-col .newsletter-block__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.newsletter-block.is-light {
  --newsletter-ink: #fff;
}

.newsletter-block__media-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(450px, 70vh, 780px);
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
  opacity: 0;
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
}

.newsletter-block__intro-paragraph {
  margin: 0;
}

.newsletter-block__title {
  margin: 0 0 clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.15;
}

.newsletter-block__form {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 1rem;
  width: 100%;
}

.newsletter-block__form--stacked {
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: clamp(1rem, 2.5vw, 1.35rem);
}

.newsletter-block__form--overlay {
  gap: 0.75rem;
}

.newsletter-block__fieldset {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
  display: grid;
  gap: clamp(0.85rem, 2vw, 1rem);
}

.newsletter-block__legend {
  margin: 0 0 clamp(0.15rem, 0.5vw, 0.35rem);
  padding: 0;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  font-weight: 400;
  line-height: 1.2;
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

.newsletter-block__label-note {
  margin-left: 0.35em;
  font-size: 0.85em;
  letter-spacing: 0;
  text-transform: none;
  opacity: 0.72;
}

.newsletter-block__form:not(.newsletter-block__form--overlay):not(.newsletter-block__form--stacked) .newsletter-block__label {
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  text-transform: none;
  letter-spacing: 0;
}

.newsletter-block__form--stacked .newsletter-block__label {
  font-size: clamp(0.8125rem, 1.2vw, 0.9375rem);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.newsletter-block__input,
.newsletter-block__select {
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

.newsletter-block__select {
  cursor: pointer;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 1.1rem) calc(50% + 0.15rem), calc(100% - 0.75rem) calc(50% + 0.15rem);
  background-size: 0.35rem 0.35rem, 0.35rem 0.35rem;
  background-repeat: no-repeat;
  padding-right: 1.75rem;
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

.newsletter-block__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  line-height: 1.3;
  cursor: pointer;
  user-select: none;
}

.newsletter-block__checkbox-input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: var(--newsletter-ink);
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

.newsletter-block__submit--stacked {
  justify-self: start;
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

@media (max-width: 899px) {
  .newsletter-block__split,
  .newsletter-block__map {
    grid-template-columns: 1fr;
  }

  .newsletter-block__content {
    max-width: none;
  }

  .newsletter-block__split .newsletter-block__form {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .newsletter-block__split .newsletter-block__submit {
    justify-self: end;
  }
}
</style>
