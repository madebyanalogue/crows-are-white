<script setup>
const { isOpen, closeCart, loading, items } = useCart()
const switchingFromMenuToCart = useState('crows_switchingFromMenuToCart', () => false)

const contentVisible = ref(false)
let revealTimer = null
const PANEL_TRANSITION_MS = 320

const awaitingInitialCart = computed(
  () => loading.value && items.value.length === 0,
)

const isEmptyCartOpen = computed(
  () => isOpen.value && items.value.length === 0,
)

function clearRevealTimer() {
  if (revealTimer != null) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

function scheduleContentReveal() {
  clearRevealTimer()

  if (!isOpen.value) {
    contentVisible.value = false
    return
  }

  if (switchingFromMenuToCart.value) {
    contentVisible.value = true
    return
  }

  contentVisible.value = false

  const delay = PANEL_TRANSITION_MS

  const tryReveal = () => {
    revealTimer = null
    if (!isOpen.value) return

    if (awaitingInitialCart.value) {
      revealTimer = window.setTimeout(tryReveal, 50)
      return
    }

    contentVisible.value = true
  }

  revealTimer = window.setTimeout(tryReveal, delay)
}

watch(isOpen, (open) => {
  if (!open) {
    contentVisible.value = false
    clearRevealTimer()
    return
  }

  scheduleContentReveal()
})

watch(awaitingInitialCart, (awaiting) => {
  if (!isOpen.value || contentVisible.value || awaiting) return
  scheduleContentReveal()
})

function onKeydown(event) {
  if (event.key === 'Escape' && isOpen.value) {
    closeCart()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  clearRevealTimer()
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    class="site-header__cart-wrap"
    :class="{
      'is-open': isOpen,
      'is-awaiting-cart': isOpen && awaitingInitialCart,
      'is-empty-cart': isEmptyCartOpen,
    }"
    :inert="isOpen ? undefined : true"
    :aria-hidden="isOpen ? undefined : 'true'"
  >
    <div class="site-header__cart-inner">
      <CartPanelContent
        variant="dropdown"
        :reveal-content="contentVisible"
        @close="closeCart"
      />
    </div>
  </div>
</template>

<style scoped>
.site-header__cart-wrap {
  --site-header-bar-height: 50px;

  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  pointer-events: none;
  padding-top: 0;
  transition:
    grid-template-rows 0.32s ease,
    padding-top 0.32s ease;
}

.site-header__cart-wrap.is-open {
  grid-template-rows: 1fr;
  padding-top: calc(var(--site-header-bar-height) + 24px);
  pointer-events: auto;
}

.site-header__cart-inner {
  min-height: 0;
  overflow: hidden;
}

.site-header__cart-wrap:not(.is-open) .site-header__cart-inner {
  opacity: 0;
  visibility: hidden;
}

.site-header__cart-wrap.is-open:is(.is-awaiting-cart, .is-empty-cart) .site-header__cart-inner {
  min-height: 11.75rem;
}
</style>
