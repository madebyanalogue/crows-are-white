<script setup lang="ts">
const { isOpen, closeCart } = useCart()

const panelRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const rendered = ref(false)
const isClosing = ref(false)
const { $gsap: gsap } = useNuxtApp()

async function playOpen() {
  await nextTick()
  if (!gsap) return
  gsap.set(panelRef.value, { x: '105%', opacity: 0 })
  gsap.set(overlayRef.value, { opacity: 0 })
  gsap.to(overlayRef.value, { opacity: 1, duration: 0.25, ease: 'power2.out' })
  gsap.to(panelRef.value, { x: '0%', opacity: 1, duration: 0.45, ease: 'power3.out' })
}

function playClose(onDone?: () => void) {
  if (isClosing.value) return
  isClosing.value = true

  if (!gsap) {
    rendered.value = false
    isClosing.value = false
    onDone?.()
    return
  }

  gsap.to(panelRef.value, { x: '105%', opacity: 0, duration: 0.35, ease: 'power3.in' })
  gsap.to(overlayRef.value, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => {
      rendered.value = false
      isClosing.value = false
      onDone?.()
    },
  })
}

watch(isOpen, async (open) => {
  if (!import.meta.client) return

  if (open) {
    rendered.value = true
    isClosing.value = false
    await playOpen()
    return
  }

  if (rendered.value) {
    playClose()
  }
})

function animateClose() {
  if (!isOpen.value && !rendered.value) return
  if (isOpen.value) closeCart()
  else playClose()
}

function onOverlayClick(event: MouseEvent) {
  if (event.target === overlayRef.value) {
    animateClose()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    animateClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="rendered"
      ref="overlayRef"
      class="cart-overlay"
      @click="onOverlayClick"
    >
      <aside
        ref="panelRef"
        class="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        @click.stop
      >
        <CartPanelContent
          variant="drawer"
          @close="animateClose"
        />
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  width: 100%;
  max-width: 420px;
  height: 100%;
  max-height: calc(100svh - 32px);
  align-self: center;
  border-radius: 0;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}
</style>
