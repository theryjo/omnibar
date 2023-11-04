import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import NullTool from '@/popup/tools/null/null'

export interface Tool {
  name: string
  description: string | null
  commandLong: string
  commandShort: string | null
  commandValidator: ((cmd: string) => boolean) | null
  pane: any
  executor: ((execId: string, cmd: string) => void) | null
}

interface ToolEntry {
  commands: string[]
  instance: Tool
}

export const useToolStore = defineStore('tool', () => {
  const toolEntries = ref(
    [NullTool].map(
      (t) =>
        ({
          commands: [t.commandLong, t.commandShort].filter((x) => !!x),
          instance: t,
        }) as ToolEntry,
    ),
  )

  const toolCommands = computed(() =>
    toolEntries.value.flatMap((t) => t.commands),
  )

  function getCommandMatches(cmd: string) {
    return toolCommands.value.filter((x) => x.startsWith(cmd))
  }

  function getTool(cmd: string) {
    const cmdTool = cmd.split(' ')[0]
    return toolEntries.value.find((t) => t.commands.includes(cmdTool))
  }

  function getTools() {
    return toolEntries.value
  }

  return { getCommandMatches, getTool, getTools }
})
