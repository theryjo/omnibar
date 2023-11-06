import { useToolExecutionStore } from '@/popup/store/toolExecution'
import LoremToolPane from '@/popup/tools/lorem/LoremToolPane.vue'
import { LoremIpsum } from 'lorem-ipsum'

export const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
})

function validator(cmd: string) {
  const split = cmd.trim().split(' ')
  return split.length === 2 && !Number.isNaN(parseInt(split[1]))
}

function executor(execId: string, cmd: string) {
  const toolExecutionStore = useToolExecutionStore()
  toolExecutionStore.appendExecution(execId, cmd, 'success', null, null)
}

export default {
  name: 'Lorem Ipsum',
  description: 'A simple lorem ipsum generator',
  commandLong: 'lorem',
  commandShort: null,
  toolPane: LoremToolPane,
  validator,
  executor,
  lorem,
}
