<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { getHeroFeatureColorVar } from '~/utils/heroChrome'
import { isLightColor } from '~/utils/pageColors'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const loop = computed(() => resolveSectionLoopVideo(props.section, 'hero'))
const showLogo = computed(() => props.section?.heroShowLogo !== false)
const logoLabel = computed(() => props.section?.heroLogoAlt?.trim() || 'Crows Are White')

const buttons = computed(() => {
  const items = props.section?.heroButtons || []
  return items
    .map((item, index) => ({
      _key: item._key || `hero-btn-${index}`,
      text: item.linkTitle || '',
      link: {
        type: item.type,
        page: item.page,
        url: item.url,
      },
      isButton: item.style !== 'secondary',
      style: item.style === 'secondary' ? 'secondary' : 'primary',
    }))
    .filter((item) => item.text)
})

const byline = computed(() => props.section?.heroByline?.trim() || '')

const bylineParts = computed(() => {
  const text = byline.value
  if (!text) return null

  const match = text.match(/^(A Film By)\s+(.*)$/i)
  if (!match) return { lead: null, rest: text }

  return {
    lead: match[1],
    rest: match[2],
  }
})

const showButtons = ref(true)
const hasButtonToggle = computed(() => buttons.value.length > 0)
const showButtonStack = computed(() => showButtons.value && buttons.value.length > 0)
const scrimOpacity = computed(() => {
  const value = props.section?.heroScrimOpacity
  if (value == null) return 1
  return Math.min(100, Math.max(0, value)) / 100
})
const showScrim = computed(() => props.section?.heroShowScrim !== false && scrimOpacity.value > 0)
const videoTransform = computed(() => props.section?.heroVideoTransform?.trim() || '')

const heroStyle = computed(() => ({
  '--hero-feature-color': getHeroFeatureColorVar(props.section),
  '--hero-primary-text-color': isLightColor(props.section?.heroFeatureColor)
    ? 'var(--obsidian, #000e0a)'
    : 'var(--fuji, #fff)',
}))

const { sectionRef } = useHeroMenuChrome(toRef(props, 'section'))
</script>

<template>
  <section
    id="hero"
    ref="sectionRef"
    class="page-section-hero"
    data-hero-section
    :style="heroStyle"
  >
    <div class="page-section-hero__media-wrap">
      <SectionLoopVideo
        :loop="loop"
        title="Hero background"
        aspect-class="page-section-hero__media"
        :media-transform="videoTransform"
        priority
      />
      <div
        v-if="showScrim"
        class="page-section-hero__scrim"
        :style="{ opacity: scrimOpacity }"
        aria-hidden="true"
      />
    </div>

    <div
      v-if="showLogo"
      class="page-section-hero__logo-wrap"
    >
      <HeroWordmarkLogo :label="logoLabel" />
    </div>

    <button
      v-if="hasButtonToggle"
      type="button"
      class="page-section-hero__buttons-toggle"
      :aria-pressed="showButtons"
      aria-label="Toggle hero buttons"
      @click="showButtons = !showButtons"
    >
      <span
        class="page-section-hero__buttons-toggle-track"
        :class="{ 'is-on': showButtons }"
        aria-hidden="true"
      >
        <span class="page-section-hero__buttons-toggle-thumb" />
      </span>
      <span class="page-section-hero__buttons-toggle-label">Buttons</span>
    </button>

    <div
      v-if="showButtonStack || byline"
      class="page-section-hero__bottom"
      :class="{ 'is-buttons-hidden': !showButtons }"
    >
      <div class="page-section-hero__bottom-spacer" aria-hidden="true" />

      <div
        v-if="showButtonStack"
        class="page-section-hero__buttons"
      >
        <MenuLink
          v-for="button in buttons"
          :key="button._key"
          :item="button"
          :link-class="[
            'page-section-hero__button',
            button.style === 'secondary'
              ? 'page-section-hero__button--secondary'
              : 'page-section-hero__button--primary',
          ]"
          :show-arrow="false"
        />
      </div>

      <p
        v-if="byline"
        class="page-section-hero__byline"
        :class="{ 'is-centered-wide': !showButtons }"
      >
        <template v-if="bylineParts?.lead">
          <span>{{ bylineParts.lead }}</span>
          {{ ' ' }}{{ bylineParts.rest }}
        </template>
        <template v-else>
          {{ byline }}
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.page-section-hero {
  --site-header-panel-width-closed: 360px;
  --hero-feature-color: var(--menu-highlight-color, var(--arancio, #ff9944));

  position: relative;
  height: 100svh;
  min-height: 50vw;
  max-height: 170vw;
  overflow: hidden;
  background: #000;
  color: var(--fuji, #fff);
}

.page-section-hero__media-wrap {
  position: absolute;
  inset: 0;
}

.page-section-hero :deep(.page-section-hero__media) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-section-hero :deep(.video-loop),
.page-section-hero :deep(.section-loop-video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-section-hero :deep(.video-loop__native),
.page-section-hero :deep(.video-loop__iframe),
.page-section-hero :deep(.section-loop-video__el) {
  object-position: center center;
}

.page-section-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.page-section-hero__logo-wrap {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  color: var(--hero-feature-color);
  top:-7%;
}

.page-section-hero__logo-wrap :deep(.hero-wordmark-logo) {
  display: block;
  width: 100%;
  height: 100%;
}

.page-section-hero__buttons-toggle {
  position: absolute;
  top: 40px;
  left: 30px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--hero-feature-color);
  cursor: pointer;
  pointer-events: auto;
}

.page-section-hero__buttons-toggle-label {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.page-section-hero__buttons-toggle-track {
  position: relative;
  display: block;
  width: 2.25rem;
  height: 1.15rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  transition: background-color 0.25s ease;
}

.page-section-hero__buttons-toggle-track.is-on {
  background: color-mix(in srgb, currentColor 18%, transparent);
}

.page-section-hero__buttons-toggle-thumb {
  position: absolute;
  top: 50%;
  left: 0.12rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: currentColor;
  transform: translate(0, -50%);
  transition: transform 0.25s ease;
}

.page-section-hero__buttons-toggle-track.is-on .page-section-hero__buttons-toggle-thumb {
  transform: translate(1rem, -50%);
}

.page-section-hero__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(40px, 3vw, 50px);
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr min(var(--site-header-panel-width-closed), 100%) 1fr;
  grid-template-areas:
    "spacer buttons byline";
  align-items: end;
  gap: 1rem 1.5rem;
  padding: 0 1rem;
  pointer-events: none;
}

.page-section-hero__bottom-spacer {
  min-height: 0;
}

.page-section-hero__buttons {
  grid-area: buttons;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  pointer-events: auto;
}

.page-section-hero__byline {
  grid-column: 3;
  margin: 0;
  align-self: end;
  width: 100%;
  text-transform: uppercase;
  font-weight: 300;
  font-family: var(--serif);
  font-size: clamp(23px, 1.35vw, 30px);
  line-height: 1.2;
  letter-spacing: 0.06em;
  text-align: center;
  color: var(--hero-feature-color);
  grid-area: byline;
}

.page-section-hero__bottom.is-buttons-hidden {
  grid-template-columns: 1fr min(680px, 90vw) 1fr;
  grid-template-areas: ". byline .";
}

.page-section-hero__byline.is-centered-wide {
  grid-column: 2;
  grid-area: byline;
  align-self: end;
  max-width: none;
}

.page-section-hero__buttons :deep(.menu-link) {
  display: flex;
  padding: 0;
  line-height: 1;

  font-size: 17px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.page-section-hero__buttons :deep(.menu-link__content) {
  display: block;
}

.page-section-hero__buttons :deep(.menu-link__label) {
  display: block;
  width: 100%;
}

.page-section-hero__buttons :deep(.menu-link__underline) {
  display: none;
}

.page-section-hero__button {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 50px;
  padding: 0.85rem 1.25rem;
  border-radius: 0;
  font-family: var(--serif);
  font-size: var(--header);
  line-height: 1.1;
  text-align: center;
  text-decoration: none;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;
}

.page-section-hero__button--primary {
  background-color: var(--hero-feature-color);
  border: 1px solid var(--hero-feature-color);
  color: var(--hero-primary-text-color);
}

.page-section-hero__button--primary:hover {
  filter: brightness(1.05);
}

.page-section-hero__button--secondary {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--hero-feature-color);
  color: var(--hero-feature-color);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(20px);
}

.page-section-hero__button--secondary:hover {
  background: rgba(0, 0, 0, 0.52);
}

@media (max-width: 999px) {
  .page-section-hero__bottom {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, auto);
    grid-template-areas:
      "byline"
      "buttons";
    justify-items: center;
  }

  .page-section-hero__bottom.is-buttons-hidden {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas: "byline";
    justify-items: center;
  }

  .page-section-hero__buttons {
    grid-column: auto;
    width: min(100%, var(--site-header-panel-width-closed));
  }

  .page-section-hero__byline {
    grid-column: auto;
    margin-bottom: 1rem;
  }

  .page-section-hero__byline.is-centered-wide {
    grid-column: 1;
    width: min(100%, 680px);
    margin-bottom: 0;
    justify-self: center;
  }

  .page-section-hero__bottom.is-buttons-hidden .page-section-hero__byline {
    margin-bottom: 0;
  }

  .page-section-hero__bottom-spacer {
    display: none;
  }
}



.page-section-hero__byline span {
  font-size: 65%;
}
</style>
