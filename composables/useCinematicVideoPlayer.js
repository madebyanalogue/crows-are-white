import {
  buildVimeoPlayerUrl,
  formatVideoTime,
  parseVimeoData,
  resolveCinematicProvider,
} from '~/utils/videoRuntime'

function resolveExposedRef(exposed) {
  if (!exposed) return null
  if (exposed instanceof Element) return exposed
  if (typeof exposed === 'object' && 'value' in exposed) {
    return exposed.value instanceof Element ? exposed.value : null
  }
  return null
}

export function useCinematicVideoPlayer(getConfig, mediaComponentRef) {
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const currentLabel = ref('0:00')
  const totalLabel = ref('0:00')
  const progressPct = ref(0)

  let player = null
  let scrubbing = false

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

  function destroyPlayer() {
    if (player) {
      try {
        player.destroy()
      } catch {
        // already destroyed
      }
      player = null
    }

    const { videoEl } = getMediaElements()
    videoEl?.pause?.()
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
  }

  function primePlayer() {
    destroyPlayer()
    if (!import.meta.client) return

    const config = getResolvedConfig()
    const { videoEl, plyrHost } = getMediaElements()

    if (config.provider === 'native') {
      const video = videoEl
      if (!video) return
      if (!video.getAttribute('src') && config.videoSrc) {
        video.src = config.videoSrc
      }
      bindNativeVideo(video)
      return
    }

    const host = plyrHost
    if (!host) return

    const iframe = host.querySelector('iframe')

    if (config.provider === 'youtube' && config.youtubeId && iframe) {
      const origin = window.location.origin
      iframe.src = `https://www.youtube.com/embed/${config.youtubeId}?autoplay=1&origin=${encodeURIComponent(origin)}&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&enablejsapi=1`
      iframe.title = config.iframeTitle
    } else if (config.provider === 'vimeo' && config.vimeoId && iframe) {
      iframe.src = buildVimeoPlayerUrl(
        { id: config.vimeoId, hash: config.vimeoHash },
        {
          autoplay: 1,
          byline: 0,
          portrait: 0,
          title: 0,
          dnt: 1,
        },
      )
      iframe.title = config.iframeTitle
    }
  }

  async function completeEmbedPlayer() {
    if (!import.meta.client || isNative()) return

    const config = getResolvedConfig()
    const { plyrHost } = getMediaElements()
    const host = plyrHost
    if (!host || player) return

    const { default: Plyr } = await import('plyr')

    const plyrOptions = {
      autoplay: true,
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
        byline: false,
        portrait: false,
        title: false,
        dnt: true,
      }
    }

    player = new Plyr(host, plyrOptions)

    player.on('ready', () => {
      setDuration(player.duration)
      player.play()?.catch?.(() => {})
    })
    player.on('loadedmetadata', () => setDuration(player.duration))
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
  }

  async function initPlayer() {
    primePlayer()
    await completeEmbedPlayer()
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
    const { videoEl } = getMediaElements()
    if (isNative()) {
      const video = videoEl
      if (!video) return
      const attemptPlay = () => {
        video.play()?.catch?.(() => {})
      }
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        attemptPlay()
      } else {
        video.addEventListener('canplay', attemptPlay, { once: true })
      }
      return
    }
    player?.play?.()?.catch?.(() => {})
  }

  function pause() {
    const { videoEl } = getMediaElements()
    if (isNative()) videoEl?.pause?.()
    else player?.pause?.()
    isPlaying.value = false
  }

  function resetUi() {
    progressPct.value = 0
    currentLabel.value = '0:00'
    isPlaying.value = false
  }

  return {
    isPlaying,
    isMuted,
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
