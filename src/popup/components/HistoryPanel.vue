<template>
  <div
    v-if="recentExecutions.length"
    class="history-container"
    ref='historyContainerRef'
  >
    <p
      v-for="(item, idx) in recentExecutions"
      :key="idx + '-' + item"
      class="history-item"
      :class="{ 'history-item--first': idx === 0 }"
    >
      <div class="d-flex justify-content-around align-items-center">
        <span class="history-item__command">
          <button
            class="history-item__btn btn btn-light btn-xs"
            @click="onClickCommand(item.command)"
            @mousedown.prevent
          >
            {{ item.command }}
          </button>
          <i
            :class="{
              'bi-check text-green': item.status === 'success',
              'bi-exclamation-circle text-red': item.status === 'error',
            }"
          />
        </span>

        <span class="history-item__buttons">
          <!-- Toggle show output-->
          <button
            v-if="item.lines || item.html"
            class="history-item__btn history-item__collapse-btn btn btn-outline-primary btn-xs"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Toggle Output"
            data-bs-delay="{ &quot;show&quot;: 750, &quot;hide&quot;: 0 }"
            data-bs-trigger="hover"
            @click="onClickToggleCollapse($event)"
          ><i class="bi bi-body-text" /></button>

          <!-- Re-run command -->
          <button
            v-if="!!toolForHistoryItem(item)?.instance.executor"
            class="history-item__btn btn btn-outline-primary btn-xs"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Re-run Command"
            data-bs-delay="{ &quot;show&quot;: 750, &quot;hide&quot;: 0 }"
            data-bs-trigger="hover"
            @click="onClickRerun(item.command)"
          ><i class="bi bi-repeat" /></button>
        </span>
      </div>

      <div
        v-if="item.lines || item.html"
        class="history-item__output history-item__output--collapsed"
      >
        <div>
          <template
            v-for="(item2, idx) in item.lines"
            :key="idx"
          >
            <span class="history-item__output-line">{{ item2 }}</span><br>
          </template>

          <div
            v-if="item.html"
            v-html="item.html"
          ></div>
        </div>
      </div>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { Tooltip } from 'bootstrap'
import type { CommandExecution } from '@/popup/store/toolExecution'
import { computed, nextTick, ref, watch } from "vue";
import { useToolStore } from "@/popup/store/tool";
import { useToolExecutionStore } from '@/popup/store/toolExecution'

const props = defineProps({
    execId: {
      type: Object as PropType<string>,
      required: true,
    },
})

const toolStore = useToolStore()
const toolExecutionStore = useToolExecutionStore()

const tooltips = ref([] as Tooltip[])
const historyContainerRef = ref(null as unknown as HTMLElement)

const recentExecutions = computed(() => toolExecutionStore.getRecentExecutions(props.execId));

const emit = defineEmits(['setCommand', 'runCommand'])

watch(recentExecutions, async (newExecs, oldExecs) => {
    nextTick(() => {
      resetTooltips()

      const notCollapsed = historyContainerRef.value.querySelectorAll('.history-item__output:not(.history-item__output--collapsed)')
      notCollapsed.forEach((x: Element) => toggleHistoryItemCollapsed(x))
    })
})

function onClickCommand(cmd: string) {
    hideTooltips();
    emit('setCommand', cmd)
}

function onClickToggleCollapse(event: Event) {
    toggleHistoryItemCollapsed(event.target as HTMLElement)
}

function onClickRerun(cmd: string) {
    hideTooltips();
    emit('runCommand', cmd)
}

function resetTooltips() {
  tooltips.value.forEach((x: Tooltip) => x.dispose())
  const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  if (tooltips.value) {
    // @ts-ignore
    tooltips.value = [...tooltipEls].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  }
}

function hideTooltips() {
    tooltips.value.forEach((x) => x.hide())
}

function toggleHistoryItemCollapsed(target: Element) {
    const itemEl = target.closest('.history-item')
    if (itemEl) {
      const itemOutputEl = itemEl.querySelector('.history-item__output')
      const toggleOutputEl = itemEl.querySelector('.history-item__collapse-btn')
      itemOutputEl && itemOutputEl.classList.toggle('history-item__output--collapsed')
      toggleOutputEl && toggleOutputEl.classList.toggle('active')
    }
}

function toolForHistoryItem(item: CommandExecution) {
    return toolStore.getTool(item.command)
}

</script>

<style scoped lang="scss">
.text-green {
  color: green;
}

.text-red {
  color: red;
}

.btn.btn-xs {
  padding: .125rem .25rem;
  font-size: .875rem;
}

.history-container {
  margin-top: 15px;
}

.history-item {
  margin-bottom: 2px;
  padding-left: 10px;
  padding-right: 10px;
  border-left: 1px solid rgb(128,128,128);
  border-right: 1px solid rgb(128,128,128);
  line-height: 16px;

  &__command {
    flex-grow: 1;
    font-size: 18px;
  }
  &__btn {
    margin-left: 2px;
    font-weight: 600;
  }
  &__output {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 500ms;
    &--collapsed {
      grid-template-rows: 0fr;
    }

    & > div {
      overflow: hidden
    }
  }
  &__output-line {
    font-size: 12px;
    opacity: .8;
    white-space: nowrap;
  }
}
</style>
