<script setup lang="ts">
import { products } from '~/data/site'

const { addToCart } = useCart()
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Shop"
      subtitle="Shopify collection page — print-on-demand via Printful/Printify, styled to match the film site."
    />

    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <article
        v-for="product in products"
        :key="product.id"
        class="surface overflow-hidden"
      >
        <WireBox :label="`${product.name} — product image`" class="aspect-square rounded-none border-0 border-b-2 border-dashed" />
        <div class="p-6 md:p-8">
          <h2 class="font-medium">{{ product.name }}</h2>
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-wire-muted">${{ product.price }}</p>
            <button
              type="button"
              class="btn-primary text-xs px-4 py-2"
              @click="addToCart(product.id)"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
