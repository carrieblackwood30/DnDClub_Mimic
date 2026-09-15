<script setup>
const {
  sortedTurnOrder,
  currentParticipant,
  startCombat,
  nextTurn,
  previousTurn,
  endCombat
} = useCombat()
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        ⚔ Инициатива
      </h2>

      <span
        v-if="currentParticipant"
        class="text-sm"
      >
        Ход:
        <strong>
          {{ currentParticipant.name }}
        </strong>
      </span>
    </div>

    <div class="mt-4 space-y-2">
      <div
        v-for="participant in sortedTurnOrder"
        :key="participant.id"
        class="border rounded-lg p-3 flex items-center justify-between"
        :class="{
          'bg-gray-100 border-gray-500':
            currentParticipant?.id === participant.id
        }"
      >
        <div>
          <p class="font-semibold">
            {{ participant.name }}
          </p>

          <p class="text-sm text-gray-500">
            {{ participant.type }}
          </p>
        </div>

        <div class="text-right">
          <p class="font-bold">
            {{ participant.initiative }}
          </p>

          <p class="text-xs text-gray-500">
            d20:
            {{ participant.initiativeRoll ?? '—' }}

            {{ participant.initiativeModifier >= 0 ? '+' : '' }}
            {{ participant.initiativeModifier ?? 0 }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="!currentParticipant"
        type="button"
        class="border rounded px-3 py-1"
        @click="startCombat"
      >
        Начать бой
      </button>

      <template v-else>
        <button
          type="button"
          class="border rounded px-3 py-1"
          @click="previousTurn"
        >
          ← Предыдущий ход
        </button>

        <button
          type="button"
          class="border rounded px-3 py-1"
          @click="nextTurn"
        >
          Следующий ход →
        </button>

        <button
          type="button"
          class="border rounded px-3 py-1"
          @click="endCombat"
        >
          Завершить бой
        </button>
      </template>
    </div>
  </div>
</template>