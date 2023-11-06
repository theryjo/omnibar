import ColorPickerToolPane from '@/popup/tools/colorpicker/ColorPickerToolPane.vue'

export default {
  name: 'Color Picker',
  description: 'A color picker',
  commandLong: 'color',
  commandShort: null,
  toolPane: ColorPickerToolPane,
  validator: null,
  executor: null,
}
