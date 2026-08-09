<script setup>
import {
  REFLECTION_COUNTRIES,
  getReflectionPaperStyle,
  pickReflectionPaperColor,
} from '~/utils/reflections'

const props = defineProps({
  idPrefix: {
    type: String,
    default: 'reflection-form',
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'modal',
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['submitted', 'cancel'])

const step = ref('form')

const form = reactive({
  name: '',
  city: '',
  country: '',
  reflection: '',
})

const submitting = ref(false)
const submitError = ref('')
const newsletterEmail = ref('')
const newsletterSubmitted = ref(false)

const { addPendingItem } = useReflectionsPendingCache()
const { mailchimpAction } = useSiteSettings()

const paperStyle = computed(() => getReflectionPaperStyle('paleRicePaper'))
const isInline = computed(() => props.variant === 'inline')

function fieldId(name) {
  return `${props.idPrefix}-${name}`
}

function resetNewsletter() {
  newsletterEmail.value = ''
  newsletterSubmitted.value = false
}

function resetForm() {
  form.name = ''
  form.city = ''
  form.country = ''
  form.reflection = ''
  submitError.value = ''
}

function resetAll() {
  resetForm()
  resetNewsletter()
  step.value = 'form'
}

function onCancel() {
  resetAll()
  emit('cancel')
}

function onNewsletterSubmit() {
  newsletterSubmitted.value = true
}

async function onSubmit() {
  submitError.value = ''
  submitting.value = true

  try {
    const reflection = form.reflection.trim()
    const paperColor = pickReflectionPaperColor(`${reflection}:${form.name}:${form.city}:${form.country}`)

    const response = await $fetch('/api/reflections', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        reflection,
        paperColor,
      },
    })

    addPendingItem(response.item)
    emit('submitted', response.item)
    step.value = 'newsletter'
  } catch (error) {
    submitError.value = error?.data?.statusMessage
      || error?.statusMessage
      || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

defineExpose({ resetAll })
</script>

<template>
  <div
    class="reflection-submit-form"
    :class="{
      'reflection-submit-form--inline': isInline,
      'reflection-submit-form--modal': !isInline,
    }"
    :style="paperStyle"
  >
    <header
      v-if="step === 'form' && showTitle"
      class="reflection-submit-form__header"
    >
      <h2
        :id="fieldId('title')"
        class="reflection-submit-form__title serif light"
      >
        Leave a Reflection
      </h2>
    </header>

    <form
      v-if="step === 'form'"
      class="reflection-submit-form__body"
      @submit.prevent="onSubmit"
    >
      <div class="reflection-submit-form__field">
        <label
          class="reflection-submit-form__label"
          :for="fieldId('text')"
        >
          Your reflection
        </label>
        <textarea
          :id="fieldId('text')"
          v-model="form.reflection"
          class="reflection-submit-form__textarea"
          rows="4"
          maxlength="500"
          required
          placeholder="What stayed with you after watching the film?"
        />
      </div>

      <div class="reflection-submit-form__grid">
        <div class="reflection-submit-form__field">
          <label
            class="reflection-submit-form__label"
            :for="fieldId('name')"
          >
            Name <span class="reflection-submit-form__optional">(optional)</span>
          </label>
          <input
            :id="fieldId('name')"
            v-model="form.name"
            class="reflection-submit-form__input"
            type="text"
            maxlength="80"
            autocomplete="name"
          >
        </div>

        <div class="reflection-submit-form__field">
          <label
            class="reflection-submit-form__label"
            :for="fieldId('city')"
          >
            City <span class="reflection-submit-form__optional">(optional)</span>
          </label>
          <input
            :id="fieldId('city')"
            v-model="form.city"
            class="reflection-submit-form__input"
            type="text"
            maxlength="80"
            autocomplete="address-level2"
          >
        </div>
      </div>

      <div class="reflection-submit-form__field">
        <label
          class="reflection-submit-form__label"
          :for="fieldId('country')"
        >
          Country
          <span
            v-if="form.city.trim()"
            class="reflection-submit-form__required"
          >(required if city is entered)</span>
        </label>
        <select
          :id="fieldId('country')"
          v-model="form.country"
          class="reflection-submit-form__select"
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

      <p
        v-if="submitError"
        class="reflection-submit-form__error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <div class="reflection-submit-form__actions">
        <button
          v-if="showCancel"
          type="button"
          class="reflection-submit-form__button reflection-submit-form__button--secondary"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="reflection-submit-form__button reflection-submit-form__button--primary"
          :disabled="submitting"
        >
          {{ submitting ? 'Sending…' : 'Fold & Leave' }}
        </button>
      </div>
    </form>

    <div
      v-else
      class="reflection-submit-form__body reflection-submit-form__newsletter"
    >
      <p class="reflection-submit-form__newsletter-copy serif light">
        If you'd like to hear from us occasionally, we'd be delighted to stay in touch.
      </p>

      <form
        v-if="!newsletterSubmitted"
        class="reflection-submit-form__newsletter-form"
        :action="mailchimpAction || undefined"
        method="post"
        target="_blank"
        @submit="onNewsletterSubmit"
      >
        <div class="reflection-submit-form__field">
          <label
            class="reflection-submit-form__label"
            :for="fieldId('newsletter-email')"
          >
            Email address
          </label>
          <input
            :id="fieldId('newsletter-email')"
            v-model="newsletterEmail"
            class="reflection-submit-form__input"
            type="email"
            name="EMAIL"
            required
            autocomplete="email"
          >
        </div>

        <div class="reflection-submit-form__actions reflection-submit-form__actions--newsletter">
          <button
            type="submit"
            class="reflection-submit-form__button reflection-submit-form__button--primary reflection-submit-form__button--wide"
            :disabled="!mailchimpAction"
          >
            Receive occasional letters from the filmmakers
          </button>
        </div>
      </form>

      <p
        v-else
        class="reflection-submit-form__thanks serif light"
      >
        Thanks — check your inbox to confirm.
      </p>
    </div>
  </div>
</template>

<style scoped>
.reflection-submit-form {
  color: var(--reflection-paper-text, #4a4844);
}

.reflection-submit-form--modal {
  background: var(--reflection-paper-bg, #f7f6f4);
  border: var(--reflection-card-border, 1px solid var(--mid-border));
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
}

.reflection-submit-form--inline {
  background: var(--reflection-paper-bg, #f7f6f4);
  border: var(--reflection-card-border, 1px solid var(--mid-border));
}

.reflection-submit-form__header {
  padding: 1.25rem 1.25rem 0.75rem;
}

.reflection-submit-form--inline .reflection-submit-form__header {
  padding: clamp(1rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.25rem) 0.5rem;
}

.reflection-submit-form__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
}

.reflection-submit-form--inline .reflection-submit-form__title {
  font-size: clamp(1.15rem, 2vw, 1.45rem);
}

.reflection-submit-form__body {
  display: grid;
  gap: 1rem;
  padding: 0 1.25rem 1.25rem;
}

.reflection-submit-form--inline .reflection-submit-form__body {
  padding: 0 clamp(1rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.25rem);
}

.reflection-submit-form__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .reflection-submit-form__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.reflection-submit-form__field,
.reflection-submit-form__fieldset {
  margin: 0;
  border: 0;
  padding: 0;
}

.reflection-submit-form__label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reflection-submit-form__optional,
.reflection-submit-form__required {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--reflection-paper-text, #4a4844) 58%, transparent);
}

.reflection-submit-form__input,
.reflection-submit-form__select,
.reflection-submit-form__textarea {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--reflection-paper-text, #4a4844) 16%, transparent);
  border-radius: 2px;
  background: color-mix(in srgb, #fff 72%, var(--reflection-paper-bg, #f7f6f4));
  color: inherit;
  font: inherit;
  padding: 0.75rem 0.85rem;
}

.reflection-submit-form__textarea {
  resize: vertical;
  min-height: 6.5rem;
}

.reflection-submit-form__error {
  margin: 0;
  color: #9a2f2f;
  font-size: 0.88rem;
}

.reflection-submit-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.25rem;
}

.reflection-submit-form__actions--newsletter {
  justify-content: flex-start;
}

.reflection-submit-form__button {
  border: 1px solid color-mix(in srgb, var(--reflection-paper-text, #4a4844) 18%, transparent);
  border-radius: 999px;
  padding: 0.72rem 1.1rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.reflection-submit-form__button--primary {
  background: var(--reflection-paper-text, #4a4844);
  color: var(--reflection-paper-bg, #f7f6f4);
  border-color: transparent;
}

.reflection-submit-form__button--wide {
  width: 100%;
  text-align: center;
  line-height: 1.35;
}

.reflection-submit-form__button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.reflection-submit-form__newsletter-copy,
.reflection-submit-form__thanks {
  margin: 0;
  font-size: clamp(1rem, 1.35vw, 1.125rem);
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.reflection-submit-form__newsletter-form {
  display: grid;
  gap: 1rem;
}
</style>
