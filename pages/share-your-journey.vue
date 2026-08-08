<script setup>
const pageTitle = useState('pageTitle', () => '')

pageTitle.value = 'Share Your Journey'

useSeoMeta({
  title: 'Share Your Journey',
  robots: 'noindex, nofollow',
})

const form = reactive({
  city: '',
  country: '',
  email: '',
})

const imageFile = ref(null)
const imagePreviewUrl = ref('')
const submitting = ref(false)
const submitError = ref('')
const submittedItem = ref(null)

const { addPendingItem } = useUgcPendingCache()

function onImageChange(event) {
  const file = event.target.files?.[0]
  imageFile.value = file || null

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = ''
  }

  if (file) {
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

async function onSubmit() {
  submitError.value = ''

  if (!imageFile.value) {
    submitError.value = 'Please choose a photo of your merch.'
    return
  }

  if (!form.city.trim() || !form.country.trim()) {
    submitError.value = 'Please enter your city and country.'
    return
  }

  submitting.value = true

  try {
    const body = new FormData()
    body.append('image', imageFile.value)
    body.append('city', form.city.trim())
    body.append('country', form.country.trim())
    if (form.email.trim()) {
      body.append('email', form.email.trim())
    }

    const response = await $fetch('/api/ugc', {
      method: 'POST',
      body,
    })

    submittedItem.value = response.item
    addPendingItem(response.item)
  } catch (error) {
    submitError.value = error?.data?.statusMessage
      || error?.statusMessage
      || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
})
</script>

<template>
  <div class="ugc-submit-page">
    <div class="ugc-submit-page__inner wrapper max-central-content">
      <header class="ugc-submit-page__header">
        <h1 class="ugc-submit-page__title serif light">
          Share Your Journey
        </h1>
        <p class="ugc-submit-page__lede">
          Show us where Crows Are White merch has travelled. Your photo will appear on the wall right away while our team reviews it.
        </p>
      </header>

      <div
        v-if="submittedItem"
        class="ugc-submit-page__success"
        role="status"
      >
        <p class="ugc-submit-page__success-title serif">
          Thank you — your photo is on the wall.
        </p>
        <p class="ugc-submit-page__success-copy">
          It’s visible to you immediately and will stay up for everyone once approved.
        </p>

        <div class="ugc-submit-page__preview">
          <UgcPolaroid :item="submittedItem" />
        </div>
      </div>

      <form
        v-else
        class="ugc-submit-page__form"
        @submit.prevent="onSubmit"
      >
        <div class="ugc-submit-page__field">
          <label
            class="ugc-submit-page__label"
            for="ugc-photo"
          >
            Photo
          </label>
          <input
            id="ugc-photo"
            class="ugc-submit-page__file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            required
            @change="onImageChange"
          >
          <div
            v-if="imagePreviewUrl"
            class="ugc-submit-page__preview"
          >
            <img
              :src="imagePreviewUrl"
              alt="Selected merch photo preview"
            >
          </div>
        </div>

        <div class="ugc-submit-page__grid">
          <div class="ugc-submit-page__field">
            <label
              class="ugc-submit-page__label"
              for="ugc-city"
            >
              City
            </label>
            <input
              id="ugc-city"
              v-model="form.city"
              class="ugc-submit-page__input"
              type="text"
              autocomplete="address-level2"
              maxlength="80"
              required
            >
          </div>

          <div class="ugc-submit-page__field">
            <label
              class="ugc-submit-page__label"
              for="ugc-country"
            >
              Country
            </label>
            <input
              id="ugc-country"
              v-model="form.country"
              class="ugc-submit-page__input"
              type="text"
              autocomplete="country-name"
              maxlength="80"
              required
            >
          </div>
        </div>

        <div class="ugc-submit-page__field">
          <label
            class="ugc-submit-page__label"
            for="ugc-email"
          >
            Email <span class="ugc-submit-page__optional">(optional)</span>
          </label>
          <input
            id="ugc-email"
            v-model="form.email"
            class="ugc-submit-page__input"
            type="email"
            autocomplete="email"
            maxlength="254"
          >
        </div>

        <p
          v-if="submitError"
          class="ugc-submit-page__error"
          role="alert"
        >
          {{ submitError }}
        </p>

        <button
          class="ugc-submit-page__submit handwritten"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? 'Uploading…' : 'Add to the wall' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.ugc-submit-page {
  min-height: calc(100dvh - calc(var(--header-height) * 1px));
  padding: calc(var(--section-padding) * 0.75) 0 var(--section-padding);
}

.ugc-submit-page__inner {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
}

.ugc-submit-page__header {
  display: grid;
  gap: 0.75rem;
  text-align: center;
}

.ugc-submit-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
}

.ugc-submit-page__lede {
  margin: 0 auto;
  max-width: 38rem;
  line-height: 1.6;
  opacity: 0.82;
}

.ugc-submit-page__form,
.ugc-submit-page__success {
  display: grid;
  gap: 1.25rem;
  margin: 0 auto;
  width: min(100%, 34rem);
}

.ugc-submit-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 700px) {
  .ugc-submit-page__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.ugc-submit-page__field {
  display: grid;
  gap: 0.45rem;
}

.ugc-submit-page__label {
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ugc-submit-page__optional {
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.65;
}

.ugc-submit-page__input,
.ugc-submit-page__file {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
  color: inherit;
  font: inherit;
}

.ugc-submit-page__submit {
  justify-self: start;
  padding: 0.65rem 1.35rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: clamp(1.2rem, 2.5vw, 1.5rem);
  cursor: pointer;
}

.ugc-submit-page__submit:disabled {
  opacity: 0.5;
  cursor: wait;
}

.ugc-submit-page__error {
  margin: 0;
  color: #b42318;
}

.ugc-submit-page__success {
  text-align: center;
}

.ugc-submit-page__success-title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
}

.ugc-submit-page__success-copy {
  margin: 0;
  opacity: 0.78;
}

.ugc-submit-page__preview {
  margin: 0 auto;
  width: min(100%, 18rem);
}

.ugc-submit-page__preview img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
</style>
