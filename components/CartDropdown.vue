<script setup>
const { isOpen, closeCart } = useCart()
const switchingFromMenuToCart = useState('crows_switchingFromMenuToCart', () => false)

const contentVisible = ref(false)
let revealTimer = null
const PANEL_TRANSITION_MS = 320

function clearRevealTimer() {
  if (revealTimer != null) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

watch(isOpen, (open) => {
  clearRevealTimer()

  if (!open) {
    contentVisible.value = false
    return
  }

  if (switchingFromMenuToCart.value) {
    contentVisible.value = true
    return
  }

  contentVisible.value = false
  revealTimer = window.setTimeout(() => {
    revealTimer = null
    if (isOpen.value) contentVisible.value = true
  }, PANEL_TRANSITION_MS)
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
    :class="{ 'is-open': isOpen }"
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
</style>
