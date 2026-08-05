import {
  applyPageColorsFromRoute,
  applyPendingPageColors,
  initPageColorTransitions,
  resetFooterBackgroundFadeState,
  resumePageColorTransitions,
  suspendPageColorTransitions,
  usePageColorHead,
} from '~/composables/usePageColor'

export default defineNuxtPlugin((nuxtApp) => {
  usePageColorHead()

  if (!import.meta.client) return

  applyPageColorsFromRoute(window.location.pathname)
  initPageColorTransitions()

  const swapped = useState('crows_pageColorSwapped', () => false)
  const pendingRoutePath = useState('dorsia_pendingRoutePath', () => '')

  function beginPageColorTransition() {
    suspendPageColorTransitions()
  }

  async function syncDestinationPageState(path) {
    if (!path) return

    resetFooterBackgroundFadeState()
    await applyPageColorsFromRoute(path)
    swapped.value = true
  }

  document.addEventListener('crows:page-transition-before-leave', beginPageColorTransition)

  document.addEventListener('crows:page-transition-primary-complete', () => {
    nuxtApp.runWithContext(() => syncDestinationPageState(pendingRoutePath.value))
  })

  document.addEventListener('crows:page-transition-swap', () => {
    if (!swapped.value) {
      resetFooterBackgroundFadeState()
      nuxtApp.runWithContext(() => applyPendingPageColors())
      swapped.value = true
    }
  })

  document.addEventListener('page-transition-complete', () => {
    swapped.value = false
    resumePageColorTransitions()
  })
})
