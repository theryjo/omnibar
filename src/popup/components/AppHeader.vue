<template>
  <div class="header d-flex justify-content-between align-items-center">
    <img class="header-logo" src="/icons/omni-logo.png" />
    <button
      class="btn p-0"
      data-bs-toggle="collapse"
      data-bs-target=".header-intro"
      role="button"
      aria-expanded="false"
    >
      <i class="bi bi-info-circle" />
    </button>
  </div>

  <div class="header-intro collapse">
    <div class="card card-body">
      <b>OmniTool</b>
      <p>A lightning-fast microtool utility</p>
      <p>Type 'help' for commands</p>
      <p>
        Rec. <a href="#" @click="openExtensionShortcuts">Shortcut</a> →
        <kbd class="bg-primary">⌘K</kbd>
      </p>
      <p>
        Tips:<br />
        <kbd>Tab</kbd> - Autocomplete command.<br />
        <kbd>Tab</kbd> /w Tool selected - Pin command to new toolbar.<br />
        <kbd>Space</kbd> /w Empty input - Fill last executed command.<br />
      </p>
      <button class="reset-btn" @click="onClickReset">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToolbarStore } from '@/popup/store/toolbar'
import { useToolExecutionStore } from '@/popup/store/toolExecution'

const toolbarStore = useToolbarStore()
const toolExecutionStore = useToolExecutionStore()

function openExtensionShortcuts() {
  chrome.tabs.create({
    active: true,
    url: 'chrome://extensions/shortcuts',
  })
}

function onClickReset() {
  toolbarStore.reset()
  toolExecutionStore.reset()
}
</script>

<style scoped>
p {
  margin-bottom: 0.5rem;
}
.header-logo {
  height: 20px;
}
.header-intro {
  font-size: 15px;
}
.reset-btn {
  margin: 0 auto 0 0;
}
</style>
