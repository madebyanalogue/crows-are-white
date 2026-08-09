<template>
  <Transition name="newsletter-popup-fade">
    <aside
      v-if="isVisible"
      class="newsletter-popup"
      :class="{ 'is-expanded': expanded }"
      aria-label="Newsletter signup"
    >
      <div class="newsletter-popup__inner">
        <div
          class="newsletter-popup__collapsed"
          :class="{ 'is-active': !expanded }"
        >
          <button
            type="button"
            class="newsletter-popup__hit"
            @click="expand"
          >
            <p class="newsletter-popup__title">Stay with the Story</p>
            <p class="newsletter-popup__subtitle">
              Occasional letters from the filmmakers
            </p>
          </button>
        </div>

        <div
          class="newsletter-popup__expanded"
          :class="{ 'is-active': expanded }"
        >
          <button
            type="button"
            class="newsletter-popup__hit newsletter-popup__hit--expanded"
            @click="collapse"
          >
            <h3 class="newsletter-popup__title">Stay with the Story</h3>
          </button>

          <div class="newsletter-popup__copy">
            <p class="newsletter-popup__copy-line">
              If this film resonated with you, we'd love to keep in touch.
            </p>
            <p class="newsletter-popup__copy-line">
              Receive occasional letters from the filmmakers, screening news, and updates as the journey continues.
            </p>
          </div>

          <form
            v-if="!submitted"
            class="newsletter-popup__form"
            :action="mailchimpAction || undefined"
            method="post"
            target="_blank"
            novalidate
            @submit="onSubmit"
          >
            <label
              class="newsletter-popup__label"
              for="newsletter-popup-email"
            >
              Email address
            </label>
            <div class="newsletter-popup__field-row">
              <input
                id="newsletter-popup-email"
                v-model="email"
                class="newsletter-popup__input"
                type="email"
                name="EMAIL"
                required
                autocomplete="email"
                autocapitalize="off"
                aria-label="Email address"
              >
              <button
                type="submit"
                class="newsletter-popup__submit"
                :disabled="!mailchimpAction"
              >
                Stay in Touch
              </button>
            </div>
          </form>

          <p
            v-else
            class="newsletter-popup__thanks"
          >
            Thanks — check your inbox to confirm.
          </p>
        </div>

        <button
          type="button"
          class="newsletter-popup__close"
          aria-label="Close newsletter popup"
          @click="dismiss"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { getCachedPageForRoute } from '~/utils/videoSectionFlags'

const STORAGE_KEY = 'crows_newsletter_popup_dismissed'

const route = useRoute()
const nuxtApp = useNuxtApp()
const { mailchimpAction } = useSiteSettings()

const expanded = ref(false)
const submitted = ref(false)
const email = ref('')
const dismissed = ref(false)

const enabledForPage = computed(() => {
  if (route.meta?.showNewsletterPopup === true) return true
  const page = getCachedPageForRoute(nuxtApp, route.path)
  return page?.showNewsletterPopup === true
})

const isVisible = computed(() => enabledForPage.value && !dismissed.value)

function expand() {
  expanded.value = true
}

function collapse() {
  expanded.value = false
}

function dismiss() {
  dismissed.value = true
  expanded.value = false
  if (import.meta.client) {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
  }
}

function onSubmit(event) {
  if (!mailchimpAction.value) {
    event.preventDefault()
    return
  }
  submitted.value = true
}

watch(() => route.path, () => {
  expanded.value = false
  submitted.value = false
  email.value = ''
})

onMounted(() => {
  if (!import.meta.client) return
  try {
    dismissed.value = sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    dismissed.value = false
  }
})
</script>

<style scoped>
.newsletter-popup {
  --newsletter-bg: var(--crema, #f0f0ed);
  --newsletter-fg: var(--obsidian, #000e0a);
  --newsletter-border: var(--menu-highlight-color, var(--arancio, #ff9944));
  position: fixed;
  left: var(--gutter, 20px);
  bottom: var(--gutter, 20px);
  z-index: 200;
  width: min(calc(100vw - (var(--gutter, 20px) * 2)), 22rem);
  max-height: 90px;
  overflow: hidden;
  border: 2px solid var(--newsletter-border);
  background: color-mix(in srgb, var(--newsletter-bg) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--newsletter-fg);
  transition: max-height 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.newsletter-popup.is-expanded {
  max-height: 26rem;
}

.newsletter-popup__inner {
  position: relative;
  width: 100%;
  padding: 12px 16px;
}

.newsletter-popup__collapsed {
  position: absolute;
  inset: 0;
  padding: 12px 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 250ms ease-in-out;
}

.newsletter-popup__collapsed.is-active {
  opacity: 1;
  pointer-events: auto;
  transition-delay: 150ms;
}

.newsletter-popup__expanded {
  opacity: 0;
  pointer-events: none;
  transition: opacity 250ms ease-in-out;
}

.newsletter-popup__expanded.is-active {
  opacity: 1;
  pointer-events: auto;
}

.newsletter-popup__hit {
  display: block;
  width: 100%;
  padding: 0 2rem 0 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.newsletter-popup__hit--expanded {
  margin-bottom: 0.75rem;
}

.newsletter-popup__title {
  margin: 0 0 0.25rem;
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.15;
}

.newsletter-popup__subtitle {
  margin: 0;
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.newsletter-popup__hit:hover .newsletter-popup__subtitle {
  opacity: 1;
}

.newsletter-popup__copy {
  display: grid;
  gap: 0.65rem;
  margin: 0 0 1rem;
}

.newsletter-popup__copy-line {
  margin: 0;
  font-family: var(--sans);
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.35;
  opacity: 0.7;
}

.newsletter-popup__form {
  display: grid;
  gap: 0.45rem;
  width: 100%;
  padding-top: 0.85rem;
  border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
}

.newsletter-popup__label {
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

.newsletter-popup__field-row {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  width: 100%;
}

.newsletter-popup__input {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0.65rem 0;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: transparent;
  font-family: var(--sans);
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: none;
  color: inherit;
  outline: none;
}

.newsletter-popup__input::placeholder {
  color: inherit;
  opacity: 0.45;
}

.newsletter-popup__submit {
  flex-shrink: 0;
  align-self: end;
  margin: 0;
  padding: 0.65rem 0;
  border: 0;
  background: transparent;
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.newsletter-popup__submit:hover:not(:disabled) {
  opacity: 1;
}

.newsletter-popup__submit:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.newsletter-popup__thanks {
  margin: 0;
  padding: 0.85rem 0;
  border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  font-family: var(--sans);
  font-size: 0.8rem;
  line-height: 1.4;
}

.newsletter-popup__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.newsletter-popup__close:hover {
  opacity: 1;
}

.newsletter-popup-fade-enter-active,
.newsletter-popup-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.newsletter-popup-fade-enter-from,
.newsletter-popup-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
