<template>
  <div
    ref="rootRef"
    class="host-dropdown"
    :class="{ 'is-open': open, 'is-placeholder': !modelValue }"
  >
    <button
      type="button"
      class="host-dropdown__trigger"
      :aria-expanded="open"
      :aria-haspopup="'listbox'"
      :aria-required="required"
      @click="toggle"
    >
      <span class="host-dropdown__value">{{ modelValue || placeholder }}</span>
      <span class="host-dropdown__chevron" aria-hidden="true" />
    </button>

    <ul
      v-show="open"
      class="host-dropdown__menu"
      role="listbox"
      :aria-label="label"
    >
      <li
        v-for="option in options"
        :key="option"
        class="host-dropdown__option"
        role="option"
        :aria-selected="option === modelValue"
        :class="{ 'is-selected': option === modelValue }"
        @click="choose(option)"
      >
        {{ option }}
      </li>
    </ul>

    <input
      type="hidden"
      :name="name"
      :value="modelValue"
      :required="required"
    >
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select...',
  },
  name: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootRef = ref(null)

function toggle() {
  open.value = !open.value
}

function choose(option) {
  emit('update:modelValue', option)
  open.value = false
}

function onPointerDown(event) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target)) {
    open.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.host-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.host-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 0.6rem 0 1.1rem;
  border: 0;
  background: transparent;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 50px;
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
}

.host-dropdown.is-placeholder .host-dropdown__value {
  color: color-mix(in srgb, var(--host-ink, #4f4f4e) 45%, transparent);
  letter-spacing: 0.08em;
}

.host-dropdown__chevron {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.host-dropdown__chevron::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 1px;
  width: 7px;
  height: 7px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
  opacity: 0.7;
}

.host-dropdown.is-open .host-dropdown__chevron {
  transform: rotate(180deg);
}

.host-dropdown__menu {
  position: absolute;
  top: 100%;
  left: -1px;
  right: 0;
  z-index: 20;
  margin: 0;
  padding: 0rem 0;
  list-style: none;
  background: white;
  border: 1px solid color-mix(in srgb, #4f4f4e 28%, transparent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  overflow: auto;
}

.host-dropdown__option {
  padding: 0rem 1.1rem;
    height: 50px;
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-transform: uppercase;
    color: var(--host-ink, #4f4f4e);
    cursor: pointer;
    line-height: 50px;
}

.host-dropdown__option:hover,
.host-dropdown__option.is-selected {
  background: color-mix(in srgb, #4f4f4e 4%, transparent);
}

.host-dropdown__option.is-selected {
  color: #ff59d0;
}
</style>
