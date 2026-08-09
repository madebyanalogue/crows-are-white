<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Country',
  },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootRef = ref(null)

const displayLabel = computed(() => props.modelValue || props.placeholder)

const menuColumnsClass = computed(() => {
  const count = props.options.length
  if (count > 18) return 'reflection-country-dropdown__menu--3-cols'
  if (count > 6) return 'reflection-country-dropdown__menu--2-cols'
  return null
})

function toggle() {
  open.value = !open.value
}

function choose(country) {
  emit('update:modelValue', country)
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

<template>
  <div
    ref="rootRef"
    class="reflection-country-dropdown"
    :class="{
      'reflection-country-dropdown--open': open,
      'reflection-country-dropdown--active': !!modelValue,
    }"
  >
    <button
      type="button"
      class="reflection-country-dropdown__trigger serif"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="reflection-country-dropdown__value">{{ displayLabel }}</span>
      <span
        class="reflection-country-dropdown__chevron"
        aria-hidden="true"
      />
    </button>

    <ul
      v-show="open"
      class="reflection-country-dropdown__menu"
      :class="menuColumnsClass"
      role="listbox"
      aria-label="Country"
      @wheel.stop
    >
      <li
        v-for="country in options"
        :key="country"
        class="reflection-country-dropdown__option serif"
        role="option"
        :aria-selected="country === modelValue"
        :class="{ 'reflection-country-dropdown__option--selected': country === modelValue }"
        @click="choose(country)"
      >
        {{ country }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.reflection-country-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.reflection-country-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font-size: clamp(0.95rem, 1.35vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.reflection-country-dropdown--active .reflection-country-dropdown__trigger {
  opacity: 1;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

.reflection-country-dropdown__trigger:hover {
  opacity: 0.85;
}

.reflection-country-dropdown--active .reflection-country-dropdown__trigger:hover {
  opacity: 1;
}

.reflection-country-dropdown__trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.reflection-country-dropdown__chevron {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.reflection-country-dropdown__chevron::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 1px;
  width: 6px;
  height: 6px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
  opacity: 0.7;
}

.reflection-country-dropdown--open .reflection-country-dropdown__chevron {
  transform: rotate(180deg);
}

.reflection-country-dropdown__menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 0;
  z-index: 100;
  min-width: max(100%, 10rem);
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  background: var(--page-bg, #fff);
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  max-height: min(70vh, 28rem);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.reflection-country-dropdown__menu--2-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: max(100%, 18rem);
  padding-inline: 0;
}

.reflection-country-dropdown__menu--3-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  min-width: max(100%, 26rem);
  padding-inline: 0;
}

.reflection-country-dropdown__option {
  padding: 0.55rem 0.85rem;
  font-size: clamp(0.92rem, 1.25vw, 1rem);
  font-weight: 300;
  letter-spacing: 0.02em;
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
}

.reflection-country-dropdown__menu--2-cols .reflection-country-dropdown__option,
.reflection-country-dropdown__menu--3-cols .reflection-country-dropdown__option {
  white-space: normal;
}

.reflection-country-dropdown__option:hover,
.reflection-country-dropdown__option--selected {
  background: color-mix(in srgb, currentColor 6%, transparent);
}
</style>
