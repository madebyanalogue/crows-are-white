<template>
  <div ref="fallRef" class="stack-cover-tear-three__fall">
    <canvas
      ref="canvasRef"
      class="stack-cover-tear-three__canvas"
      aria-hidden="true"
    />
  </div>
</template>

<script setup>
const VIEW_W = 123.6
const VIEW_H = 175
const FRUSTUM_PAD = {
  left: 0,
  right: 150,
  top: 50,
  bottom: 120,
}
const FALL_DISTANCE_PERCENT = 160
const canvasStyleTop = `-${(FRUSTUM_PAD.top / VIEW_H) * 100}%`
const canvasStyleLeft = `-${(FRUSTUM_PAD.left / VIEW_W) * 100}%`
const canvasStyleWidth = `${((VIEW_W + FRUSTUM_PAD.left + FRUSTUM_PAD.right) / VIEW_W) * 100}%`
const canvasStyleHeight = `${((VIEW_H + FRUSTUM_PAD.top + FRUSTUM_PAD.bottom) / VIEW_H) * 100}%`
const SEGMENT_COUNT = 25
const SEGMENT_HEIGHT = 7
const SPINE_X = 94.7
const SEGMENT_STAGGER = 0.65
const LINK_ROTATION_Z = 7
const LINK_ROTATION_X = 18
const STRIP_ROOT_Y = SEGMENT_COUNT * SEGMENT_HEIGHT

const canvasRef = ref(null)
const fallRef = ref(null)
let renderer = null
let scene = null
let camera = null
let links = []
let resizeObserver = null
let peelProgress = 0
let fallProgress = 0
let disposed = false
let threeLib = null

function getLinkProgress(completion, index, total) {
  if (completion <= 0 || total <= 0) return 0

  const segmentStart = total <= 1 ? 0 : (index / (total - 1)) * SEGMENT_STAGGER
  const local = Math.max(0, Math.min(1, (completion - segmentStart) / (1 - SEGMENT_STAGGER)))
  return local * local
}

const STRIP_COLOR_FRONT = 0x2563eb
const STRIP_COLOR_BACK = 0xdc2626

// SVG segment polygon relative to spine top-left (94.7, 0), y-flipped for inverted strip
const SEGMENT_SHAPE_POINTS = [
  [1.65, 0],
  [4.35, 0],
  [6, 1.65],
  [6, 7],
  [0, 7],
  [0, 1.65],
]

function updateLinks() {
  if (!threeLib || !links.length) return

  links.forEach((link, index) => {
    const staggerIndex = links.length - 1 - index
    const eased = getLinkProgress(peelProgress, staggerIndex, links.length)

    link.rotation.z = threeLib.MathUtils.degToRad(-LINK_ROTATION_Z * eased)
    link.rotation.x = threeLib.MathUtils.degToRad(LINK_ROTATION_X * eased)
  })
}

function updateFall() {
  if (!fallRef.value) return

  const eased = fallProgress * fallProgress
  const offset = eased * FALL_DISTANCE_PERCENT
  fallRef.value.style.transform = offset > 0 ? `translate3d(0, ${offset}%, 0)` : ''
}

function render() {
  if (!renderer || !scene || !camera) return
  renderer.render(scene, camera)
}

function updateCamera() {
  if (!camera) return

  camera.left = -FRUSTUM_PAD.left
  camera.right = VIEW_W + FRUSTUM_PAD.right
  camera.top = VIEW_H + FRUSTUM_PAD.top
  camera.bottom = -FRUSTUM_PAD.bottom
  camera.updateProjectionMatrix()
}

function resize() {
  if (!renderer || !camera || !canvasRef.value) return

  const canvas = canvasRef.value
  const { width, height } = canvas.getBoundingClientRect()
  if (!width || !height) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)
  updateCamera()

  render()
}

function setPeelProgress(value) {
  peelProgress = Math.max(0, Math.min(1, value))
  updateLinks()
  render()
}

function setFallProgress(value) {
  fallProgress = Math.max(0, Math.min(1, value))
  updateFall()
  render()
}

function reset() {
  setFallProgress(0)
  setPeelProgress(0)
}

function createSegmentGeometry(THREE) {
  const shape = new THREE.Shape()
  const [firstX, firstY] = SEGMENT_SHAPE_POINTS[0]

  shape.moveTo(firstX, firstY)
  SEGMENT_SHAPE_POINTS.slice(1).forEach(([x, y]) => {
    shape.lineTo(x, y)
  })
  shape.closePath()

  return new THREE.ShapeGeometry(shape)
}

function buildStrip(THREE) {
  const frontMaterial = new THREE.MeshBasicMaterial({
    color: STRIP_COLOR_FRONT,
    side: THREE.FrontSide,
  })
  const backMaterial = new THREE.MeshBasicMaterial({
    color: STRIP_COLOR_BACK,
    side: THREE.BackSide,
  })

  const yFlip = new THREE.Group()
  yFlip.scale.y = -1
  yFlip.position.y = VIEW_H
  scene.add(yFlip)

  const stripRoot = new THREE.Group()
  stripRoot.position.set(SPINE_X, STRIP_ROOT_Y, 0)
  stripRoot.scale.y = -1
  yFlip.add(stripRoot)

  links = []

  let parent = stripRoot

  for (let index = 0; index < SEGMENT_COUNT; index += 1) {
    const link = new THREE.Group()
    const geometry = createSegmentGeometry(THREE)

    const frontMesh = new THREE.Mesh(geometry, frontMaterial)
    const backMesh = new THREE.Mesh(geometry, backMaterial)

    frontMesh.position.set(0, 0, 0)
    backMesh.position.set(0, 0, 0)
    link.add(frontMesh)
    link.add(backMesh)

    if (index === 0) {
      stripRoot.add(link)
    } else {
      parent.add(link)
      link.position.y = SEGMENT_HEIGHT
    }

    parent = link
    links.push(link)
  }
}

async function initScene() {
  if (!import.meta.client || !canvasRef.value || disposed) return

  threeLib = await import('three')
  if (disposed || !canvasRef.value) return

  const THREE = threeLib
  const canvas = canvasRef.value

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(0, VIEW_W, VIEW_H, 0, -50, 50)
  camera.position.z = 10
  updateCamera()

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.setClearColor(0x000000, 0)

  buildStrip(THREE)
  updateLinks()
  updateFall()
  resize()

  if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvas.parentElement)
  }
}

function disposeScene() {
  disposed = true
  resizeObserver?.disconnect()
  resizeObserver = null
  links = []

  if (fallRef.value) {
    fallRef.value.style.transform = ''
  }

  if (scene) {
    const geometries = new Set()
    const materials = new Set()

    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry)
      if (object.material) materials.add(object.material)
    })

    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
  threeLib = null
}

onMounted(() => {
  disposed = false
  initScene()
})

onUnmounted(() => {
  disposeScene()
})

defineExpose({
  setPeelProgress,
  setFallProgress,
  reset,
  resize,
})
</script>

<style scoped>
.stack-cover-tear-three__fall {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}

.stack-cover-tear-three__canvas {
  position: absolute;
  top: v-bind(canvasStyleTop);
  left: v-bind(canvasStyleLeft);
  width: v-bind(canvasStyleWidth);
  height: v-bind(canvasStyleHeight);
  display: block;
  pointer-events: none;
}
</style>
