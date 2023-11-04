import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface CommandExecution {
  command: string
  status: string
  lines: string[]
  html: string
}

const STORAGE_KEY: string = 'TOOL_EXECUTION_STORE'

export const useToolExecutionStore = defineStore('toolExecution', () => {
  const executions = ref(new Map<string, CommandExecution[]>())
  loadStorage()

  function rawStorage() {
    return new Promise((resolve) => {
      chrome.storage.local
        .get([STORAGE_KEY])
        .then((result: any) => resolve(result[STORAGE_KEY]))
    })
  }

  function loadStorage() {
    rawStorage().then((stored) => {
      const loaded = stored ? JSON.parse(stored as string) : []
      loaded.forEach((x: any[]) => executions.value.set(x[0], x[1]))
    })
  }

  function syncStorage() {
    chrome.storage.local.set({
      [STORAGE_KEY]: JSON.stringify(Array.from(executions.value.entries())),
    })
  }

  function reset() {
    chrome.storage.local.set({
      [STORAGE_KEY]: JSON.stringify([]),
    })
    executions.value.clear()
  }

  function getExecutions(execId: string) {
    return executions.value.get(execId) || []
  }

  function getRecentExecutions(execId: string, count: number = 5) {
    const lastN = getExecutions(execId)?.slice(
      Math.max(getExecutions(execId).length - count, 0),
    )
    return lastN?.reverse() || []
  }

  function getLastExecution(execId: string) {
    return getRecentExecutions(execId)[0]
  }

  function appendExecution(
    execId: string,
    cmd: string,
    status: string,
    lines: string[] | null,
    html: string | null,
  ) {
    executions.value.set(execId, executions.value.get(execId) || [])
    getExecutions(execId)?.push({
      command: cmd.trim(),
      status: status,
      lines: lines,
      html: html,
    } as CommandExecution)
    syncStorage()
  }

  function mergeExecutions(execId: string) {
    if (execId === 'primary') {
    } else {
      executions.value.set(
        'primary',
        getExecutions('primary').concat(...getExecutions(execId)),
      )
      executions.value.delete(execId)
    }
    syncStorage()
  }

  return {
    executions,
    rawStorage,
    reset,
    getRecentExecutions,
    getLastExecution,
    appendExecution,
    mergeExecutions,
  }
})
