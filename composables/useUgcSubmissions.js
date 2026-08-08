const STORAGE_KEY = 'caw-ugc-pending'
const MAX_CACHED_ITEMS = 20

function readStorage() {
  if (!import.meta.client) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(items) {
  if (!import.meta.client) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_CACHED_ITEMS)))
  } catch {
    // Ignore quota errors — optimistic display is best-effort.
  }
}

export function useUgcPendingCache() {
  const pendingItems = useState('ugc-pending-items', () => [])

  function hydrate() {
    pendingItems.value = readStorage()
  }

  function addPendingItem(item) {
    if (!item?._id) return

    const next = [
      item,
      ...pendingItems.value.filter((entry) => entry._id !== item._id),
    ].slice(0, MAX_CACHED_ITEMS)

    pendingItems.value = next
    writeStorage(next)
  }

  function pruneApproved(approvedIds) {
    const approvedSet = new Set(approvedIds)
    const next = pendingItems.value.filter((entry) => !approvedSet.has(entry._id))
    pendingItems.value = next
    writeStorage(next)
  }

  if (import.meta.client) {
    onMounted(hydrate)
  }

  return {
    pendingItems,
    hydrate,
    addPendingItem,
    pruneApproved,
  }
}

export function useUgcSubmissions(limit = 24) {
  const { pendingItems, addPendingItem, pruneApproved } = useUgcPendingCache()

  const { data, pending, error, refresh } = useFetch('/api/ugc', {
    query: { limit },
    key: `ugc-submissions-${limit}`,
  })

  watch(
    () => data.value?.items?.map((item) => item._id).join(',') ?? '',
    () => {
      const approvedIds = data.value?.items?.map((item) => item._id) ?? []
      if (approvedIds.length) pruneApproved(approvedIds)
    },
    { immediate: true },
  )

  const items = computed(() => {
    const approved = data.value?.items ?? []
    const approvedIds = new Set(approved.map((item) => item._id))
    const localPending = pendingItems.value.filter((item) => !approvedIds.has(item._id))
    return [...localPending, ...approved]
  })

  return {
    items,
    pending,
    error,
    refresh,
    addPendingItem,
  }
}
