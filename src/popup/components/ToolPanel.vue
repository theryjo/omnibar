<template>
  <component
    class="tool-panel-cmp"
    :is="props.tool.toolPane"
    v-if="props.tool.toolPane"
    :cmd-full="cmdFull"
    :cmd-input="cmdInput"
    @set-command="onSetCommand"
    @set-command-input="onSetCommandInput"
  />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  tool: Object as PropType<any>,
  cmdFull: Object as PropType<string>,
  cmdInput: Object as PropType<string>,
})

const emit = defineEmits(['setCommand', 'setCommandInput'])

function onSetCommand(cmd: string) {
  emit('setCommand', cmd)
}

function onSetCommandInput(cmdInput: string) {
  emit('setCommandInput', cmdInput)
}
</script>

<style scoped>
.tool-panel-cmp {
  margin-bottom: 10px;
}
</style>
