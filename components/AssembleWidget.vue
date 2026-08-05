<template>
  <div ref="mountRef" class="assemble-widget-mount" />
</template>

<script setup>
const ASSEMBLE_SETUP_SRC = 'https://widget.assemble.film/setup'
const ASSEMBLE_SCRIPT_ID = 'assemble-widget-v5'

const props = defineProps({
  filmIds: {
    type: String,
    required: true,
  },
  countries: {
    type: Array,
    default: () => [],
  },
  tabs: {
    type: Array,
    default: () => ['local', 'cities', 'playdates'],
  },
  stylePreset: {
    type: String,
    default: 'basic',
  },
  primaryColor: {
    type: String,
    default: '#00aacc',
  },
  secondaryColor: {
    type: String,
    default: '#666666',
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  mxId: {
    type: String,
    default: '',
  },
})

const mountRef = ref(null)
let scriptEl = null

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function setAttr(el, name, value) {
  if (value == null || value === '') {
    el.removeAttribute(name)
    return
  }
  el.setAttribute(name, value)
}

function destroyWidget() {
  if (!mountRef.value) {
    scriptEl = null
    return
  }

  mountRef.value.replaceChildren()
  scriptEl = null
}

function mountWidget() {
  if (!import.meta.client || !mountRef.value) return

  const film = String(props.filmIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id))
    .join(', ')

  if (!film) return

  destroyWidget()

  const script = document.createElement('script')
  script.src = ASSEMBLE_SETUP_SRC
  script.id = ASSEMBLE_SCRIPT_ID
  script.async = true

  setAttr(script, 'data-film', film)
  setAttr(script, 'data-countries', normalizeList(props.countries).join(', '))
  setAttr(script, 'data-tabs', normalizeList(props.tabs).join(',') || 'local')
  setAttr(script, 'data-style', props.stylePreset || 'basic')
  setAttr(script, 'data-primary', props.primaryColor || '#00aacc')
  setAttr(script, 'data-secondary', props.secondaryColor || '#666666')
  setAttr(script, 'data-background', props.backgroundColor || '#ffffff')
  setAttr(script, 'data-mx-id', String(props.mxId || '').trim())

  scriptEl = script
  mountRef.value.appendChild(script)
}

onMounted(() => {
  mountWidget()
})

onBeforeUnmount(() => {
  destroyWidget()
})

watch(
  () => [
    props.filmIds,
    props.countries,
    props.tabs,
    props.stylePreset,
    props.primaryColor,
    props.secondaryColor,
    props.backgroundColor,
    props.mxId,
  ],
  () => {
    mountWidget()
  },
)
</script>

<style scoped>
.assemble-widget-mount {
  width: 100%;
  min-height: 1px;
}

.assemble-widget-mount :deep(.assemble-widget-container) {
  width: 100%;
}
</style>
