<script setup lang="ts">
useShopPageColor()

await useShopPage()

const {items, subtotal, currencyCode, updateQty, removeFromCart, checkout, checkoutLoading, loading} =
  useCart()

function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(Number(amount))
}

function lineTotal(price: string, qty: number) {
  return formatPrice((Number(price) * qty).toFixed(2), currencyCode.value)
}
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Cart"
      subtitle="Review your order, then continue to Shopify checkout."
    />

    <div v-if="loading && items.length === 0" class="text-wire-muted">Loading cart…</div>

    <div v-else-if="items.length === 0" class="surface-card py-24 text-center">
      <p class="mb-3 text-2xl font-semibold text-wire-ink">Your cart is empty</p>
      <p class="mb-8 text-wire-muted">Add merchandise from the shop to continue.</p>
      <NuxtLink to="/shop" class="btn-secondary">Continue Shopping</NuxtLink>
    </div>

    <div v-else class="grid gap-12 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <article
          v-for="item in items"
          :key="item.id"
          class="surface-card flex gap-6"
        >
          <NuxtLink
            v-if="item.handle && item.imageUrl"
            :to="`/shop/${item.handle}`"
            class="cart-page-thumb"
          >
            <img
              :src="item.imageUrl"
              :alt="item.title"
              class="h-24 w-24 shrink-0 rounded object-cover"
            >
          </NuxtLink>
          <img
            v-else-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.title"
            class="h-24 w-24 shrink-0 rounded object-cover"
          />
          <WireBox v-else :label="item.title" class="h-24 w-24 shrink-0 rounded" min-height="96px" />
          <div class="min-w-0 flex-1">
            <h2 class="font-medium">{{ item.title }}</h2>
            <p class="mt-1 text-sm text-wire-muted">{{ formatPrice(item.price, item.currencyCode) }}</p>
            <div class="mt-3 flex items-center gap-3">
              <label class="text-xs text-wire-muted">Qty</label>
              <select
                :value="item.quantity"
                class="input-wire w-20 py-1"
                @change="updateQty(item.id, Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
              </select>
              <button
                type="button"
                class="cart-remove"
                aria-label="Remove item"
                @click="removeFromCart(item.id)"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          <p class="shrink-0 font-medium">{{ lineTotal(item.price, item.quantity) }}</p>
        </article>
      </div>

      <aside class="surface-card h-fit">
        <h2 class="label-caps mb-4">Order summary</h2>
        <div class="mb-2 flex justify-between text-sm">
          <span class="text-wire-muted">Subtotal</span>
          <span>{{ formatPrice(subtotal, currencyCode) }}</span>
        </div>
        <div class="mb-6 flex justify-between text-sm">
          <span class="text-wire-muted">Shipping</span>
          <span class="text-wire-muted">Calculated at checkout</span>
        </div>
        <div class="mb-6 flex justify-between border-t border-wire-border pt-4 font-semibold">
          <span>Total</span>
          <span>{{ formatPrice(subtotal, currencyCode) }}</span>
        </div>
        <button
          type="button"
          class="btn-primary mb-3 w-full"
          :disabled="checkoutLoading"
          @click="checkout"
        >
          {{ checkoutLoading ? 'Redirecting…' : 'Checkout' }}
        </button>
        <NuxtLink to="/shop" class="btn-secondary block w-full text-center">
          Continue Shopping
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cart-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--wire-muted, rgba(17, 16, 16, 0.55));
  cursor: pointer;
  transition: color 0.15s ease;
}

.cart-remove:hover {
  color: var(--wire-ink, #111010);
}

.cart-page-thumb {
  display: block;
  flex-shrink: 0;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.cart-page-thumb:hover,
.cart-page-thumb:focus-visible {
  opacity: 0.82;
}
</style>
