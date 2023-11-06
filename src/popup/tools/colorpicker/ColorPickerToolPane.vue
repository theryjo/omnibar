<template>
  <div ref="colorPickerRef"></div>
  <div ref="valuesRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import iro from '@jaames/iro'

const colorPickerRef = ref(null as unknown as HTMLElement)
const valuesRef = ref(null as unknown as HTMLElement)

onMounted(() => {
  const props = {
    width: 250,
    color: '#f00',
  }
  const colorPicker = iro.ColorPicker(colorPickerRef.value, props)
  colorPicker.on(['color:init', 'color:change'], function (color: any) {
    valuesRef.value.innerHTML = [
      'hex: ' + color.hexString,
      'rgb: ' + color.rgbString,
      'hsl: ' + color.hslString,
    ].join('<br>')
  })
})
</script>

<style scoped></style>
