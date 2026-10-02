<script setup>
import { onMounted } from 'vue'
import Battlefield from '~/components/battlefield/Battlefield.vue'
import { useBattlefieldStore } from '~/stores/battlefield'
import { previewParticipants } from '~/data/battlefield/battlefieldDefaults'

const store = useBattlefieldStore()

onMounted(() => {
  store.setParticipants(previewParticipants)
})
</script>

<template>
  <main class="battlefield-page min-h-screen overflow-hidden px-4 py-5 text-[#efe5d2] md:px-8 md:py-8">
    <div class="battlefield-atmosphere pointer-events-none fixed inset-0" />

    <div class="relative mx-auto max-w-[1900px]">
      <header class="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="text-[11px] font-semibold tracking-[0.38em] text-[#a58a59]">
            DND · CULT OF MIMIC
          </div>
          <h1 class="mt-2 font-serif text-3xl font-bold tracking-tight text-[#f4ead7] md:text-4xl">
            Battlemap
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9f9686]">
            <span class="rounded-full border border-[#5a4931] bg-[#15130f]/80 px-3 py-1">HEX GRID</span>
            <span class="rounded-full border border-[#5a4931] bg-[#15130f]/80 px-3 py-1">5 FT</span>
            <span class="rounded-full border border-[#5a4931] bg-[#15130f]/80 px-3 py-1">TACTICAL VIEW</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl border border-[#6b5638] bg-[#17130f]/90 px-4 py-2 text-sm text-[#ddc995] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:border-[#a07b47] hover:bg-[#211a13]"
            @click="store.toggleCoordinates"
          >
            {{ store.showCoordinates ? 'Скрыть координаты' : 'Показать координаты' }}
          </button>
        </div>
      </header>

      <Battlefield />
    </div>
  </main>
</template>

<style scoped>
.battlefield-page {
  background:
    radial-gradient(circle at 18% 12%, rgba(92, 82, 58, 0.2), transparent 24%),
    radial-gradient(circle at 82% 20%, rgba(52, 76, 55, 0.15), transparent 22%),
    radial-gradient(circle at 70% 85%, rgba(119, 73, 43, 0.12), transparent 28%),
    linear-gradient(145deg, #0c0a08 0%, #15110c 48%, #0b0a08 100%);
}

.battlefield-atmosphere {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.012) 0,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    radial-gradient(circle at center, transparent 32%, rgba(0, 0, 0, 0.42) 100%);
  mix-blend-mode: screen;
  opacity: 0.55;
}
</style>
