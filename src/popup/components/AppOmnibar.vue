<template>
  <div class="omnibar-container" @focusin="onFocusin">
    <div v-if="!isPrimary">
      <hr />
    </div>

    <div
      class="tool-prompt input-group d-flex justify-content-between align-items-center mb-2"
      style="display: inline-block"
    >
      <span v-if="cmdTool.length" class="tool-prompt__prefix">{{
        cmdTool
      }}</span>

      <input
        v-show="showInput"
        v-model="cmdInput"
        class="tool-prompt__input flex-grow-1 m-1"
        type="text"
        size="5"
        :placeholder="'Select a command...'"
        aria-label="Command"
        @keydown.space="onSpace($event)"
        @keydown.enter="onEnter"
        @keydown.delete="onDelete"
        @keydown.tab="onTab"
        ref="inputRef"
      />

      <button
        v-if="cmdToolInstance && isCmdValid && showInput"
        class="tool-prompt-btn bg-transparent m-1"
        @click="validateAndExecuteCmd"
        @mousedown.prevent
      >
        <i class="text-success bi bi-arrow-right-square-fill" />
      </button>
      <button
        v-if="cmdToolInstance && isPrimary && !isCmdValid"
        class="tool-prompt-btn bg-transparent m-1"
        @click="onPushTool"
        @mousedown.prevent
      >
        <i class="bi bi-plus-circle" />
      </button>
      <button
        v-if="!isPrimary"
        class="tool-prompt-btn bg-transparent m-1"
        @click="onClose"
        @mousedown.prevent
      >
        <i class="bi bi-x-square" />
      </button>
    </div>

    <div v-if="showSuggestions" class="tool-suggestions">
      <p v-for="(item, idx) in cmdSuggestions" :key="idx + '-' + item">
        {{ item }}
      </p>
    </div>

    <div v-if="showHelp" class="tool-help">
      <p
        v-for="(t, idx) in tools
          .slice()
          .sort((a, b) => a.commandLong.localeCompare(b.commandLong))"
        :key="idx + '-' + t"
      >
        <span class="tool-help__command"
          >{{
            t.commandLong + (t.commandShort ? ` (${t.commandShort})` : '')
          }}:</span
        ><br />
        <span v-if="t.description" class="tool-help__description"
          >{{ t.description }}<br
        /></span>
      </p>
    </div>

    <ToolPanel
      v-if="cmdToolInstance && showTool"
      :tool="cmdToolInstance"
      :cmd-full="cmdFull"
      :cmd-input="cmdInput"
      @set-command="onSetCommand"
      @set-command-input="onSetCommandInput"
    />

    <HistoryPanel
      v-if="showHistory"
      :exec-id="execId!"
      @set-command="onSetCommand"
      @run-command="onRunCommand"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useToolbarStore } from '@/popup/store/toolbar'
import { useToolStore } from '@/popup/store/tool'
import { useToolExecutionStore } from '@/popup/store/toolExecution'
import ToolPanel from '@/popup/components/ToolPanel.vue'
import HistoryPanel from '@/popup/components/HistoryPanel.vue'

const toolbarStore = useToolbarStore()
const toolStore = useToolStore()
const toolExecutionStore = useToolExecutionStore()

const props = defineProps({
  id: {
    type: Object as PropType<string>,
    required: true,
  },
  isPrimary: Object as PropType<boolean>,
  isActive: Object as PropType<boolean>,
  cmd: Object as PropType<string>,
})

const emit = defineEmits(['closeTool', 'pushTool', 'toolbarFocused'])

const inputRef = ref(null as unknown as HTMLElement)
const cmdTool = ref('')
const cmdInput = ref(props.cmd || '')
const isPrimary = ref(props.isPrimary !== undefined ? props.isPrimary : true)
const closeFlag = ref(false) // One additional delete before closing window

const execId = computed(() => props.id)
const tools = computed(() => {
  return toolStore.getTools().map((x) => x.instance)
})

const cmdFull = computed(
  () => (cmdTool.value ? cmdTool.value + ' ' : '') + cmdInput.value,
)
const cmdToolInstance = computed(
  () => toolStore.getTool(cmdTool.value)?.instance,
)
const isCmdValid = computed(() => {
  const validator = cmdToolInstance.value?.commandValidator
  return cmdToolInstance.value && (!validator || validator(cmdFull.value))
})
const cmdSuggestions = computed(() => {
  return toolStore
    .getCommandMatches(cmdFull.value)
    .sort((a: string, b: string) => a.length - b.length) // Length ASC
})

const showInput = computed(
  () =>
    isPrimary.value ||
    (cmdToolInstance.value && !!cmdToolInstance.value.executor),
)
const showHelp = computed(
  () => showSuggestions.value && !cmdSuggestions.value.length,
)
const showSuggestions = computed(
  () => cmdFull.value.length && !cmdToolInstance?.value,
)
const showHistory = computed(
  () =>
    !isPrimary.value ||
    (!showSuggestions.value && !showHelp.value && !cmdTool.value),
)
const showTool = computed(() => true)

watch(cmdInput, (newInput) => {
  closeFlag.value = false
  if (!cmdTool.value && cmdFull.value.split(' ').length > 1) {
    cmdShiftTool()
  }
})

watch(cmdFull, (newCmdFull) => {
  toolbarStore.setCommand(execId.value, newCmdFull)
})

onMounted(() => {
  if (isPrimary.value) {
    inputRef.value?.focus()
  }
  cmdShiftTool()
})

function onSpace(event: Event) {
  if (cmdFull.value === '') {
    event.preventDefault()
    const last = toolExecutionStore.getLastExecution(execId.value)
    if (last) {
      cmdSet(last.command)
    }
  }
}

function onEnter() {
  if (cmdFull.value === '') {
    window.close()
  }
  validateAndExecuteCmd()
}

function onTab(e: Event) {
  e.preventDefault()
  if (showSuggestions.value && cmdSuggestions.value.length) {
    // Autocomplete
    cmdSet(cmdSuggestions.value?.[0] + ' ' || cmdFull.value)
  } else {
    if (isPrimary.value && cmdTool.value) {
      pushTool()
    }
  }
}

function onDelete() {
  if (cmdInput.value === '') {
    if (cmdTool.value && isPrimary.value) {
      clearCommandBar(true)
    }
  }
}

function onClose() {
  close()
}

function onFocusin() {
  emit('toolbarFocused', props.id)
}

function onPushTool() {
  pushTool()
}

function onSetCommand(newCmd: string) {
  cmdSet(newCmd)
}

function onSetCommandInput(newCmdInput: string) {
  cmdInputSet(newCmdInput)
}

function onRunCommand(newCmd: string) {
  cmdSet(newCmd)
  validateAndExecuteCmd()
}

function close() {
  emit('closeTool', props.id)
}

function pushTool() {
  emit('pushTool', `${cmdFull.value}`)
  clearCommandBar(isPrimary.value)
}

function cmdSet(cmd: string, shift: boolean = true) {
  cmdInput.value = cmd.trim()
  if (shift) {
    cmdShiftTool()
  }
  inputRef.value?.focus()
}

function cmdInputSet(newCmdInput: string) {
  cmdInput.value = newCmdInput
  inputRef.value?.focus()
}

function cmdShiftTool() {
  const split = cmdInput.value?.split(' ')
  const pre = split?.[0]
  if (pre && (cmdTool.value === pre || toolStore.getTool(pre))) {
    cmdTool.value = pre
    cmdInput.value = ([] as string[]).concat(...split.slice(1)).join(' ')
  }
}

function validateAndExecuteCmd() {
  if (!cmdToolInstance.value) {
    cmdInput.value += ' '
    cmdShiftTool()
    if (!cmdToolInstance.value) {
      cmdInput.value = cmdInput.value.slice(0, -1)
    }
  }
  if (!cmdToolInstance.value) return
  if (!cmdToolInstance.value.executor) {
    toolExecutionStore.appendExecution(
      // Pseudo-execution for non-executable tools
      execId.value,
      cmdTool.value,
      'success',
      null,
      null,
    )
    clearCommandBar(isPrimary.value)
  } else if (isCmdValid.value) {
    cmdToolInstance.value.executor(execId.value, cmdFull.value)
    clearCommandBar(isPrimary.value)
  }
}

function clearCommandBar(clearTool: boolean = true) {
  cmdInput.value = ''
  if (clearTool) {
    cmdTool.value = ''
  }
}
</script>

<style scoped lang="scss">
.tool-prompt {
  &:focus-visible {
    outline: none;
  }
  &__prefix {
    padding: 0 4px;
    line-height: 30px;
    font-weight: bold;
  }
  &__input {
    padding: 4px 4px 4px 4px;
    border-radius: 5px !important;
  }
}
.tool-prompt-btn {
  padding: 1px;
  border: none;
  & i {
    font-size: 20px;
  }
}
.tool-suggestions {
  opacity: 0.8;
  & p {
    margin: 0;
    line-height: 22px;
  }
}
.tool-help {
  & p {
    margin: 0 0 10px 5px;
    line-height: 18px;
  }
  &__command {
    font-weight: bold;
  }
  &__description {
    font-size: 14px;
  }
}
</style>
