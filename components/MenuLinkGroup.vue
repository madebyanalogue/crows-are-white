<template>
  <ul
    class="menu-link-group"
    :class="listClass"
  >
    <li
      v-for="item in items"
      :key="itemKey(item)"
      :data-menu-link-key="itemKey(item)"
    >
      <MenuItem
        :item="item"
        :show-arrow="showArrow"
        :link-class="{ 'is-group-hover-target': isHovered(itemKey(item)) }"
        @click="$emit('click', $event)"
      />
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  listClass: {
    type: [String, Object, Array],
    default: '',
  },
  groupKey: {
    type: String,
    default: '',
  },
  showArrow: {
    type: Boolean,
    default: undefined,
  },
})

defineEmits(['click'])

const { isHovered } = useMenuLinkGroupHover()

function itemKey(item) {
  const base = item._key || item.text
  return props.groupKey ? `${props.groupKey}:${base}` : base
}
</script>

