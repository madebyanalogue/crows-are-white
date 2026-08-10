<script setup>
import { WORLD_LAND_PATH } from '~/utils/worldMapOutline'
import {
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
  buildWatchingFromMapMarkers,
  formatWatchingFromMapMarkerTooltip,
} from '~/utils/watchingFrom'

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  activeLocationId: {
    type: String,
    default: '',
  },
  selectedMarkerId: {
    type: String,
    default: '',
  },
  lightStyle: {
    type: Boolean,
    default: false,
  },
  showZoomControls: {
    type: Boolean,
    default: false,
  },
})

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_FACTOR = 1.35

const zoomLevel = ref(MIN_ZOOM)
const panOffset = ref({ x: 0, y: 0 })

const emit = defineEmits(['select-marker'])

const diagramRef = ref(null)
const diagramSize = ref({ width: 0, height: 0 })
const hoveredMarker = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const mapMarkers = computed(() =>
  buildWatchingFromMapMarkers(props.locations, {
    ...diagramSize.value,
    zoomLevel: zoomLevel.value,
  }),
)

function isActive(marker) {
  if (props.selectedMarkerId) {
    return marker.id === props.selectedMarkerId
  }

  if (!props.activeLocationId) return false

  return marker.locations.some((location) => location.id === props.activeLocationId)
}

function isSelected(marker) {
  return Boolean(props.selectedMarkerId) && marker.id === props.selectedMarkerId
}

function markerOpacity() {
  return 1
}

function markerRadius(marker) {
  if (marker.isCluster) {
    if (isSelected(marker)) return 3.6
    if (isActive(marker)) return 3.2
    return 2.6
  }

  if (isSelected(marker)) return 3.2
  if (isActive(marker)) return 2.8
  return 1.8
}

function markerHitRadius(marker) {
  return marker.isCluster ? 8 : 6
}

function selectMarker(marker) {
  if (dragDidMove.value) {
    dragDidMove.value = false
    return
  }

  emit('select-marker', marker)
}

function tooltipLines(marker) {
  return formatWatchingFromMapMarkerTooltip(marker)
}

function updateTooltipPosition(event) {
  const bounds = diagramRef.value?.getBoundingClientRect()
  if (!bounds) return

  tooltipPosition.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

function showTooltip(marker, event) {
  hoveredMarker.value = marker
  updateTooltipPosition(event)
}

function moveTooltip(event) {
  if (!hoveredMarker.value) return
  updateTooltipPosition(event)
}

function hideTooltip() {
  hoveredMarker.value = null
}

function updateDiagramSize() {
  const bounds = diagramRef.value?.getBoundingClientRect()
  if (!bounds) return

  diagramSize.value = {
    width: bounds.width,
    height: bounds.height,
  }
}

function clampPanOffset() {
  const visibleWidth = MAP_VIEWBOX_WIDTH / zoomLevel.value
  const visibleHeight = MAP_VIEWBOX_HEIGHT / zoomLevel.value
  const maxPanX = Math.max(0, (MAP_VIEWBOX_WIDTH - visibleWidth) / 2)
  const maxPanY = Math.max(0, (MAP_VIEWBOX_HEIGHT - visibleHeight) / 2)

  panOffset.value = {
    x: Math.min(Math.max(panOffset.value.x, -maxPanX), maxPanX),
    y: Math.min(Math.max(panOffset.value.y, -maxPanY), maxPanY),
  }
}

const mapViewBox = computed(() => {
  const visibleWidth = MAP_VIEWBOX_WIDTH / zoomLevel.value
  const visibleHeight = MAP_VIEWBOX_HEIGHT / zoomLevel.value
  const centerX = MAP_VIEWBOX_WIDTH / 2
  const centerY = MAP_VIEWBOX_HEIGHT / 2
  const x = centerX - visibleWidth / 2 + panOffset.value.x
  const y = centerY - visibleHeight / 2 + panOffset.value.y

  return `${x} ${y} ${visibleWidth} ${visibleHeight}`
})

const canZoomIn = computed(() => zoomLevel.value < MAX_ZOOM - 0.01)
const canZoomOut = computed(() => zoomLevel.value > MIN_ZOOM + 0.01)
const canPan = computed(() =>
  props.showZoomControls && zoomLevel.value > MIN_ZOOM + 0.01,
)

const isDragging = ref(false)
const dragDidMove = ref(false)
let dragStart = null
const DRAG_THRESHOLD = 4

function zoomIn() {
  if (!canZoomIn.value) return
  zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value * ZOOM_FACTOR)
  clampPanOffset()
}

function zoomOut() {
  if (!canZoomOut.value) return
  zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value / ZOOM_FACTOR)
  if (zoomLevel.value <= MIN_ZOOM + 0.01) {
    zoomLevel.value = MIN_ZOOM
    panOffset.value = { x: 0, y: 0 }
    return
  }
  clampPanOffset()
}

function onPanPointerDown(event) {
  if (!canPan.value) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  isDragging.value = true
  dragDidMove.value = false
  dragStart = {
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    panX: panOffset.value.x,
    panY: panOffset.value.y,
  }

  hideTooltip()
  diagramRef.value?.setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onPanPointerMove(event) {
  if (!isDragging.value || !dragStart || dragStart.pointerId !== event.pointerId) return

  const deltaX = event.clientX - dragStart.clientX
  const deltaY = event.clientY - dragStart.clientY

  if (!dragDidMove.value && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return

  dragDidMove.value = true

  const visibleWidth = MAP_VIEWBOX_WIDTH / zoomLevel.value
  const visibleHeight = MAP_VIEWBOX_HEIGHT / zoomLevel.value
  const width = diagramSize.value.width || 1
  const height = diagramSize.value.height || 1

  panOffset.value = {
    x: dragStart.panX - deltaX * (visibleWidth / width),
    y: dragStart.panY - deltaY * (visibleHeight / height),
  }
  clampPanOffset()
  event.preventDefault()
}

function endPan(event) {
  if (!isDragging.value || !dragStart || dragStart.pointerId !== event.pointerId) return

  isDragging.value = false
  diagramRef.value?.releasePointerCapture(event.pointerId)
  dragStart = null
}

let resizeObserver = null

onMounted(() => {
  updateDiagramSize()

  if (!import.meta.client || !diagramRef.value) return

  resizeObserver = new ResizeObserver(() => {
    updateDiagramSize()
  })
  resizeObserver.observe(diagramRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.locations,
  () => nextTick(updateDiagramSize),
  { deep: true },
)
</script>

<template>
  <div
    ref="diagramRef"
    class="watching-from-diagram"
    :class="{
      'watching-from-diagram--light': lightStyle,
      'watching-from-diagram--zoomable': showZoomControls,
      'watching-from-diagram--panning': isDragging,
      'watching-from-diagram--pannable': canPan,
    }"
    @mouseleave="hideTooltip"
    @pointerdown="onPanPointerDown"
    @pointermove="onPanPointerMove"
    @pointerup="endPan"
    @pointercancel="endPan"
  >
    <svg
      class="watching-from-diagram__svg"
      :viewBox="mapViewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of places people are watching from"
    >
      <path
        :d="WORLD_LAND_PATH"
        class="watching-from-diagram__land"
      />

      <g class="watching-from-diagram__markers">
        <g
          v-for="marker in mapMarkers"
          :key="marker.id"
          class="watching-from-diagram__marker"
          :class="{
            'watching-from-diagram__marker--cluster': marker.isCluster,
            'watching-from-diagram__marker--active': isActive(marker),
            'watching-from-diagram__marker--selected': isSelected(marker),
          }"
          @mouseenter="showTooltip(marker, $event)"
          @mousemove="moveTooltip"
          @mouseleave="hideTooltip"
          @click="selectMarker(marker)"
        >
          <circle
            :cx="marker.x"
            :cy="marker.y"
            :r="markerHitRadius(marker)"
            class="watching-from-diagram__marker-hit"
          />

          <circle
            :cx="marker.x"
            :cy="marker.y"
            :r="markerRadius(marker)"
            class="watching-from-diagram__marker-dot"
            :opacity="markerOpacity()"
          />

          <circle
            v-if="marker.isCluster"
            :cx="marker.x"
            :cy="marker.y"
            :r="markerRadius(marker) + 1.8"
            class="watching-from-diagram__marker-ring"
            :opacity="isSelected(marker) || isActive(marker) ? 0.55 : 0.35"
          />

          <circle
            v-else-if="isActive(marker) || isSelected(marker)"
            :cx="marker.x"
            :cy="marker.y"
            r="5.5"
            class="watching-from-diagram__marker-ring"
            :opacity="0.35"
          />
        </g>
      </g>
    </svg>

    <div
      v-if="showZoomControls"
      class="watching-from-diagram__zoom"
      aria-label="Map zoom controls"
    >
      <button
        type="button"
        class="watching-from-diagram__zoom-button watching-from-diagram__zoom-button--out serif"
        :disabled="!canZoomOut"
        aria-label="Zoom out"
        @click.stop="zoomOut"
      >
        −
      </button>
      <button
        type="button"
        class="watching-from-diagram__zoom-button watching-from-diagram__zoom-button--in serif"
        :disabled="!canZoomIn"
        aria-label="Zoom in"
        @click.stop="zoomIn"
      >
        +
      </button>
    </div>

    <div
      v-if="hoveredMarker"
      class="watching-from-diagram__tooltip serif"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }"
      role="tooltip"
    >
      <span class="watching-from-diagram__tooltip-line">{{ tooltipLines(hoveredMarker).primary }}</span>
      <span
        v-if="tooltipLines(hoveredMarker).secondary"
        class="watching-from-diagram__tooltip-line watching-from-diagram__tooltip-line--secondary"
      >
        {{ tooltipLines(hoveredMarker).secondary }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.watching-from-diagram {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  border: 1px dashed color-mix(in srgb, currentColor 24%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.watching-from-diagram__svg {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
}

.watching-from-diagram__land {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.55;
  vector-effect: non-scaling-stroke;
  opacity: 0.34;
}

.watching-from-diagram--light .watching-from-diagram__land {
  stroke: #fff;
  opacity: 0.4;
}

.watching-from-diagram--light .watching-from-diagram__marker-dot {
  fill: #fff;
}

.watching-from-diagram--light .watching-from-diagram__marker-ring {
  stroke: #fff;
}

.watching-from-diagram__marker {
  cursor: pointer;
}

.watching-from-diagram__marker-hit {
  fill: transparent;
  pointer-events: all;
}

.watching-from-diagram__marker-dot {
  fill: currentColor;
  pointer-events: none;
  transition:
    opacity 0.25s ease,
    r 0.25s ease;
}

.watching-from-diagram__marker-ring {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.55;
  pointer-events: none;
  vector-effect: non-scaling-stroke;
  transition: opacity 0.25s ease;
}

.watching-from-diagram__tooltip {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, calc(-100% - 10px));
  display: grid;
  gap: 0.2rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, var(--page-color, #f7f6f4) 92%, transparent);
  color: inherit;
  font-size: 0.72rem;
  font-weight: 300;
  letter-spacing: 0.03em;
  line-height: 1.35;
  max-width: min(16rem, 70vw);
  pointer-events: none;
}

.watching-from-diagram__tooltip-line {
  display: block;
  white-space: nowrap;
}

.watching-from-diagram__tooltip-line--secondary {
  opacity: 0.72;
  white-space: normal;
}

.watching-from-diagram--zoomable {
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.watching-from-diagram--pannable {
  cursor: grab;
}

.watching-from-diagram--panning {
  cursor: grabbing;
}

.watching-from-diagram--panning .watching-from-diagram__marker {
  cursor: grabbing;
}

.watching-from-diagram__zoom {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(2, 50px);
  gap: 0;
  pointer-events: none;
}

.watching-from-diagram__zoom-button {
  pointer-events: auto;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  margin: 0;
  padding: 0;
  border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
  background: color-mix(in srgb, var(--page-color, #f7f6f4) 88%, transparent);
  color: inherit;
  font-size: 1.25rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.watching-from-diagram__zoom-button--out {
  grid-column: 1;
}

.watching-from-diagram__zoom-button--in {
  grid-column: 2;
  border-left: 0;
}

.watching-from-diagram--light .watching-from-diagram__zoom-button {
  border-color: color-mix(in srgb, #fff 34%, transparent);
  background: color-mix(in srgb, #000 42%, transparent);
  color: #fff;
}

.watching-from-diagram__zoom-button:hover:not(:disabled) {
  opacity: 0.72;
}

.watching-from-diagram__zoom-button:disabled {
  opacity: 0.35;
  cursor: default;
}
</style>
