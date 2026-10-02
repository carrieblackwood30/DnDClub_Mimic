<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  height: {
    type: String,
    default: '760px'
  }
})

const canvasHost = ref(null)

const hostStyle = computed(() => ({
  height: props.height
}))

const getHost = () => {
  return canvasHost.value
}

defineExpose({
  getHost
})
</script>

<template>
  <div
    ref="canvasHost"
    class="absolute inset-0 overflow-hidden"
    :style="hostStyle"
  />
</template>