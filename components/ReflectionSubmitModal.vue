<script setup>
import {
  REFLECTION_COUNTRIES,
  REFLECTION_PAPER_COLORS,
  getReflectionPaperStyle,
} from '~/utils/reflections'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submitted'])

const form = reactive({
  name: '',
  city: '',
  country: '',
  reflection: '',
  paperColor: REFLECTION_PAPER_COLORS[0]?.value || 'peach',
})

const submitting = ref(false)
const submitError = ref('')
const dialogRef = ref(null)
const rendered = ref(false)

const { addPendingItem } = useReflectionsPendingCache()

const modalPaperStyle = computed(() => getReflectionPaperStyle(form.paperColor))

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    rendered.value = isOpen
    if (isOpen) {
      nextTick(() => dialogRef.value?.focus())
    }
  },
  { immediate: true },
)

function resetForm() {
  form.name = ''
  form.city = ''
  form.country = ''
  form.reflection = ''
  form.paperColor = REFLECTION_PAPER_COLORS[0]?.value || 'peach'
  submitError.value = ''
}

function close() {
  emit('close')
}

function onOverlayClick(event) {
  if (event.target === event.currentTarget) {
    close()
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && props.open) {
    close()
  }
}

async function onSubmit() {
  submitError.value = ''
  submitting.value = true

  try {
    const response = await $fetch('/api/reflections', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        reflection: form.reflection.trim(),
        paperColor: form.paperColor,
      },
    })

    addPendingItem(response.item)
    emit('submitted', response.item)
    resetForm()
    close()
  } catch (error) {
    submitError.value = error?.data?.statusMessage
      || error?.statusMessage
      || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="rendered"
      class="reflection-modal-overlay"
      :class="{ 'reflection-modal-overlay--visible': open }"
      @click="onOverlayClick"
    >
      <div
        ref="dialogRef"
        class="reflection-modal"
        :style="modalPaperStyle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reflection-modal-title"
        tabindex="-1"
        @click.stop
      >
        <header class="reflection-modal__header">
          <h2
            id="reflection-modal-title"
            class="reflection-modal__title serif light"
          >
            Leave a reflection
          </h2>
          <button
            type="button"
            class="reflection-modal__close"
            aria-label="Close"
            @click="close"
          >
            ×
          </button>
        </header>

        <form
          class="reflection-modal__form"
          @submit.prevent="onSubmit"
        >
          <div class="reflection-modal__field">
            <label
              class="reflection-modal__label"
              for="reflection-text"
            >
              Reflection
            </label>
            <textarea
              id="reflection-text"
              v-model="form.reflection"
              class="reflection-modal__textarea"
              rows="4"
              maxlength="500"
              required
              placeholder="What stayed with you?"
            />
          </div>

          <div class="reflection-modal__grid">
            <div class="reflection-modal__field">
              <label
                class="reflection-modal__label"
                for="reflection-name"
              >
                Name <span class="reflection-modal__optional">(optional)</span>
              </label>
              <input
                id="reflection-name"
                v-model="form.name"
                class="reflection-modal__input"
                type="text"
                maxlength="80"
                placeholder="Anonymous"
                autocomplete="name"
              >
            </div>

            <div class="reflection-modal__field">
              <label
                class="reflection-modal__label"
                for="reflection-city"
              >
                City <span class="reflection-modal__optional">(optional)</span>
              </label>
              <input
                id="reflection-city"
                v-model="form.city"
                class="reflection-modal__input"
                type="text"
                maxlength="80"
                autocomplete="address-level2"
              >
            </div>
          </div>

          <div class="reflection-modal__field">
            <label
              class="reflection-modal__label"
              for="reflection-country"
            >
              Country
              <span
                v-if="form.city.trim()"
                class="reflection-modal__required"
              >(required with city)</span>
              <span
                v-else
                class="reflection-modal__optional"
              >(optional)</span>
            </label>
            <select
              id="reflection-country"
              v-model="form.country"
              class="reflection-modal__select"
              :required="Boolean(form.city.trim())"
            >
              <option value="">
                Select a country
              </option>
              <option
                v-for="country in REFLECTION_COUNTRIES"
                :key="country"
                :value="country"
              >
                {{ country }}
              </option>
            </select>
          </div>

          <fieldset class="reflection-modal__fieldset">
            <legend class="reflection-modal__label">
              Paper colour
            </legend>
            <div class="reflection-modal__colors">
              <label
                v-for="color in REFLECTION_PAPER_COLORS"
                :key="color.value"
                class="reflection-modal__color"
              >
                <input
                  v-model="form.paperColor"
                  class="reflection-modal__color-input"
                  type="radio"
                  name="paperColor"
                  :value="color.value"
                >
                <span
                  class="reflection-modal__color-label"
                  :style="{ backgroundColor: color.hex }"
                >{{ color.label }}</span>
              </label>
            </div>
          </fieldset>

          <p
            v-if="submitError"
            class="reflection-modal__error"
            role="alert"
          >
            {{ submitError }}
          </p>

          <div class="reflection-modal__actions">
            <button
              type="button"
              class="reflection-modal__button reflection-modal__button--secondary"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="reflection-modal__button reflection-modal__button--primary"
              :disabled="submitting"
            >
              {{ submitting ? 'Sending…' : 'Share reflection' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.reflection-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 520;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 3vw, 2rem);
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.reflection-modal-overlay--visible {
  opacity: 1;
}

.reflection-modal {
  width: min(100%, 34rem);
  max-height: min(92dvh, 760px);
  overflow: auto;
  border-radius: 4px;
  background: var(--reflection-paper-bg, #ddc8bc);
  color: var(--reflection-paper-text, #4a4038);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
}

.reflection-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.75rem;
}

.reflection-modal__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
}

.reflection-modal__close {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--reflection-paper-text, #4a4038) 8%, transparent);
  color: inherit;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.reflection-modal__form {
  display: grid;
  gap: 1rem;
  padding: 0 1.25rem 1.25rem;
}

.reflection-modal__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .reflection-modal__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.reflection-modal__field,
.reflection-modal__fieldset {
  margin: 0;
  border: 0;
  padding: 0;
}

.reflection-modal__label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reflection-modal__optional,
.reflection-modal__required {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--reflection-paper-text, #4a4038) 58%, transparent);
}

.reflection-modal__input,
.reflection-modal__select,
.reflection-modal__textarea {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--reflection-paper-text, #4a4038) 16%, transparent);
  border-radius: 2px;
  background: color-mix(in srgb, #fff 72%, var(--reflection-paper-bg, #ddc8bc));
  color: inherit;
  font: inherit;
  padding: 0.75rem 0.85rem;
}

.reflection-modal__textarea {
  resize: vertical;
  min-height: 6.5rem;
}

.reflection-modal__colors {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.55rem;
}

@media (max-width: 640px) {
  .reflection-modal__colors {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.reflection-modal__color {
  position: relative;
  display: block;
  cursor: pointer;
}

.reflection-modal__color-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.reflection-modal__color-label {
  display: block;
  padding: 0.55rem 0.45rem;
  border: 1px solid color-mix(in srgb, var(--reflection-paper-text, #4a4038) 12%, transparent);
  border-radius: 2px;
  font-size: 0.72rem;
  text-align: center;
  letter-spacing: 0.04em;
  color: var(--reflection-paper-text, #4a4038);
}

.reflection-modal__color-input:checked + .reflection-modal__color-label {
  outline: 2px solid var(--reflection-paper-text, #4a4038);
  outline-offset: 1px;
}

.reflection-modal__error {
  margin: 0;
  color: #9a2f2f;
  font-size: 0.88rem;
}

.reflection-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.25rem;
}

.reflection-modal__button {
  border: 1px solid color-mix(in srgb, var(--reflection-paper-text, #4a4038) 18%, transparent);
  border-radius: 999px;
  padding: 0.72rem 1.1rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.reflection-modal__button--primary {
  background: var(--reflection-paper-text, #4a4038);
  color: var(--reflection-paper-bg, #ddc8bc);
  border-color: transparent;
}

.reflection-modal__button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
