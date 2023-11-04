<template>
  <header class="mb-2">
    <AppHeader />
  </header>

  <main>
    <app-omnibar
      v-for="toolbar in toolbars"
      :id="toolbar.id"
      :key="toolbar.id"
      :is-primary="toolbar.isPrimary"
      :is-active="toolbar.isActive"
      :cmd="toolbar.command"
      @close-tool="onCloseTool"
      @push-tool="onPushTool"
      @toolbar-focused="onToolbarFocused"
    />
  </main>
</template>

<script setup lang="ts">
import type { Toolbar } from '@/popup/store/toolbar'
import { computed, onMounted } from 'vue'
import { useToolbarStore } from '@/popup/store/toolbar'
import { useToolExecutionStore } from '@/popup/store/toolExecution'
import AppHeader from '@/popup/components/AppHeader.vue'
import AppOmnibar from '@/popup/components/AppOmnibar.vue'

const toolbarStore = useToolbarStore()
const toolExecutionStore = useToolExecutionStore()

const toolbars = computed<Toolbar[]>(() => {
  const toolbars = toolbarStore.toolbars
  return toolbars.length ? [toolbars[0], ...toolbars.slice(1).reverse()] : []
})

onMounted(() => {
  const focusInterval = setInterval(() => {
    if (!toolbarStore.primaryFocused) {
      toolbarStore.primaryFocused = focusPrimaryOmnibar()
    } else {
      clearInterval(focusInterval)
    }
  })
  registerGlobals()
})

function registerGlobals() {
  ;(window as any).AppOmnibar = {}
  ;(window as any).AppOmnibar.debugStore = function () {
    toolbarStore.rawStorage().then((result) => {
      console.log('Toolbar Store:')
      console.log(JSON.parse(result as string))
    })
    toolExecutionStore.rawStorage().then((result) => {
      console.log('Tool Execution Store:')
      console.log(JSON.parse(result as string))
    })
  }
}

function focusPrimaryOmnibar() {
  const cmdBar = document.querySelector('.command-bar') as HTMLElement
  cmdBar?.focus()
  return !!cmdBar
}

function onToolbarFocused(id: string) {
  toolbarStore.setActiveToolbar(id)
}

function onCloseTool(id: string) {
  const found = toolbarStore.getToolbar(id)
  if (found) {
    toolExecutionStore.mergeExecutions(found.id)
    toolbarStore.removeToolbar(found.id)
  }
  focusPrimaryOmnibar()
}

function onPushTool(cmd: string) {
  toolbarStore.pushToolbar(cmd)
}
</script>
