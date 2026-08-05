export function useNavScroll(heroSelector = '.hero') {
  const isDark = ref(false)
  const isHidden = ref(false)

  let lastScrollY = 0
  let navHidden = false

  function update() {
    const hero = document.querySelector(heroSelector)
    const heroH = hero?.getBoundingClientRect().height ?? 0
    const currentY = window.scrollY

    isDark.value = currentY > heroH - 80

    if (currentY > heroH) {
      if (currentY > lastScrollY + 4) {
        isHidden.value = true
        navHidden = true
      } else if (currentY < lastScrollY - 4) {
        isHidden.value = false
        navHidden = false
      }
    } else {
      isHidden.value = false
      navHidden = false
    }

    lastScrollY = currentY
  }

  function onMouseMove(e: MouseEvent) {
    if (e.clientY < 64 && navHidden) {
      isHidden.value = false
      navHidden = false
    }
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    document.addEventListener('mousemove', onMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', update)
    document.removeEventListener('mousemove', onMouseMove)
  })

  return { isDark, isHidden }
}
