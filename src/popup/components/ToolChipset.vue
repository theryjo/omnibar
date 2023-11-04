<template>
  <p v-if="label" class="chipset__label">{{ label }}</p>
  <button
    v-for="chip in chips"
    :key="chip.label"
    class="chipset__chip badge"
    :class="`${chip.class}`"
    @click.prevent="onClickChip($event, chip)"
    @mousedown.prevent=""
  >
    {{ chip.label }}
  </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

export interface Chip {
  value: string
  label?: string
  desc?: string
  color?: string
  class?: string
}

const props = defineProps({
  label: Object as PropType<String>,
  chips: Object as PropType<Chip[]>,
  handleClick: Object as PropType<(chip: Chip) => void>,
})

function onClickChip(event: Event, chip: Chip) {
  props.handleClick?.(chip)
}
</script>

<style scoped lang="scss">
.chipset {
  &__label {
    margin-bottom: 0;
  }
  &__chip {
    margin: 0 0.1rem;
  }
}
</style>
