import { resolveOwnersKeys } from '~/utils/ownersKeys'

export const OWNERS_KEY_SET_CONFIGS = [
  [
    { angle: -34, restAngle: -8, scale: 1 },
    { angle: -10, restAngle: 0, scale: 1.04 },
    { angle: 26, restAngle: 7, scale: 0.96 },
  ],
  [
    { angle: -44, restAngle: -9, scale: 1 },
    { angle: -20, restAngle: -4, scale: 0.94 },
    { angle: 18, restAngle: 4, scale: 1 },
    { angle: 42, restAngle: 9, scale: 0.9 },
  ],
  [
    { angle: -48, restAngle: -10, scale: 1 },
    { angle: -26, restAngle: -5, scale: 0.96 },
    { angle: -6, restAngle: 0, scale: 1.06 },
    { angle: 22, restAngle: 5, scale: 0.92 },
    { angle: 46, restAngle: 10, scale: 0.86 },
  ],
]

let gsapModulesPromise = null

function getGsapModules() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapModulesPromise) {
    gsapModulesPromise = Promise.all([
      import('gsap'),
      import('gsap/Draggable'),
      import('gsap/InertiaPlugin'),
    ]).then(([{ default: gsap }, { Draggable }, { InertiaPlugin }]) => {
      gsap.registerPlugin(Draggable, InertiaPlugin)
      return { gsap, Draggable, InertiaPlugin }
    })
  }
  return gsapModulesPromise
}

function createKeyStatesForSet(item, setIndex) {
  const keys = resolveOwnersKeys(item ?? {}, setIndex)
  return keys.map((key) => ({
    restAngle: key.restAngle,
    angle: key.restAngle,
    velocity: 0,
  }))
}

function createKeyStates(setIndex) {
  const config = OWNERS_KEY_SET_CONFIGS[setIndex % OWNERS_KEY_SET_CONFIGS.length]
  return config.map((key) => ({
    restAngle: key.restAngle,
    angle: key.restAngle,
    velocity: 0,
  }))
}

function getSlideWidth(viewport) {
  return viewport?.clientWidth || 0
}

function getActiveIndex(trackX, slideWidth, count) {
  if (!slideWidth || count <= 1) return 0
  const index = Math.round(-trackX / slideWidth)
  return Math.max(0, Math.min(count - 1, index))
}

function getCenterProximity(trackX, slideWidth, count) {
  if (!slideWidth || count <= 0) return 1
  const index = -trackX / slideWidth
  const nearest = Math.round(index)
  const distance = Math.abs(index - nearest)
  return Math.max(0, 1 - distance * 1.35)
}

export function useOwnersCarousel({
  viewportRef,
  trackRef,
  keyRefs,
  itemCount,
  displayItems,
  onActiveChange,
  enabled,
}) {
  let gsap = null
  let Draggable = null
  let InertiaPlugin = null
  let draggable = null
  let resizeObserver = null
  let settleTweens = []
  let keyStates = []
  let slideWidth = 0
  let activeIndex = 0

  function getKeyElements() {
    return keyRefs.value.map((set) => (set || []).filter(Boolean))
  }

  function initKeyStates(count) {
    keyStates = Array.from({ length: count }, (_, setIndex) => {
      const item = displayItems?.value?.[setIndex]
      return item
        ? createKeyStatesForSet(item, setIndex)
        : createKeyStates(setIndex)
    })
  }

  function applyKeyRotation(setIndex, keyIndex, angle) {
    const el = keyRefs.value[setIndex]?.[keyIndex]
    if (!el) return
    gsap.set(el, {
      rotation: angle,
      transformOrigin: '50% 16.666%',
    })
  }

  function updatePhysics(velocityX) {
    keyStates.forEach((setState, setIndex) => {
      setState.forEach((state, keyIndex) => {
        const lag = 1 + keyIndex * 0.2
        const target = state.restAngle - velocityX * 0.016 * lag
        state.velocity += (target - state.angle) * 0.1
        state.angle += state.velocity
        state.velocity *= 0.74
        applyKeyRotation(setIndex, keyIndex, state.angle)
      })
    })
  }

  function relaxKeys() {
    settleTweens.forEach((tween) => tween.kill())
    settleTweens = []

    keyStates.forEach((setState, setIndex) => {
      setState.forEach((state, keyIndex) => {
        const tween = gsap.to(state, {
          angle: state.restAngle,
          velocity: 0,
          duration: 1.75,
          ease: 'elastic.out(1, 0.28)',
          onUpdate() {
            applyKeyRotation(setIndex, keyIndex, state.angle)
          },
        })
        settleTweens.push(tween)
      })
    })
  }

  function emitActiveState(trackX) {
    const count = itemCount.value
    const nextIndex = getActiveIndex(trackX, slideWidth, count)
    const proximity = getCenterProximity(trackX, slideWidth, count)

    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex
    }

    onActiveChange?.({
      index: activeIndex,
      copyOpacity: proximity,
    })
  }

  function syncSlideWidth() {
    if (!viewportRef.value) return 0

    slideWidth = getSlideWidth(viewportRef.value)
    if (slideWidth <= 0) {
      slideWidth = viewportRef.value.getBoundingClientRect().width
    }
    return slideWidth
  }

  function updateBounds() {
    if (!draggable || !viewportRef.value) return

    syncSlideWidth()
    const count = itemCount.value
    const minX = count > 1 ? -(slideWidth * (count - 1)) : 0

    draggable.applyBounds({ minX, maxX: 0 })
    draggable.update(true)

    const currentX = gsap.getProperty(trackRef.value, 'x')
    const snappedX = -getActiveIndex(currentX, slideWidth, count) * slideWidth
    gsap.set(trackRef.value, { x: snappedX })
    emitActiveState(snappedX)
  }

  function setupDraggable() {
    if (!enabled.value || !trackRef.value || !viewportRef.value) {
      return
    }

    syncSlideWidth()
    const count = itemCount.value
    const minX = count > 1 ? -(slideWidth * (count - 1)) : 0

    draggable = Draggable.create(trackRef.value, {
      type: 'x',
      inertia: true,
      edgeResistance: 0.82,
      throwResistance: 5500,
      bounds: { minX, maxX: 0 },
      snap: {
        x(value) {
          const width = getSlideWidth(viewportRef.value)
          const index = Math.round(-value / width)
          return -index * width
        },
      },
      onDrag() {
        const vx = InertiaPlugin.getVelocity(trackRef.value, 'x')
        updatePhysics(vx)
        emitActiveState(this.x)
      },
      onThrowUpdate() {
        const vx = InertiaPlugin.getVelocity(trackRef.value, 'x')
        updatePhysics(vx)
        emitActiveState(this.x)
      },
      onDragEnd() {
        relaxKeys()
        emitActiveState(this.x)
      },
      onThrowComplete() {
        relaxKeys()
        emitActiveState(this.x)
      },
    })[0]

    emitActiveState(gsap.getProperty(trackRef.value, 'x'))
  }

  function destroyDraggable() {
    settleTweens.forEach((tween) => tween.kill())
    settleTweens = []
    draggable?.kill()
    draggable = null
  }

  async function init() {
    const modules = await getGsapModules()
    if (!modules) return

    gsap = modules.gsap
    Draggable = modules.Draggable
    InertiaPlugin = modules.InertiaPlugin

    initKeyStates(itemCount.value)

    keyStates.forEach((setState, setIndex) => {
      setState.forEach((state, keyIndex) => {
        applyKeyRotation(setIndex, keyIndex, state.restAngle)
      })
    })

    if (enabled.value) {
      syncSlideWidth()
      setupDraggable()
    } else {
      onActiveChange?.({ index: 0, copyOpacity: 1 })
    }

    if (viewportRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (enabled.value) {
          updateBounds()
        } else {
          syncSlideWidth()
        }
      })
      resizeObserver.observe(viewportRef.value)
    }
  }

  function teardown() {
    destroyDraggable()
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  watch(enabled, (isEnabled) => {
    if (!gsap) return
    if (isEnabled) {
      syncSlideWidth()
      setupDraggable()
    } else {
      destroyDraggable()
      if (trackRef.value) {
        gsap.set(trackRef.value, { x: 0 })
      }
      onActiveChange?.({ index: 0, copyOpacity: 1 })
    }
  })

  watch(itemCount, () => {
    if (!gsap) return
    initKeyStates(itemCount.value)
    destroyDraggable()
    setupDraggable()
  })

  onMounted(() => {
    if (!import.meta.client) return
    init()
  })

  onUnmounted(() => {
    teardown()
  })

  return {
    keySetConfigs: OWNERS_KEY_SET_CONFIGS,
  }
}
