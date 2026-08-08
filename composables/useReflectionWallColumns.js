export function useReflectionWallColumns() {
  const columns = ref(2)

  function updateColumns() {
    if (!import.meta.client) return

    if (window.matchMedia('(min-width: 1000px)').matches) {
      columns.value = 5
      return
    }

    if (window.matchMedia('(min-width: 700px)').matches) {
      columns.value = 3
      return
    }

    columns.value = 2
  }

  onMounted(() => {
    updateColumns()
    window.addEventListener('resize', updateColumns)
  })

  onUnmounted(() => {
    if (!import.meta.client) return
    window.removeEventListener('resize', updateColumns)
  })

  return columns
}
