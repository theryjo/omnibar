<template>
  <chipset :chips="chips" :handle-click="onClickChip"></chipset>
  <br />

  <chipset
    v-if="chipOptionsGroups.env.size"
    :label="'Env:'"
    :chips="toOptionChips(Array.from(chipOptionsGroups.env))"
    :handle-click="onClickChip"
  ></chipset>

  <chipset
    v-if="chipOptionsGroups.site.size"
    :label="'Site:'"
    :chips="toOptionChips(Array.from(chipOptionsGroups.site))"
    :handle-click="onClickChip"
  ></chipset>

  <chipset
    v-if="chipOptionsGroups['corner-brand'].size"
    :label="'Brand:'"
    :chips="toOptionChips(Array.from(chipOptionsGroups['corner-brand']))"
    :handle-click="onClickChip"
  ></chipset>

  <chipset
    v-if="chipOptionsGroups['corner-ctry'].size"
    :label="'Country:'"
    :chips="toOptionChips(Array.from(chipOptionsGroups['corner-ctry']))"
    :handle-click="onClickChip"
  ></chipset>

  <chipset
    v-if="chipOptionsGroups.lang.size"
    :label="'Lang:'"
    :chips="toOptionChips(Array.from(chipOptionsGroups.lang))"
    :handle-click="onClickChip"
  ></chipset>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { EnvUrlsItem } from '@/popup/tools/environments/environments-util'
import type { Chip } from '@/popup/components/ToolChipset.vue'
import { computed, onMounted, reactive } from 'vue'
import { ENV_URLS } from '@/popup/tools/environments/environments-util'
import Chipset from '@/popup/components/ToolChipset.vue'

const ALL = 'all'
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

interface KeyObj {
  env: string | null
  site: string | null
  'corner-brand': string | null
  'corner-ctry': string | null
  lang: string | null
}

interface KeyOptionSet {
  env: Set<string>
  site: Set<string>
  'corner-brand': Set<string>
  'corner-ctry': Set<string>
  lang: Set<string>
}

let URL_INDEX = reactive({
  entries: [] as EnvUrlsItem[], // [{ keys: string[], url: string }, ...]
  keyTypes: {
    env: new Set<string>(),
    site: new Set<string>(),
    'corner-brand': new Set<string>(),
    'corner-ctry': new Set<string>(),
    lang: new Set<string>(),
  } as KeyOptionSet,
  keyDefaults: {
    env: null,
    site: null,
    'corner-brand': 'chrome',
    'corner-ctry': 'us',
    lang: 'en',
  } as KeyObj,
})

const emit = defineEmits(['setCommand'])

onMounted(() => {
  loadUrlIndex()
})

const cmdParams = computed(() =>
  props.cmdFull.toLowerCase().split(' ').slice(1),
)

const cmdKeyObj = computed(() => getKeyObj(cmdParams.value))

const chips = computed(() => {
  return (
    Object.values(getDefaultedKeyObj(cmdParams.value)).filter(
      (x) => x,
    ) as string[]
  ).map((x) => toChip(x))
})

const chipOptionsGroups = computed(() => {
  const set = {
    env: new Set<string>(cmdKeyObj.value.env ? [] : URL_INDEX.keyTypes.env),
    site: new Set<string>(cmdKeyObj.value.site ? [] : URL_INDEX.keyTypes.site),
    'corner-brand': new Set<string>(
      cmdKeyObj.value['corner-brand'] ? [] : URL_INDEX.keyTypes['corner-brand'],
    ),
    'corner-ctry': new Set<string>(
      cmdKeyObj.value['corner-ctry'] ? [] : URL_INDEX.keyTypes['corner-ctry'],
    ),
    lang: new Set<string>(cmdKeyObj.value.lang ? [] : URL_INDEX.keyTypes.lang),
  } as KeyOptionSet
  debugger
  return set
})

function loadUrlIndex() {
  ENV_URLS.forEach((x: EnvUrlsItem) => {
    let keySplit = x.keys.split(',')
    keySplit =
      keySplit[2] === 'N/A'
        ? [keySplit[0], keySplit[1], 'N/A', 'N/A', keySplit[3]]
        : [
            keySplit[0],
            keySplit[1],
            ...keySplit[2].split('-'), // Split Ford-US -> [Ford, US]
            keySplit[3],
          ]

    URL_INDEX.entries.push({
      keys: keySplit.join(' '),
      url: x.url,
    })
    URL_INDEX.keyTypes.env.add(keySplit[0].toLowerCase())
    URL_INDEX.keyTypes.site.add(keySplit[1].toLowerCase())
    URL_INDEX.keyTypes['corner-brand'].add(keySplit[2].toLowerCase())
    URL_INDEX.keyTypes['corner-ctry'].add(keySplit[3].toLowerCase())
    URL_INDEX.keyTypes.lang.add(keySplit[4].toLowerCase())
  })
}

function getDefaultedKeyObj(keys: string[]) {
  keys = keys.filter((k) => k != '')
  let res = { ...URL_INDEX.keyDefaults } as KeyObj
  keys.forEach((k) => {
    const kLower = k.toLowerCase()
    if (URL_INDEX.keyTypes.env.has(kLower)) res.env = k
    else if (URL_INDEX.keyTypes.site.has(kLower)) res.site = k
    else if (URL_INDEX.keyTypes.lang.has(kLower)) res.lang = k
    else if (URL_INDEX.keyTypes['corner-brand'].has(kLower))
      res['corner-brand'] = k
    else if (URL_INDEX.keyTypes['corner-ctry'].has(kLower))
      res['corner-ctry'] = k
  })
  return res
}

function getKeyObj(keys: string[]) {
  keys = keys.filter((k) => k != '')
  let res = { ...URL_INDEX.keyDefaults } as KeyObj
  res.env = null
  res.site = null
  res['corner-brand'] = null
  res['corner-ctry'] = null
  res.lang = null
  keys.forEach((k) => {
    const kLower = k.toLowerCase()
    if (URL_INDEX.keyTypes.env.has(kLower)) res.env = k
    else if (URL_INDEX.keyTypes.site.has(kLower)) res.site = k
    else if (URL_INDEX.keyTypes.lang.has(kLower)) res.lang = k
    else if (URL_INDEX.keyTypes['corner-brand'].has(kLower))
      res['corner-brand'] = k
    else if (URL_INDEX.keyTypes['corner-ctry'].has(kLower))
      res['corner-ctry'] = k
    // else
    //     return res = null // Null if it has bad key
  })
  return res
}

function isDefaultChip(str: string) {
  return !props.cmdFull || !props.cmdFull.split(' ').includes(str)
}

function toChip(x: string) {
  return {
    value: x,
    label: x,
    class: isDefaultChip(x) ? 'bg-success' : 'bg-primary',
  } as Chip
}

function toOptionChip(x: string) {
  return {
    value: x,
    label: x,
    class: 'bg-secondary',
  } as Chip
}

function toOptionChips(x: string[]) {
  return x.map((y) => toOptionChip(y))
}

function onClickChip(chip: Chip) {
  if (chips.value.includes(chip)) {
    // If clicking main chip, remove from command
    emit(
      'setCommand',
      props.cmdFull
        .split(' ')
        .filter((x) => x !== chip.value)
        .join(' '),
    )
  } else {
    // If clicking supp chip, append to command
    const split = props.cmdFull.trim().split(' ')
    split.push(chip.value)
    emit('setCommand', split.join(' '))
  }
}
</script>

<style scoped>
header {
}

.chip {
  margin: 0 0.1rem;
}
</style>
