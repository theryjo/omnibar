import type { Tool } from '@/popup/store/tool'
import NullToolPane from '@/popup/tools/null/NullToolPane.vue'

export default {
  name: 'Null',
  description: 'No-op tool',
  commandLong: 'null',
  commandShort: null,
  commandValidator: (cmd: string) => true,
  pane: NullToolPane,
  executor: null,
} as Tool
