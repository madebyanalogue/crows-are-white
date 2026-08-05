<template>
  <div
    v-if="hasPlayer"
    ref="previewRef"
    class="mini-video-player"
  >
    <div
      class="mini-video-player__preview mini-video-player__preview--clickable"
      @click="openFullscreen"
    >
      <div class="mini-video-player__video-wrapper">
        <iframe
          v-if="previewVideoSrc && isPreviewIframe"
          :src="previewVideoSrc"
          frameborder="0"
          allow="autoplay; fullscreen"
          referrerpolicy="no-referrer"
          title="Video preview"
          credentialless
        />
        <video
          v-else-if="previewVideoSrc"
          :src="previewVideoSrc"
          class="mini-video-player__preview-video"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
        />
        <img
          v-else-if="previewImage"
          :src="previewImage"
          alt="Video preview"
          class="mini-video-player__cover"
        >
      </div>
      <div class="mini-video-player__fade-overlay" aria-hidden="true" />
      <div class="mini-video-player__play-button" aria-hidden="true">
        <img
          class="mini-video-player__play-icon"
          src="/images/dorsia-play.svg"
          alt=""
          width="99"
          height="99"
          decoding="async"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip)

const props = defineProps({
  videoUrl: { type: String, default: '' },
  loopClipUrl: { type: String, default: '' },
  previewImage: { type: String, default: '' },
})

const previewRef = ref(null)
let fullscreenOverlay = null

function parseVimeoData(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return { id: trimmed, hash: null }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    let id = null
    let hash = url.searchParams.get('h') || null

    const videoIndex = parts.indexOf('video')
    if (videoIndex >= 0 && parts[videoIndex + 1] && /^\d+$/.test(parts[videoIndex + 1])) {
      id = parts[videoIndex + 1]
      if (!hash && parts[videoIndex + 2]) hash = parts[videoIndex + 2]
    } else {
      const idIndex = parts.findIndex((segment) => /^\d+$/.test(segment))
      if (idIndex >= 0) {
        id = parts[idIndex]
        if (!hash && parts[idIndex + 1]) hash = parts[idIndex + 1]
      }
    }

    if (!id) return null
    return { id, hash }
  } catch {
    const match = trimmed.match(/(?:vimeo\.com\/|video\/)(\d+)(?:\/([A-Za-z0-9]+))?/)
    if (!match) return null
    return {
      id: match[1],
      hash: match[2] || null,
    }
  }
}

function buildVimeoPlayerUrl(videoData, extraParams = {}) {
  if (!videoData?.id) return null

  const params = new URLSearchParams()
  if (videoData.hash) params.set('h', videoData.hash)
  Object.entries(extraParams).forEach(([key, value]) => {
    params.set(key, String(value))
  })

  return `https://player.vimeo.com/video/${videoData.id}?${params.toString()}`
}

function isNativeVideoUrl(url) {
  const trimmed = (url || '').trim()
  return Boolean(trimmed && !parseVimeoData(trimmed))
}

const vimeoData = computed(() => parseVimeoData(props.videoUrl))
const loopClipVimeoData = computed(() => parseVimeoData(props.loopClipUrl))
const hasVimeoVideo = computed(() => Boolean(vimeoData.value?.id))
const hasNativeVideo = computed(() => isNativeVideoUrl(props.videoUrl))
const hasNativeLoopClip = computed(() => isNativeVideoUrl(props.loopClipUrl))
const hasPlayer = computed(() =>
  hasVimeoVideo.value
  || hasNativeVideo.value
  || hasNativeLoopClip.value
  || Boolean(props.previewImage),
)
const canOpenFullscreen = computed(() => hasVimeoVideo.value || hasNativeVideo.value || hasNativeLoopClip.value)

const isPreviewIframe = computed(() => Boolean(loopClipVimeoData.value?.id))

const previewVideoSrc = computed(() => {
  if (loopClipVimeoData.value?.id) {
    return buildVimeoPlayerUrl(loopClipVimeoData.value, {
      background: 1,
      autoplay: 1,
      loop: 1,
      muted: 1,
      dnt: 1,
    })
  }

  if (hasNativeLoopClip.value) {
    return props.loopClipUrl.trim()
  }

  return null
})

const fullscreenVideoSrc = computed(() => {
  if (!vimeoData.value?.id) return null
  return buildVimeoPlayerUrl(vimeoData.value, {
    autoplay: 1,
    loop: 1,
    dnt: 1,
  })
})

const nativeFullscreenSrc = computed(() => {
  if (hasNativeVideo.value) return props.videoUrl.trim()
  if (hasNativeLoopClip.value) return props.loopClipUrl.trim()
  return null
})

function openFullscreen() {
  const previewEl = previewRef.value?.querySelector('.mini-video-player__preview')
  const fadeOverlay = previewRef.value?.querySelector('.mini-video-player__fade-overlay')
  const playButtonEl = previewRef.value?.querySelector('.mini-video-player__play-button')
  if (!previewEl || !fadeOverlay || !playButtonEl || !canOpenFullscreen.value || fullscreenOverlay) return

  const parent = previewRef.value
  const videoWrapper = previewEl.querySelector('.mini-video-player__video-wrapper')
  const coverImg = previewEl.querySelector('.mini-video-player__cover')
  const previewVideo = previewEl.querySelector('.mini-video-player__preview-video')

  if (videoWrapper) {
    gsap.set(videoWrapper, { scale: 1, autoAlpha: 0 })
  }
  gsap.set(fadeOverlay, { opacity: 1 })
  gsap.set(playButtonEl, { autoAlpha: 0 })
  if (coverImg) {
    gsap.set(coverImg, { autoAlpha: 0 })
  }
  if (previewVideo) {
    gsap.set(previewVideo, { autoAlpha: 0 })
  }

  const state = Flip.getState([previewEl], { absolute: true, scale: true })

  const overlay = document.createElement('div')
  overlay.className = 'mini-video-fullscreen'
  overlay.innerHTML = '<button type="button" class="mini-video-fullscreen__close">Close</button>'
  const backdrop = document.createElement('div')
  backdrop.className = 'mini-video-fullscreen__backdrop'
  gsap.set(backdrop, { opacity: 0 })
  overlay.appendChild(backdrop)

  const target = document.createElement('div')
  target.className = 'mini-video-fullscreen__target'
  overlay.appendChild(target)

  const fullPlayer = document.createElement('div')
  fullPlayer.className = 'mini-video-fullscreen__player'
  gsap.set(fullPlayer, { opacity: 0 })
  overlay.appendChild(fullPlayer)

  target.appendChild(previewEl)

  const closeBtn = overlay.querySelector('.mini-video-fullscreen__close')
  const listeners = { closeBtn, backdrop, overlay, target, fullPlayer, handleClose: null, handleEsc: null, handleOutsideClick: null }
  listeners.handleEsc = (event) => {
    if (event.key === 'Escape') {
      listeners.handleClose?.()
    }
  }
  listeners.handleClose = () => closeFullscreen(
    overlay,
    previewEl,
    parent,
    fullPlayer,
    playButtonEl,
    listeners,
  )
  listeners.handleOutsideClick = (event) => {
    const clickTarget = event.target
    if (clickTarget === listeners.overlay || clickTarget === listeners.backdrop || clickTarget === listeners.target || clickTarget === listeners.fullPlayer) {
      listeners.handleClose?.()
    }
  }
  closeBtn.addEventListener('click', listeners.handleClose)
  backdrop.addEventListener('click', listeners.handleClose)
  overlay.addEventListener('click', listeners.handleOutsideClick)
  document.addEventListener('keydown', listeners.handleEsc)

  document.body.appendChild(overlay)
  fullscreenOverlay = overlay
  document.body.style.overflow = 'hidden'

  const tl = gsap.timeline()
  tl.add(Flip.from(state, { duration: 0.5, ease: 'power2.inOut', scale: true }), 0)
  tl.to(backdrop, { opacity: 1, duration: 0.25 }, 0)
  tl.to([previewEl, videoWrapper], { borderRadius: 0, duration: 0.5 }, 0)
  tl.call(() => {
    if (fullscreenVideoSrc.value) {
      const iframe = document.createElement('iframe')
      iframe.src = fullscreenVideoSrc.value
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allow', 'autoplay; fullscreen')
      iframe.setAttribute('referrerpolicy', 'no-referrer')
      iframe.setAttribute('title', 'Fullscreen video')
      iframe.setAttribute('credentialless', '')
      fullPlayer.appendChild(iframe)
    } else if (nativeFullscreenSrc.value) {
      const video = document.createElement('video')
      video.src = nativeFullscreenSrc.value
      video.controls = true
      video.autoplay = true
      video.playsInline = true
      video.setAttribute('title', 'Fullscreen video')
      fullPlayer.appendChild(video)
    }
    gsap.to(fullPlayer, { opacity: 1, duration: 0.25 })
  }, null, 0.5)
}

function closeFullscreen(overlay, previewEl, parent, fullPlayer, playButtonEl, listeners = null) {
  if (listeners) {
    listeners.closeBtn?.removeEventListener('click', listeners.handleClose)
    listeners.backdrop?.removeEventListener('click', listeners.handleClose)
    listeners.overlay?.removeEventListener('click', listeners.handleOutsideClick)
    document.removeEventListener('keydown', listeners.handleEsc)
  }

  const videoWrapper = previewEl.querySelector('.mini-video-player__video-wrapper')
  const fadeOverlay = previewEl.querySelector('.mini-video-player__fade-overlay')
  const coverImg = previewEl.querySelector('.mini-video-player__cover')
  const previewVideo = previewEl.querySelector('.mini-video-player__preview-video')
  const backdrop = overlay.querySelector('.mini-video-fullscreen__backdrop')
  const closeBtn = listeners?.closeBtn ?? overlay.querySelector('.mini-video-fullscreen__close')

  if (closeBtn) {
    gsap.to(closeBtn, { autoAlpha: 0, duration: 0.2 })
  }

  gsap.to(fullPlayer, { opacity: 0, duration: 0.2 }).then(() => {
    fullPlayer.innerHTML = ''
  })
  if (videoWrapper) {
    gsap.set(videoWrapper, { autoAlpha: 0 })
  }
  gsap.set(fadeOverlay, { opacity: 1 })

  const state = Flip.getState([previewEl], { absolute: true, scale: true })
  parent.appendChild(previewEl)
  fullscreenOverlay = null

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.remove()
      gsap.set(fadeOverlay, { clearProps: 'opacity' })
      if (videoWrapper) {
        gsap.set(videoWrapper, { autoAlpha: 1, clearProps: 'scale' })
      }
      if (coverImg) {
        gsap.set(coverImg, { autoAlpha: 1 })
      }
      if (previewVideo) {
        gsap.set(previewVideo, { autoAlpha: 1 })
      }
      if (playButtonEl) {
        gsap.to(playButtonEl, { autoAlpha: 1, duration: 0.2 })
      }
      document.body.style.overflow = ''
    },
  })
  tl.add(Flip.from(state, { duration: 0.5, ease: 'power2.inOut', scale: true }), 0)
  if (backdrop) {
    tl.to(backdrop, { opacity: 0, duration: 0.2 }, 0)
  }
  tl.to([previewEl, videoWrapper], { borderRadius: 0, duration: 0.5 }, 0)
}

onUnmounted(() => {
  if (fullscreenOverlay) {
    fullscreenOverlay.remove()
    fullscreenOverlay = null
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.mini-video-player {
  position: relative;
  width: 100%;
  --mini-video-aspect: 3 / 2;
}

.mini-video-player__preview {
  position: relative;
  width: 100%;
  aspect-ratio: var(--mini-video-aspect);
  overflow: hidden;
  background: var(--obsidian);
}

.mini-video-player__preview--clickable {
  cursor: pointer;
}

.mini-video-player__video-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.mini-video-player__video-wrapper iframe,
.mini-video-player__preview-video,
.mini-video-player__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mini-video-player__cover {
  object-fit: cover;
  object-position: center;
}

.mini-video-player__video-wrapper iframe {
  border: 0;
  pointer-events: none;
}

.mini-video-player__preview-video {
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}

.mini-video-player__fade-overlay {
  position: absolute;
  inset: 0;
  background: var(--obsidian);
  opacity: 0.2;
  pointer-events: none;
  z-index: 1;
}

.mini-video-player__preview:hover .mini-video-player__video-wrapper {
  transform: scale(1.05);
}

.mini-video-player__play-button {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 2;
  width: 10%;
  aspect-ratio: 1;
  pointer-events: none;
  contain: layout style paint;
}

.mini-video-player__play-icon {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

:global(.mini-video-fullscreen) {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

:global(.mini-video-fullscreen > *) {
  pointer-events: auto;
}

:global(.mini-video-fullscreen__backdrop) {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 0;
}

:global(.mini-video-fullscreen__target) {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

:global(.mini-video-fullscreen__target .mini-video-player__preview) {
  width: min(86vw, 86vh * 16 / 9);
  height: auto;
  max-height: 86vh;
  aspect-ratio: 16 / 9;
}

:global(.mini-video-fullscreen__player) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

:global(.mini-video-fullscreen__player iframe),
:global(.mini-video-fullscreen__player video) {
  position: relative;
  width: min(86vw, 86vh * 16 / 9);
  height: auto;
  max-height: 86vh;
  aspect-ratio: 16 / 9;
  max-width: 86vw;
  border: 0;
  object-fit: contain;
  background: var(--obsidian);
}

:global(.mini-video-fullscreen__close) {
  position: absolute;
  top: 25px;
  right: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 10px 30px;
  background: none;
  border: 1px solid;
  color: var(--fuji);
  font-family: var(--sans);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
}
</style>
