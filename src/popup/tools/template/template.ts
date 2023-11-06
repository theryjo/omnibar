import { useToolExecutionStore } from '@/popup/store/toolExecution'
import TemplateToolPane from '@/popup/tools/template/TemplateToolPane.vue'

function validator(cmd: string) {
  return true
}

function executor(execId: string, cmd: string) {
  const lines = ['String output']
  const html = '<div>HTML Output</div>'

  const toolExecutionStore = useToolExecutionStore()
  toolExecutionStore.appendExecution(execId, cmd, 'success', lines, html)
}

export default {
  name: 'Tool Name',
  description: 'A tool description',
  commandLong: 'tool',
  commandShort: 'tl',
  toolPane: TemplateToolPane,
  validator,
  executor,
}
