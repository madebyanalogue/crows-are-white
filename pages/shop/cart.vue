<script setup lang="ts">
const { items, subtotal, updateQty, removeFromCart } = useCart()
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Cart"
      subtitle="Shopify checkout wireframe — cart icon in nav shows item count."
    />

    <div v-if="items.length === 0" class="surface-card py-24 text-center">
      <p class="mb-3 text-2xl font-semibold text-wire-ink">Your cart is empty</p>
      <p class="mb-8 text-wire-muted">Add merchandise from the shop to preview checkout.</p>
      <NuxtLink to="/shop" class="btn-secondary">Continue Shopping</NuxtLink>
    </div>

    <div v-else class="grid gap-12 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <article
          v-for="item in items"
          :key="item.id"
          class="surface-card flex gap-6"
        >
          <WireBox :label="item.name" class="w-24 h-24 shrink-0 rounded" min-height="96px" />
          <div class="flex-1 min-w-0">
            <h2 class="font-medium">{{ item.name }}</h2>
            <p class="text-sm text-wire-muted mt-1">${{ item.price }}</p>
            <div class="mt-3 flex items-center gap-3">
              <label class="text-xs text-wire-muted">Qty</label>
              <select
                :value="item.qty"
                class="input-wire w-20 py-1"
                @change="updateQty(item.id, Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
              </select>
              <button
                type="button"
                class="text-xs text-wire-muted underline hover:text-wire-ink"
                @click="removeFromCart(item.id)"
              >
                Remove
              </button>
            </div>
          </div>
          <p class="font-medium shrink-0">${{ item.price * item.qty }}</p>
        </article>
      </div>

      <aside class="surface-card h-fit">
        <h2 class="label-caps mb-4">Order summary</h2>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-wire-muted">Subtotal</span>
          <span>${{ subtotal }}</span>
        </div>
        <div class="flex justify-between text-sm mb-6">
          <span class="text-wire-muted">Shipping</span>
          <span class="text-wire-muted">Calculated at checkout</span>
        </div>
        <div class="flex justify-between font-semibold mb-6 pt-4 border-t border-wire-border">
          <span>Total</span>
          <span>${{ subtotal }}</span>
        </div>
        <button type="button" class="btn-primary w-full mb-3">Checkout</button>
        <NuxtLink to="/shop" class="btn-secondary w-full text-center block">
          Continue Shopping
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>
