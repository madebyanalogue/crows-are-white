<template>
  <hr
    v-if="isDivider"
    class="page-content__divider menu-item__divider"
    role="separator"
  >
  <div
    v-else-if="isSpacer"
    class="menu-item__spacer"
    aria-hidden="true"
  />
  <MenuLink
    v-else
    :item="item"
    :link-class="linkClass"
    :show-arrow="showArrow"
    :arrow-variant="arrowVariant"
    @click="$emit('click', $event)"
  />
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  linkClass: {
    type: [String, Object, Array],
    default: '',
  },
  showArrow: {
    type: Boolean,
    default: undefined,
  },
  arrowVariant: {
    type: String,
    default: 'rotate',
    validator: (value) => ['rotate', 'scale'].includes(value),
  },
})

defineEmits(['click'])

const { isMenuDivider, isMenuSpacer } = useMenuLinks()
const isDivider = computed(() => isMenuDivider(props.item))
const isSpacer = computed(() => isMenuSpacer(props.item))
</script>

<style scoped>
.menu-item__divider {
  margin: 1.25em 0;
}

.menu-item__spacer {
  display: block;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}
</style>
