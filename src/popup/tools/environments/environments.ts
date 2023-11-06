import { useToolExecutionStore } from '@/popup/store/toolExecution'
import EnvironmentsToolPane from '@/popup/tools/environments/EnvironmentsToolPane.vue'
import { ENV_URLS } from '@/popup/tools/environments/environments-util'

const URL_INDEX = {
  entries: [] as any[], // [{ keys: string[], url: string }, ...]
  keyTypes: {
    env: new Set<string>(),
    site: new Set<string>(),
    'corner-brand': new Set<string>(),
    'corner-ctry': new Set<string>(),
    lang: new Set<string>(),
  },
  keyDefaults: {
    env: null,
    site: null,
    'corner-brand': 'chrome',
    'corner-ctry': 'us',
    lang: 'en',
  } as any,
}
loadUrlIndex()

function validator(cmd: string) {
  const cmdSplit = cmd.toLowerCase().split(' ')
  const cmdArgs = cmdSplit.slice(1)

  const maxArgs = Object.keys(URL_INDEX.keyTypes).length + 1
  if (cmdArgs.length > maxArgs) return false

  const keyObj = getDefaultedKeyObj(cmdArgs)
  return keyObj !== null
}

function executor(execId: string, cmd: string) {
  cmd = cmd.toLowerCase()
  const cmdSplit = cmd.split(' ')
  const cmdArgs = cmdSplit.slice(1)
  const cmdKeyObj = getDefaultedKeyObj(cmdArgs)

  let html = ''
  URL_INDEX.entries.forEach(({ keys, url }) => {
    const entryKeyObj = getDefaultedKeyObj(keys)
    let match = true
    Object.keys(cmdKeyObj).forEach((k) => {
      if (
        cmdKeyObj[k] &&
        cmdKeyObj[k].toLowerCase() !== entryKeyObj[k].toLowerCase()
      )
        match = false
    })
    if (match) {
      html += `${Object.values(entryKeyObj).join(
        '.',
      )}: <a href="${url}" target="_blank">${url}</a><br/>`
    }
  })
  if (html === '') html = 'No matches'

  const toolExecutionStore = useToolExecutionStore()
  toolExecutionStore.appendExecution(execId, cmd, 'success', null, html)
}

function loadUrlIndex() {
  ENV_URLS.forEach((x) => {
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
      keys: keySplit,
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
  const res = { ...URL_INDEX.keyDefaults }

  const hasKey = (set: Set<string>, key: string) => {
    return set.has(key)
  }
  keys.forEach((k) => {
    if (k.trim() === '') return

    const kLower = k.toLowerCase()
    if (hasKey(URL_INDEX.keyTypes.env, kLower)) res.env = k
    else if (hasKey(URL_INDEX.keyTypes.site, kLower)) res.site = k
    else if (hasKey(URL_INDEX.keyTypes.lang, kLower)) res.lang = k
    else if (hasKey(URL_INDEX.keyTypes['corner-brand'], kLower))
      res['corner-brand'] = k
    else if (hasKey(URL_INDEX.keyTypes['corner-ctry'], kLower))
      res['corner-ctry'] = k
  })

  return res
}

export default {
  name: 'Environment Explorer',
  description: 'View environments urls',
  commandLong: 'env',
  commandShort: null,
  toolPane: EnvironmentsToolPane,
  validator,
  executor,
}
