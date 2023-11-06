<template>
  <div v-if="loremText !== ''">{{ loremText }}</div>
  <div v-else>Enter word ct.</div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import { lorem } from '@/popup/tools/lorem/lorem'

const props = defineProps({
  cmdFull: {
    type: Object as PropType<string>,
    required: true,
  },
  cmdInput: {
    type: Object as PropType<string>,
    required: true,
  },
})

const loremText = computed(() => {
  const split = props.cmdInput.trim().split(' ')
  if (split.length === 1) {
    const ct = parseInt(split[0])
    if (ct && !Number.isNaN(ct)) return lorem.generateWords(ct)
  }
  return ''
})
</script>

<style scoped></style>
