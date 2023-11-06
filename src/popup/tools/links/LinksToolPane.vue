<template>
  <template v-for="(entry, idx) in filteredLinkSets" :key="idx">
    <div>
      <b style="text-transform: uppercase">{{ entry.name }}</b>
    </div>
    <div v-for="(link, idx) in entry.links" :key="idx">
      <a :href="link" target="_blank">{{ noProtocol(link) }}</a>
    </div>
    <br />
  </template>
  <div></div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import SEARCH from './links.search.json'
import DAILY from './links.daily.json'
import POP10 from './links.pop10.json'

interface LinkEntry {
  name: string
  links: string[]
}

const LINK_SETS: LinkEntry[] = [
  { name: 'daily', links: DAILY },
  { name: 'search', links: SEARCH },
  { name: 'pop10', links: POP10 },
]

const props = defineProps({
  cmdFull: {
    type: Object as PropType<string>,
    required: true,
  },
  cmdInput: {
    type: Object as PropType<string>,
    required: true,
  },
})

const filteredLinkSets = computed(() => {
  return LINK_SETS.filter((x) => x.name.startsWith(props.cmdInput))
})

function noProtocol(url: string) {
  let res = url.replace('https://', '')
  return res
}
</script>

<style scoped></style>
