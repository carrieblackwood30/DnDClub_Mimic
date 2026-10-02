<script setup>
const props = defineProps({
  hoveredHex: {
    type: Object,
    default: null
  },
  selectedHex: {
    type: Object,
    default: null
  },
  showEditorPanel: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20">
    <div
      v-if="hoveredHex"
      class="absolute bottom-4 rounded-2xl border border-[#5f4a31] bg-[#1b1712]/90 px-4 py-3 text-xs text-[#c6b58e] shadow-xl backdrop-blur"
      :class="showEditorPanel ? 'left-[320px]' : 'left-3'"
    >
      <div class="font-semibold text-[#e6d4ac]">
        HEX {{ hoveredHex.q }}, {{ hoveredHex.r }}
      </div>

      <div class="mt-1">
        q={{ hoveredHex.q }} · r={{ hoveredHex.r }}
      </div>
    </div>

    <div
      v-if="selectedHex"
      class="absolute bottom-4 right-4 rounded-2xl border border-[#8a6b3e] bg-[#241c12]/95 px-4 py-3 text-xs text-[#dfc88d] shadow-xl backdrop-blur"
    >
      <div class="font-semibold tracking-wide">
        SELECTED HEX
      </div>

      <div class="mt-1">
        q={{ selectedHex.q }} · r={{ selectedHex.r }}
      </div>
    </div>
  </div>
</template>
