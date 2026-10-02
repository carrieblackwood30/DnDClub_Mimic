<script setup>
import { computed } from 'vue'

const props = defineProps({
  draggedTokenId: {
    type: [String, Number],
    default: null
  },
  tacticalPreview: {
    type: Object,
    default: null
  }
})

const visible = computed(() => {
  return Boolean(
    props.draggedTokenId &&
    props.tacticalPreview
  )
})

const movementRemainingClass = computed(() => {
  if (!props.tacticalPreview) {
    return 'text-[#d0c4b3]'
  }

  return props.tacticalPreview.remainingFeet > 0
    ? 'text-[#9fd8a7]'
    : 'text-[#ea8b82]'
})
</script>

<template>
  <div
    v-if="visible"
    class="pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-[#5f7f8c] bg-[#0f171a]/94 px-5 py-3 text-center shadow-2xl backdrop-blur-xl"
  >
    <div class="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#83a9b5]">
      Перемещение
    </div>

    <div class="mt-1 text-base font-semibold text-[#e4f1f4]">
      {{ tacticalPreview.distanceFeet }} ft ·
      {{ tacticalPreview.distanceHexes }} hex
    </div>

    <div class="mt-2 flex items-center justify-center gap-4 text-[11px]">
      <span class="text-[#d0c4b3]">
        Пройдено:
        <b class="text-[#f0d788]">
          {{ tacticalPreview.usedFeet }} ft
        </b>
      </span>

      <span class="text-[#d0c4b3]">
        Осталось:
        <b :class="movementRemainingClass">
          {{ tacticalPreview.remainingFeet }} ft
        </b>
      </span>
    </div>

    <div
      v-if="tacticalPreview.blocked"
      class="mt-2 rounded-md border border-[#75443f] bg-[#2a1715] px-2 py-1 text-[9px] text-[#e5aaa2]"
    >
      Перемещение невозможно
    </div>
  </div>
</template>
