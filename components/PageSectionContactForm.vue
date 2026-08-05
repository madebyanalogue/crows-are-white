<template>
  <section
    class="contact-form section-padding-2 section-padding-md-15"
    :class="{ 'contact-form--no-pad-top': !paddingTop }"
    :style="sectionStyle"
    id="contact-form"
  >
    <div class="wrapper">
      <div class="contact-form__inner grid-1 gap-section">
        <div
          v-if="titleBlocks.length || subtitle"
          class="contact-form__header grid-1 gap-3 text-center"
        >
          <div v-if="titleBlocks.length" class="serif h2">
            <SanityContent :blocks="titleBlocks" />
          </div>

          <p v-if="subtitle" class="h5 contact-form__subtitle serif">
            {{ subtitle }}
          </p>
        </div>

        <form
          class="contact-form__form grid-1 gap-2"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <div
            v-for="(row, rowIndex) in fieldRows"
            :key="`row-${rowIndex}`"
            class="contact-form__row grid-1 grid-sm-2 gap-2"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="contact-form__field"
              :class="{
                'contact-form__field--full': field.width === 'full',
                'contact-form__field--filled': Boolean(form[field.name]?.trim()),
              }"
            >
              <div class="contact-form__input-wrap">
                <label class="contact-form__label" :for="field.id">
                  {{ field.label }}<span
                    v-if="field.required"
                    class="contact-form__required"
                    aria-hidden="true"
                  >*</span>
                </label>
                <textarea
                  v-if="field.inputType === 'textarea'"
                  :id="field.id"
                  v-model="form[field.name]"
                  :name="field.name"
                  class="contact-form__input contact-form__textarea"
                  :autocomplete="field.autocomplete"
                  :required="field.required"
                  rows="5"
                />
                <input
                  v-else
                  :id="field.id"
                  v-model="form[field.name]"
                  :type="field.inputType"
                  :name="field.name"
                  class="contact-form__input"
                  :autocomplete="field.autocomplete"
                  :required="field.required"
                >
              </div>
            </div>
          </div>

          <label
            v-if="showMarketingConsent"
            class="contact-form__consent"
          >
            <input
              v-model="marketingConsent"
              type="checkbox"
              class="contact-form__consent-input"
              name="marketingConsent"
              :required="marketingConsentRequired"
            >
            <span class="contact-form__consent-label">
              {{ marketingConsentLabel }}<span
                v-if="marketingConsentRequired"
                class="contact-form__required"
                aria-hidden="true"
              >*</span>
            </span>
          </label>

          <div class="contact-form__actions grid-1 gap-2">
            <button
              type="submit"
              class="contact-form__submit"
              :disabled="isSubmitting"
            >
              <span class="contact-form__submit-text">
                {{ isSubmitting ? 'Sending…' : 'Submit' }}
              </span>
            </button>

            <p v-if="showRequiredFieldsNote && hasRequiredFields" class="contact-form__footnote">
              <span class="contact-form__required" aria-hidden="true">*</span>required fields
            </p>

            <div class="contact-form__privacy rich-text underline-links">
              <SanityContent :blocks="privacyNoticeBlocks" />
            </div>

            <p
              v-if="statusMessage"
              class="contact-form__status"
              :class="`contact-form__status--${statusType}`"
              role="status"
            >
              {{ statusMessage }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { toCssColor, resolvePageTextColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'
import {
  groupContactFormFieldsIntoRows,
  resolveContactFormFields,
  validateContactFormValues,
} from '~/utils/contactFormFields'

const DEFAULT_PRIVACY_NOTICE = [
  {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        marks: [],
        text: 'By submitting this form, you agree that Crows Are White may use your details to respond to your enquiry. See our Privacy Policy for how we handle your data, who we share it with, and your rights.',
      },
    ],
  },
]

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const titleBlocks = computed(() => props.section?.contactFormTitle ?? [])
const subtitle = computed(() => props.section?.contactFormSubtitle?.trim() || '')
const paddingTop = computed(() => props.section?.contactFormPaddingTop !== false)
const formFields = computed(() => props.section?.contactFormFields ?? [])
const privacyNoticeBlocks = computed(() => {
  const blocks = props.section?.contactFormPrivacyNotice
  if (Array.isArray(blocks) && blocks.length) return blocks
  return DEFAULT_PRIVACY_NOTICE
})
const showMarketingConsent = computed(() => props.section?.contactFormMarketingConsentEnabled === true)
const showRequiredFieldsNote = computed(() => props.section?.contactFormShowRequiredFieldsNote !== false)
const salesforceEnabled = computed(() => props.section?.contactFormSalesforceEnabled !== false)
const marketingConsentLabel = computed(() =>
  props.section?.contactFormMarketingConsentLabel?.trim()
  || 'I agree to receive marketing communications from Crows Are White.',
)
const marketingConsentRequired = computed(() =>
  props.section?.contactFormMarketingConsentRequired === true,
)
const fieldRows = computed(() => groupContactFormFieldsIntoRows(formFields.value))
const resolvedFields = computed(() => resolveContactFormFields(formFields.value))
const hasRequiredFields = computed(() => resolvedFields.value.some((field) => field.required))

const sectionStyle = computed(() => ({
  '--section-background': toCssColor(props.section?.contactFormBackgroundColor, DEFAULT_PAGE_COLOR),
  '--section-color': toCssColor(
    resolvePageTextColor(
      props.section?.contactFormTextColor,
      props.section?.contactFormBackgroundColor,
    ),
    'obsidian',
  ),
}))

const form = reactive({})

watch(
  resolvedFields,
  (fields) => {
    const nextKeys = new Set(fields.map((field) => field.name))

    for (const key of Object.keys(form)) {
      if (!nextKeys.has(key)) {
        delete form[key]
      }
    }

    for (const field of fields) {
      if (!(field.name in form)) {
        form[field.name] = ''
      }
    }
  },
  { immediate: true },
)

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref('success')
const marketingConsent = ref(false)

function resetForm() {
  for (const field of resolvedFields.value) {
    form[field.name] = ''
  }
  marketingConsent.value = false
}

async function handleSubmit() {
  statusMessage.value = ''

  const validationError = validateContactFormValues(formFields.value, form, {
    marketingConsent: marketingConsent.value,
    marketingConsentRequired: marketingConsentRequired.value,
  })
  if (validationError) {
    statusType.value = 'error'
    statusMessage.value = validationError
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        fields: formFields.value,
        values: { ...form },
        salesforceEnabled: salesforceEnabled.value,
        marketingConsent: marketingConsent.value,
        gdpr: {
          marketingConsentEnabled: showMarketingConsent.value,
          marketingConsentRequired: marketingConsentRequired.value,
        },
      },
    })

    statusType.value = 'success'
    statusMessage.value = 'Thank you — your message has been sent.'
    resetForm()
  } catch (error) {
    statusType.value = 'error'
    statusMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-form {
  background:var(--section-background);
  color:var(--section-color);
}

.contact-form--no-pad-top {
  padding-top: 0;
}

.contact-form__subtitle {
  margin: 0;
}

.contact-form__form {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.contact-form__field {
  display: block;
}

.contact-form__field--full {
  grid-column: 1 / -1;
}

.contact-form__input {
  transition:color 9999s ease 9999s, background-color 9999s ease 9999s;
}

.contact-form__label {
  position: absolute;
  top: 0.25em;
  left: 0;
  font-size: var(--body);
  line-height: var(--line-height);
  transform: scale(1);
  transform-origin: top left;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.contact-form__field:focus-within .contact-form__label,
.contact-form__field--filled .contact-form__label {
  transform: scale(0.8);
}

.contact-form__required {
  margin-left: 0.1em;
  color: var(--arancio);
}

.contact-form__input-wrap {
  position: relative;
}

.contact-form__input-wrap::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  opacity: 0.2;
  pointer-events: none;
}

.contact-form__input-wrap::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  will-change: transform;
}

.contact-form__input-wrap:hover::after,
.contact-form__input-wrap:focus-within::after {
  transform: scaleX(1);
}


.contact-form__input {
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: clamp(16px, var(--body), 20px);
  line-height: var(--line-height);
  padding: 2.4em 0 1.2em 0;
  border-radius: 0;
  outline: none;
}

.contact-form__textarea {
  resize: vertical;
  min-height: 8rem;
}

.contact-form__actions {
  padding-top: calc(var(--unit) * 1);
}

.contact-form__submit {
  align-self: flex-start;
  appearance: none;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: var(--body);
  line-height: var(--underline-link-line-height);
  padding:10px 0;
  position: relative;
  background:var(--section-color);
  color:var(--section-background);
  height:55px;
}

.contact-form__submit:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.contact-form__submit-text {
  display: inline-block;
}

.contact-form__footnote {
  display: flex;
  gap: 5px;
}

.contact-form__consent {
  display: flex;
  align-items: flex-start;
  gap: 0.75em;
  cursor: pointer;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

.contact-form__consent-input {
  flex: none;
  width: 1em;
  height: 1em;
  margin-top: 0.2em;
  accent-color: currentColor;
}

.contact-form__consent-label {
  font-size: var(--body);
  line-height: var(--line-height);
}

.contact-form__privacy {
  font-size: clamp(11px, 2vw, 13px);
  line-height: 2;
  max-width: 820px;
  opacity: 0.85;
}

.contact-form__privacy :deep(p) {
  margin: 0;
}

.contact-form__status {
  font-size: var(--body);
}

.contact-form__status--error {
  color: var(--arancio);
}
</style>
