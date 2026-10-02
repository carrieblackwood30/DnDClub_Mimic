<script setup>
defineProps({
  showEditorPanel: {
    type: Boolean,
    default: true
  },
  browserFullscreen: {
    type: Boolean,
    default: false
  },
  showCoordinates: {
    type: Boolean,
    default: false
  },
  combatStarted: {
    type: Boolean,
    default: false
  },
  currentParticipant: {
    type: Object,
    default: null
  },
  movementUsed: {
    type: Number,
    default: 0
  },
  movementAllowance: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'toggle-editor',
  'toggle-coordinates',
  'toggle-fullscreen'
])
</script>

<template>
  <div
    class="absolute left-4 right-4 top-4 z-40 flex items-center justify-between gap-4"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-xl border border-[#725a35] bg-[#17130f]/90 px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#f0dfb2] shadow-xl backdrop-blur-md transition hover:border-[#ad8a4c] hover:bg-[#231b12]"
        @click="emit('toggle-editor')"
      >
        {{ showEditorPanel ? 'Скрыть DM' : 'Показать DM' }}
      </button>

      <div
        class="hidden rounded-xl border border-[#5b4b34] bg-[#14110d]/82 px-4 py-2 shadow-xl backdrop-blur-md sm:block"
      >
        <div
          class="text-[9px] font-semibold tracking-[0.28em] text-[#a58a59]"
        >
          DND · CULT OF MIMIC
        </div>

        <div
          class="mt-1 font-serif text-lg font-semibold text-[#f1e4c7]"
        >
          Battlemap
        </div>
      </div>
    </div>

    <div
      v-if="combatStarted && currentParticipant"
      class="hidden min-w-[280px] rounded-2xl border border-[#705b38] bg-[#19140f]/92 px-4 py-3 text-center shadow-2xl backdrop-blur-md md:block"
    >
      <div
        class="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a58a59]"
      >
        Сейчас ход
      </div>

      <div
        class="mt-1 text-sm font-semibold text-[#f1e5cf]"
      >
        {{ currentParticipant.name }}
      </div>

      <div
        class="mt-1 text-[10px] text-[#b6a78c]"
      >
        Движение {{ movementUsed }} / {{ movementAllowance }} ft
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-xl border border-[#5d4d36] bg-[#15110d]/90 px-3 py-2 text-[10px] text-[#ccb98e] shadow-xl backdrop-blur-md transition hover:border-[#9b7c4c] hover:bg-[#221a13]"
        @click="emit('toggle-coordinates')"
      >
        {{ showCoordinates ? 'Скрыть координаты' : 'Координаты' }}
      </button>

      <button
        type="button"
        class="rounded-xl border border-[#725a35] bg-[#17130f]/90 px-3 py-2 text-[10px] font-semibold text-[#f0dfb2] shadow-xl backdrop-blur-md transition hover:border-[#ad8a4c] hover:bg-[#231b12]"
        @click="emit('toggle-fullscreen')"
      >
        {{ browserFullscreen ? 'Выйти из fullscreen' : 'Fullscreen' }}
      </button>
    </div>
  </div>
</template>