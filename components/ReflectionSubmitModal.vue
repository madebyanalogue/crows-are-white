<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submitted'])

const formRef = ref(null)
const dialogRef = ref(null)
const rendered = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    rendered.value = isOpen
    if (isOpen) {
      nextTick(() => dialogRef.value?.focus())
      return
    }
    formRef.value?.resetAll()
  },
  { immediate: true },
)

function close() {
  formRef.value?.resetAll()
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

function onSubmitted(item) {
  emit('submitted', item)
  nextTick(() => dialogRef.value?.focus())
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="reflection-modal-title"
        tabindex="-1"
        @click.stop
      >
        <button
          type="button"
          class="reflection-modal__close"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>

        <ReflectionSubmitForm
          ref="formRef"
          id-prefix="reflection-modal"
          show-cancel
          variant="modal"
          @cancel="close"
          @submitted="onSubmitted"
        />
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
  position: relative;
  width: min(100%, 34rem);
  max-height: min(92dvh, 760px);
  overflow: auto;
}

.reflection-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--reflection-paper-text, #4a4038) 8%, transparent);
  color: var(--reflection-paper-text, #4a4038);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}
</style>
