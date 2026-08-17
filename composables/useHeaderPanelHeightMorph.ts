const DEFAULT_MORPH_MS = 340

export function useHeaderPanelHeightMorph() {
  const panelHeightMorphing = useState('crows_panelHeightMorphing', () => false)
  let panelHeightTimer: ReturnType<typeof setTimeout> | null = null

  function clearPanelHeightLock(panel?: HTMLElement | null) {
    const el = panel ?? (import.meta.client
      ? document.querySelector<HTMLElement>('.site-header__panel')
      : null)

    if (el) {
      el.style.height = ''
      el.style.overflow = ''
      el.style.transition = ''
    }

    panelHeightMorphing.value = false

    if (panelHeightTimer != null) {
      clearTimeout(panelHeightTimer)
      panelHeightTimer = null
    }
  }

  function morphPanelHeight(
    panel: HTMLElement | null | undefined,
    updateDom?: () => void | Promise<void>,
    durationMs = DEFAULT_MORPH_MS,
  ): Promise<void> {
    if (!import.meta.client || !panel) {
      return Promise.resolve(updateDom?.()).then(() => undefined)
    }

    clearPanelHeightLock(panel)

    const startHeight = panel.offsetHeight
    panel.style.overflow = 'hidden'
    panel.style.height = `${startHeight}px`
    panelHeightMorphing.value = true

    return Promise.resolve(updateDom?.())
      .then(() => nextTick())
      .then(() => new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          panel.style.height = 'auto'
          const endHeight = panel.offsetHeight
          panel.style.height = `${startHeight}px`
          panel.style.transition = `height ${durationMs}ms ease`
          void panel.offsetHeight
          panel.style.height = `${endHeight}px`

          panelHeightTimer = setTimeout(() => {
            clearPanelHeightLock(panel)
            resolve()
          }, durationMs)
        })
      }))
  }

  return {
    panelHeightMorphing,
    clearPanelHeightLock,
    morphPanelHeight,
    MORPH_MS: DEFAULT_MORPH_MS,
  }
}
