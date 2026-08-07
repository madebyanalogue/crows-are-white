import {
  buildVimeoPlayerUrl,
  buildYoutubeEmbedUrl,
  formatVideoTime,
  parseVimeoData,
  resolveCinematicProvider,
  VIMEO_CINEMATIC_PARAMS,
} from '~/utils/videoRuntime'

function resolveExposedRef(exposed) {
  if (!exposed) return null
  if (exposed instanceof Element) return exposed
  if (typeof exposed === 'object' && 'value' in exposed) {
    return exposed.value instanceof Element ? exposed.value : null
  }
  return null
}

const fullscreenSubscribers = new Set()
let fullscreenListenersBound = false

function notifyFullscreenSubscribers() {
  fullscreenSubscribers.forEach((handler) => handler())
}

function ensureFullscreenListeners() {
  if (!import.meta.client || fullscreenListenersBound) return
  document.addEventListener('fullscreenchange', notifyFullscreenSubscribers)
  document.addEventListener('webkitfullscreenchange', notifyFullscreenSubscribers)
  fullscreenListenersBound = true
}

export function useCinematicVideoPlayer(getConfig, mediaComponentRef, playerOptions = {}) {
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const isFullscreen = ref(false)
  const currentLabel = ref('0:00')
  const totalLabel = ref('0:00')
  const progressPct = ref(0)

  let player = null
  let scrubbing = false
  let playerSession = 0
  let pendingPlayHandler = null
  let fullscreenTarget = null

  function syncFullscreenState() {
    const activeElement = document.fullscreenElement
      || document.webkitFullscreenElement
      || null

    isFullscreen.value = Boolean(
      player?.fullscreen?.active
      || (activeElement && (
        activeElement === fullscreenTarget
        || fullscreenTarget?.contains(activeElement)
      )),
    )
  }

  ensureFullscreenListeners()
  fullscreenSubscribers.add(syncFullscreenState)

  function clearPendingPlay() {
    if (!pendingPlayHandler) return
    const { video, handler } = pendingPlayHandler
    video?.removeEventListener?.('canplay', handler)
    pendingPlayHandler = null
  }

  function bumpPlayerSession() {
    playerSession += 1
    return playerSession
  }

  function isPlayerSessionActive(session) {
    return session === playerSession
  }

  function getMediaRefs() {
    return mediaComponentRef?.value || {}
  }

  function getMediaElements() {
    const refs = getMediaRefs()
    return {
      videoEl: resolveExposedRef(refs.videoElRef),
      plyrHost: resolveExposedRef(refs.plyrHostRef),
      videoShell: resolveExposedRef(refs.videoShellRef),
      plyrShell: resolveExposedRef(refs.plyrShellRef),
    }
  }

  function getResolvedConfig() {
    const raw = typeof getConfig === 'function' ? getConfig() : getConfig
    const vimeoData = raw.vimeoId
      ? { id: raw.vimeoId, hash: raw.vimeoHash || null }
      : parseVimeoData(raw.vimeoUrl)

    return {
      provider: resolveCinematicProvider({
        ...raw,
        vimeoId: vimeoData?.id || raw.vimeoId,
      }),
      videoSrc: raw.videoSrc || '',
      youtubeId: raw.youtubeId || '',
      vimeoId: vimeoData?.id || '',
      vimeoHash: vimeoData?.hash || null,
      iframeTitle: raw.iframeTitle || 'Video',
    }
  }

  function isNative() {
    return getResolvedConfig().provider === 'native'
  }

  function mediaFadeTarget() {
    const { videoShell, plyrShell } = getMediaElements()
    return isNative() ? videoShell : plyrShell
  }

  function setDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return
    totalLabel.value = formatVideoTime(seconds)
    const raw = typeof getConfig === 'function' ? getConfig() : getConfig
    raw.onDuration?.(Math.round(seconds))
  }

  function syncProgress(current, duration) {
    currentLabel.value = formatVideoTime(current)
    if (Number.isFinite(duration) && duration > 0) {
      progressPct.value = (current / duration) * 100
    }
  }

  function stopEmbedIframe() {
    const { plyrHost } = getMediaElements()
    const iframe = plyrHost?.querySelector?.('iframe')
    if (iframe) iframe.src = 'about:blank'
  }

  function stopMediaElements() {
    clearPendingPlay()

    stopEmbedIframe()

    if (player) {
      try {
        player.pause()
      } catch {
        // ignore
      }
      try {
        player.destroy()
      } catch {
        // already destroyed
      }
      player = null
    }

    stopEmbedIframe()

    const { videoEl } = getMediaElements()
    if (videoEl) {
      videoEl.pause()
      videoEl.currentTime = 0
      videoEl.removeAttribute('src')
      videoEl.load()
    }
  }

  function destroyPlayer() {
    bumpPlayerSession()
    exitFullscreen()
    fullscreenSubscribers.delete(syncFullscreenState)
    stopMediaElements()
  }

  function handleEnded() {
    playerOptions.onEnded?.()
  }

  function bindNativeVideo(video) {
    video.controls = false
    video.playsInline = true

    const onMeta = () => setDuration(video.duration)
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()

    video.addEventListener('timeupdate', () => {
      if (!scrubbing) syncProgress(video.currentTime, video.duration)
    })
    video.addEventListener('play', () => {
      isPlaying.value = true
    })
    video.addEventListener('pause', () => {
      isPlaying.value = false
    })
    video.addEventListener('volumechange', () => {
      isMuted.value = video.muted || video.volume === 0
    })
    video.addEventListener('ended', handleEnded)
  }

  function primePlayer() {
    const session = bumpPlayerSession()
    stopMediaElements()
    if (!import.meta.client) return session

    const config = getResolvedConfig()
    const { videoEl, plyrHost } = getMediaElements()

    if (config.provider === 'native') {
      const video = videoEl
      if (!video) return session
      if (!video.getAttribute('src') && config.videoSrc) {
        video.src = config.videoSrc
      }
      bindNativeVideo(video)
      return session
    }

    const host = plyrHost
    if (!host) return session

    const iframe = host.querySelector('iframe')

    if (config.provider === 'youtube' && config.youtubeId && iframe) {
      iframe.src = buildYoutubeEmbedUrl(config.youtubeId, { autoplay: '0' })
      iframe.title = config.iframeTitle
    } else if (config.provider === 'vimeo' && config.vimeoId && iframe) {
      iframe.src = buildVimeoPlayerUrl(
        { id: config.vimeoId, hash: config.vimeoHash },
        { ...VIMEO_CINEMATIC_PARAMS, autoplay: 0 },
      )
      iframe.title = config.iframeTitle
    }

    return session
  }

  async function completeEmbedPlayer(session = playerSession) {
    if (!import.meta.client || isNative()) return
    if (!isPlayerSessionActive(session)) return

    const config = getResolvedConfig()
    const { plyrHost } = getMediaElements()
    const host = plyrHost
    if (!host || player) return

    const { default: Plyr } = await import('plyr')
    if (!isPlayerSessionActive(session)) return

    const plyrOptions = {
      autoplay: false,
      clickToPlay: false,
      hideControls: true,
      resetOnEnd: false,
      controls: [],
    }

    if (config.provider === 'youtube') {
      plyrOptions.youtube = {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      }
    } else if (config.provider === 'vimeo') {
      plyrOptions.vimeo = {
        ...VIMEO_CINEMATIC_PARAMS,
        autoplay: 0,
        byline: false,
        portrait: false,
        title: false,
        controls: false,
        dnt: true,
      }
    }

    player = new Plyr(host, plyrOptions)
    if (!isPlayerSessionActive(session)) {
      stopMediaElements()
      return
    }

    player.on('ready', () => {
      if (!isPlayerSessionActive(session)) return
      setDuration(player.duration)
      player.play()?.catch?.(() => {})
    })
    player.on('loadedmetadata', () => {
      if (!isPlayerSessionActive(session)) return
      setDuration(player.duration)
    })
    player.on('timeupdate', () => {
      if (!scrubbing) syncProgress(player.currentTime, player.duration)
    })
    player.on('play', () => {
      isPlaying.value = true
    })
    player.on('pause', () => {
      isPlaying.value = false
    })
    player.on('volumechange', () => {
      isMuted.value = Boolean(player.muted)
    })
    player.on('ended', handleEnded)
    player.on('enterfullscreen', () => {
      isFullscreen.value = true
    })
    player.on('exitfullscreen', () => {
      isFullscreen.value = false
    })
  }

  async function initPlayer() {
    const session = primePlayer()
    await completeEmbedPlayer(session)
  }

  function togglePlay(event) {
    event?.stopPropagation?.()
    const { videoEl } = getMediaElements()

    if (isNative()) {
      const video = videoEl
      if (!video) return
      if (video.paused) video.play().catch(() => {})
      else video.pause()
      return
    }
    if (!player) return
    if (player.paused) player.play()
    else player.pause()
  }

  function toggleSound(event) {
    event?.stopPropagation?.()
    const { videoEl } = getMediaElements()

    if (isNative()) {
      const video = videoEl
      if (!video) return
      video.muted = !video.muted
      isMuted.value = video.muted
      return
    }
    if (!player) return
    player.muted = !player.muted
    isMuted.value = Boolean(player.muted)
  }

  function seekFromEvent(event) {
    const scrub = event.currentTarget
    const rect = scrub.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const { videoEl } = getMediaElements()

    if (isNative()) {
      const video = videoEl
      if (!video || !Number.isFinite(video.duration)) return
      video.currentTime = ratio * video.duration
      syncProgress(video.currentTime, video.duration)
      return
    }

    if (!player || !Number.isFinite(player.duration)) return
    player.currentTime = ratio * player.duration
    syncProgress(player.currentTime, player.duration)
  }

  function onScrubDown(event) {
    event.stopPropagation()
    scrubbing = true
    seekFromEvent(event)

    const scrubEl = event.currentTarget
    const onMove = (e) => {
      if (!scrubbing) return
      seekFromEvent({ currentTarget: scrubEl, clientX: e.clientX })
    }
    const onUp = () => {
      scrubbing = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function play() {
    const session = playerSession
    const { videoEl } = getMediaElements()
    if (isNative()) {
      const video = videoEl
      if (!video) return
      clearPendingPlay()
      const attemptPlay = () => {
        if (!isPlayerSessionActive(session)) return
        video.play()?.catch?.(() => {})
      }
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        attemptPlay()
      } else {
        const handler = () => attemptPlay()
        pendingPlayHandler = { video, handler }
        video.addEventListener('canplay', handler, { once: true })
      }
      return
    }
    if (!isPlayerSessionActive(session) || !player) return
    player.play()?.catch?.(() => {})
  }

  function pause() {
    const { videoEl } = getMediaElements()
    if (isNative()) {
      videoEl?.pause?.()
    } else if (player) {
      player.pause()
    } else {
      stopEmbedIframe()
    }
    isPlaying.value = false
  }

  function resetUi() {
    progressPct.value = 0
    currentLabel.value = '0:00'
    isPlaying.value = false
    isFullscreen.value = false
  }

  async function exitFullscreen() {
    if (player?.fullscreen?.active) {
      player.fullscreen.exit()
      isFullscreen.value = false
      return
    }

    const activeElement = document.fullscreenElement || document.webkitFullscreenElement
    if (!activeElement) {
      isFullscreen.value = false
      return
    }

    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    } catch {
      // ignore
    }

    isFullscreen.value = false
  }

  async function toggleFullscreen(event, containerEl = null) {
    event?.stopPropagation?.()

    fullscreenTarget = containerEl

    if (player?.fullscreen) {
      if (player.fullscreen.active) {
        player.fullscreen.exit()
      } else {
        player.fullscreen.enter()
      }
      syncFullscreenState()
      return
    }

    const { videoEl } = getMediaElements()
    const video = videoEl

    if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen()
      isFullscreen.value = true
      return
    }

    const target = containerEl || video
    if (!target) return

    const activeElement = document.fullscreenElement || document.webkitFullscreenElement
    if (activeElement) {
      await exitFullscreen()
      return
    }

    try {
      if (target.requestFullscreen) await target.requestFullscreen()
      else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen()
      syncFullscreenState()
    } catch {
      // ignore
    }
  }

  return {
    isPlaying,
    isMuted,
    isFullscreen,
    currentLabel,
    totalLabel,
    progressPct,
    isNative,
    mediaFadeTarget,
    initPlayer,
    primePlayer,
    completeEmbedPlayer,
    destroyPlayer,
    togglePlay,
    toggleSound,
    toggleFullscreen,
    exitFullscreen,
    seekFromEvent,
    onScrubDown,
    play,
    pause,
    resetUi,
    setDuration,
    syncProgress,
    getResolvedConfig,
  }
}
