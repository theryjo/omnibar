import { useToolExecutionStore } from '@/popup/store/toolExecution'
import LinksToolPane from '@/popup/tools/links/LinksToolPane.vue'

function validator(cmd: string) {
  const cmdSplit = cmd.trim().split(' ')
  return (
    cmdSplit.length === 2 &&
    ['daily', 'pop10', 'search'].includes(cmdSplit[1].toLowerCase())
  )
}

function executor(execId: string, cmd: string) {
  const toolExecutionStore = useToolExecutionStore()
  toolExecutionStore.appendExecution(execId, cmd, 'success', null, null)
}
export default {
  name: 'Links',
  description: 'View link sets',
  commandLong: 'links',
  commandShort: null,
  toolPane: LinksToolPane,
  validator,
  executor,
}
