import gsap from 'gsap'

function resolveExposedRef(exposed) {
  if (!exposed) return null
  if (exposed instanceof Element) return exposed
  if (typeof exposed === 'object' && 'value' in exposed) {
    return exposed.value instanceof Element ? exposed.value : null
  }
  return null
}

function gsapSet(target, vars) {
  if (!target) return

  if (Array.isArray(target)) {
    const validTargets = target.filter(Boolean)
    if (!validTargets.length) return
    gsap.set(validTargets, vars)
    return
  }

  gsap.set(target, vars)
}

export function useCinematicVideoExperience(getConfig, refs, options = {}) {
  const {
    onOpen,
    onClose,
    beforeOpen,
    canOpen = () => true,
    extendOpenTimeline,
    extendCloseTimeline,
  } = options

  const isOpen = ref(false)
  const isOpening = ref(false)
  const playerReady = ref(false)

  let openToken = 0
  let controlsTween = null
  let overlayTween = null
  let controlsHovered = false

  const mediaComponentRef = refs.mediaComponentRef

  const player = useCinematicVideoPlayer(getConfig, mediaComponentRef, {
    onEnded: () => { close() },
  })

  function chromeUiRefs() {
    const items = controlUiRefs()
    const closeBtn = resolveExposedRef(refs.closeRef)
    if (closeBtn) items.push(closeBtn)
    return items
  }

  function fadeOverlayOut() {
    const overlay = refs.overlayRef?.value
    if (!overlay || !isOpen.value) return

    if (overlayTween) overlayTween.kill()

    overlayTween = gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        overlayTween = null
      },
    })
  }

  function fadeControls(show) {
    const targets = chromeUiRefs()
    if (!targets.length || !isOpen.value) return

    if (controlsTween) controlsTween.kill()

    controlsTween = gsap.to(targets, {
      autoAlpha: show ? 1 : 0,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => {
        controlsTween = null
      },
    })
  }

  function updateControlsVisibility() {
    if (!isOpen.value || isOpening.value) return
    const shouldShow = controlsHovered || !player.isPlaying.value
    fadeControls(shouldShow)
  }

  function onDialogEnter() {
    controlsHovered = true
    updateControlsVisibility()
  }

  function onDialogLeave() {
    controlsHovered = false
    updateControlsVisibility()
  }

  watch(
    () => player.isPlaying.value,
    (playing) => {
      updateControlsVisibility()
      if (playing && isOpen.value) fadeOverlayOut()
    },
  )

  function controlUiRefs() {
    const controls = refs.controlsRef?.value
    if (!controls) return []

    return [
      resolveExposedRef(controls.uiPlayRef),
      resolveExposedRef(controls.uiProgressRef),
      resolveExposedRef(controls.uiSoundRef),
    ].filter(Boolean)
  }

  function startOpenAnimation(token) {
    const overlay = refs.overlayRef?.value
    const thumbnail = refs.thumbnailRef?.value
    const dialog = refs.dialogRef?.value
    const darken = refs.darkenRef?.value
    const shell = player.mediaFadeTarget()

    gsapSet(darken, { scale: 1, autoAlpha: 0 })
    if (shell) gsapSet(shell, { autoAlpha: 1 })
    if (overlay) gsapSet(overlay, { autoAlpha: 1 })

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        if (token === openToken) {
          isOpening.value = false
          updateControlsVisibility()
        }
      },
    })

    const controls = controlUiRefs()

    if (dialog) tl.to(dialog, { autoAlpha: 1, duration: 0.35 }, 0)
    if (darken) tl.to(darken, { autoAlpha: 0.9, scale: 4, duration: 0.55 }, 0.2)
    if (thumbnail) tl.to(thumbnail, { autoAlpha: 0, duration: 0.35 }, 0.25)
    if (controls.length) {
      tl.to(
        controls,
        { autoAlpha: 1, yPercent: 0, stagger: 0.12, duration: 0.5 },
        0.4,
      )
    }

    extendOpenTimeline?.(tl, token)
  }

  async function open() {
    if (isOpen.value || isOpening.value || !canOpen()) return false
    const token = ++openToken
    isOpening.value = true
    controlsHovered = false

    await beforeOpen?.()
    if (token !== openToken) {
      isOpening.value = false
      return false
    }

    isOpen.value = true
    playerReady.value = true
    await nextTick()

    startOpenAnimation(token)
    onOpen?.()

    const playerSession = player.primePlayer()
    if (player.isNative()) player.play()

    void (async () => {
      if (token !== openToken) return
      await player.completeEmbedPlayer(playerSession)
    })()

    return true
  }

  async function close() {
    if (!isOpen.value || isOpening.value) return
    openToken += 1
    isOpening.value = true
    controlsHovered = false
    if (controlsTween) {
      controlsTween.kill()
      controlsTween = null
    }
    if (overlayTween) {
      overlayTween.kill()
      overlayTween = null
    }

    player.pause()
    onClose?.()

    const overlay = refs.overlayRef?.value
    const thumbnail = refs.thumbnailRef?.value
    const dialog = refs.dialogRef?.value
    const darken = refs.darkenRef?.value
    const shell = player.mediaFadeTarget()

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        player.destroyPlayer()
        player.resetUi()
        playerReady.value = false
        isOpen.value = false
        isOpening.value = false
        gsapSet(overlay, { clearProps: 'opacity,visibility' })
        gsapSet(thumbnail, { clearProps: 'opacity,visibility' })
        gsapSet(dialog, { clearProps: 'opacity,visibility' })
        gsapSet(shell, { clearProps: 'opacity,visibility,transform' })
        gsapSet(darken, { clearProps: 'opacity,visibility,transform' })
      },
    })

    const controls = controlUiRefs()

    if (controls.length) {
      tl.to(controls, { autoAlpha: 0, yPercent: 150, duration: 0.3 }, 0)
    }
    extendCloseTimeline?.(tl)
    if (thumbnail) tl.to(thumbnail, { autoAlpha: 1, duration: 0.25 }, 0)
    if (shell) tl.to(shell, { autoAlpha: 0, duration: 0.22 }, 0)
    if (dialog) tl.to(dialog, { autoAlpha: 0, duration: 0.22 }, 0)
    if (darken) tl.to(darken, { autoAlpha: 0, scale: 1, duration: 0.28 }, 0)
    if (overlay) tl.to(overlay, { autoAlpha: 1, duration: 0.25 }, 0.08)
  }

  function stop() {
    close()
  }

  function setupInitialState() {
    nextTick(() => {
      nextTick(() => {
        gsapSet(refs.dialogRef?.value, { autoAlpha: 0 })
        gsapSet(refs.darkenRef?.value, { autoAlpha: 0 })
        gsapSet(controlUiRefs(), { autoAlpha: 0, yPercent: 150 })
        const shell = player.mediaFadeTarget()
        if (shell) gsapSet(shell, { autoAlpha: 0 })
        gsapSet(refs.thumbnailRef?.value, { autoAlpha: 1 })
        gsapSet(refs.overlayRef?.value, { autoAlpha: 1 })
      })
    })
  }

  onBeforeUnmount(() => {
    openToken += 1
    player.destroyPlayer()
  })

  return {
    isOpen,
    isOpening,
    playerReady,
    open,
    close,
    stop,
    setupInitialState,
    onDialogEnter,
    onDialogLeave,
    ...player,
  }
}
