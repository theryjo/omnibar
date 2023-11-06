import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import LoremIpsum from '@/popup/tools/lorem/lorem'
import ColorPicker from '@/popup/tools/colorpicker/colorpicker'
import Links from '@/popup/tools/links/links'
import Chessboard from '@/popup/tools/chessboard/chessboard'
import Emoji from '@/popup/tools/emoji/emoji'
import Environments from '@/popup/tools/environments/environments'

export interface Tool {
  name: string
  description: string | null
  commandLong: string
  commandShort: string | null
  toolPane: any
  validator: ((cmd: string) => boolean) | null
  executor: ((execId: string, cmd: string) => void) | null
}

interface ToolEntry {
  commands: string[]
  instance: Tool
}

export const useToolStore = defineStore('tool', () => {
  const toolEntries = ref(
    // eslint-disable-next-line
    [
      LoremIpsum as Tool,
      ColorPicker as Tool,
      Links as Tool,
      Chessboard as Tool,
      Emoji as Tool,
      Environments as Tool,
    ].map(
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
