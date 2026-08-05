const MENU_LINK_GROUP_HOVER_KEY = Symbol('menuLinkGroupHover')

export function createMenuLinkGroupHover() {
  const hoveredKey = ref(null)

  function onPointerOver(event) {
    const item = event.target.closest?.('[data-menu-link-key]')
    if (item && event.currentTarget.contains(item)) {
      hoveredKey.value = item.dataset.menuLinkKey
      return
    }

    hoveredKey.value = null
  }

  function onPointerLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      hoveredKey.value = null
    }
  }

  function isHovered(key) {
    return hoveredKey.value === key
  }

  return {
    hoveredKey,
    onPointerOver,
    onPointerLeave,
    isHovered,
  }
}

export function provideMenuLinkGroupHover() {
  const state = createMenuLinkGroupHover()
  provide(MENU_LINK_GROUP_HOVER_KEY, state)
  return state
}

export function useMenuLinkGroupHover() {
  const injected = inject(MENU_LINK_GROUP_HOVER_KEY, null)
  if (injected) return injected
  return createMenuLinkGroupHover()
}
