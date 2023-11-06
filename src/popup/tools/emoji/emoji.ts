import EmojiToolPane from '@/popup/tools/emoji/EmojiToolPane.vue'

export default {
  name: 'Emoji',
  description: 'An emoji table',
  commandLong: 'emoji',
  commandShort: null,
  toolPane: EmojiToolPane,
  validator: null,
  executor: null,
}
