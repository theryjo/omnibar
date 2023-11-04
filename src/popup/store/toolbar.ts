import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Toolbar {
  id: string
  isPrimary: boolean
  isActive: boolean
  command: string
}

const STORAGE_KEY: string = 'TOOLBAR_STORE'
const PRIMARY_TOOLBAR: Toolbar = {
  id: 'primary',
  isPrimary: true,
  isActive: true,
  command: '',
}
const DEFAULT_TOOLBARS = [PRIMARY_TOOLBAR]

export const useToolbarStore = defineStore('toolbar', () => {
  const toolbars = ref([] as Toolbar[])
  const primaryFocused = ref(false)
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
      // console.log('stored: ' + stored)
      const loaded = stored ? JSON.parse(stored as string) : DEFAULT_TOOLBARS
      loaded.forEach((x: Toolbar) => toolbars.value.push(x))
    })
  }

  function syncStorage() {
    chrome.storage.local.set({
      [STORAGE_KEY]: JSON.stringify(toolbars.value),
    })
  }

  function reset() {
    toolbars.value.splice(1, toolbars.value.length - 1)
    chrome.storage.local.set({
      [STORAGE_KEY]: JSON.stringify(DEFAULT_TOOLBARS),
    })
  }

  function getToolbar(id: string) {
    return toolbars.value.find((x) => x.id === id)
  }

  function setActiveToolbar(id: string) {
    toolbars.value.forEach((x) => {
      x.isActive = false
    })
    toolbars.value
      .filter((x) => x.id === id)
      .forEach((x) => (x.isActive = true))
    syncStorage()
  }

  function setCommand(id: string, cmd: string) {
    const found = getToolbar(id)
    if (found) {
      found.command = cmd
      syncStorage()
    }
  }

  function pushToolbar(cmd: string) {
    const nextId = nextToolbarId()
    toolbars.value.push({
      id: nextId,
      isPrimary: false,
      isActive: true,
      command: cmd,
    })
    setActiveToolbar(nextId)
    syncStorage()
  }

  function removeToolbar(id: string) {
    const found = getToolbar(id)
    if (found) toolbars.value.splice(toolbars.value.indexOf(found), 1)
    syncStorage()
  }

  function nextToolbarId() {
    return generateUUID()
  }

  function generateUUID() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      },
    )
    return uuid
  }

  return {
    toolbars,
    primaryFocused,
    rawStorage,
    reset,
    getToolbar,
    setActiveToolbar,
    setCommand,
    pushToolbar,
    removeToolbar,
  }
})
