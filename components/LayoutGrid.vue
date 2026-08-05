<template>
  <div
    v-if="visible"
    class="layout-grid"
    aria-hidden="true"
  >
    <div class="layout-grid__frame wrapper">
      <div class="layout-grid__columns">
        <span
          v-for="column in columns"
          :key="column"
          class="layout-grid__column"
        />
      </div>
    </div>
    <div class="layout-grid__rows" />
  </div>
</template>

<script setup>
const visible = useState('layoutGridVisible', () => false)
const columns = 24

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT'
    || tag === 'TEXTAREA'
    || tag === 'SELECT'
    || target.isContentEditable
}

function toggleGrid() {
  visible.value = !visible.value
  if (import.meta.client) {
    document.documentElement.classList.toggle('layout-grid-active', visible.value)
  }
}

function onKeydown(event) {
  if (event.key !== 'g' && event.key !== 'G') return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (isEditableTarget(event.target)) return
  event.preventDefault()
  toggleGrid()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.documentElement.classList.toggle('layout-grid-active', visible.value)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.documentElement.classList.remove('layout-grid-active')
})
</script>

<style scoped>
.layout-grid {
  --grid-columns: 24;
  position: fixed;
  inset: 0;
  z-index: 1200;
  pointer-events: none;
}

.layout-grid__frame {
  height: 100%;
  position: relative;
}

.layout-grid__columns {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 24), minmax(0, 1fr));
  height: 100%;
}

.layout-grid__column {
  border-right: 1px solid var(--grid-line-color, #ddd);
}

.layout-grid__column:first-child {
  border-left: 1px solid var(--grid-line-color, #ddd);
}

@media (max-width: 999px) {
  .layout-grid {
    --grid-columns: 6;
  }

  .layout-grid__column:nth-child(n + 7) {
    display: none;
  }
}

.layout-grid__rows {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(var(--grid-row-height) - 1px),
    var(--grid-line-color, #ddd) calc(var(--grid-row-height) - 1px),
    var(--grid-line-color, #ddd) var(--grid-row-height)
  );
  background-size: 100% var(--grid-row-height);
}
</style>
