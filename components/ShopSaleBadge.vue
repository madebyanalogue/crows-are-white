<script setup lang="ts">
defineProps<{
  onSale?: boolean
}>()
</script>

<template>
  <span v-if="onSale" class="shop-sale-badge">Sale</span>
</template>

<style scoped>
.shop-sale-badge {
  position: absolute;
  top: clamp(0.65rem, 1.2vw, 0.85rem);
  right: clamp(0.65rem, 1.2vw, 0.85rem);
  z-index: 2;
  padding: 0.4rem .4rem 0.3rem;
  background: #d40000;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
}
</style>
