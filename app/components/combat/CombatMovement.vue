<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  characterId: {
    type: String,
    required: true
  }
})

const {
  combatStore,
  currentParticipant,
  canMove,
  moveParticipant
} = useCombat()

const distance = ref(5)

const participant = computed(() => {
  return combatStore.participants.find(
    item =>
      item.characterId === props.characterId
  ) ?? null
})

const isCurrentTurn = computed(() => {
  if (!participant.value) {
    return false
  }

  return (
    currentParticipant.value?.id ===
    participant.value.id
  )
})

const speed = computed(() => {
  return participant.value?.speed ?? 0
})

const movementUsed = computed(() => {
  return participant.value?.movementUsed ?? 0
})

const remainingMovement = computed(() => {
  return participant.value?.remainingMovement ?? 0
})

const movementPercent = computed(() => {
  if (!speed.value) {
    return 0
  }

  return Math.min(
    100,
    Math.max(
      0,
      (remainingMovement.value / speed.value) * 100
    )
  )
})

const canMoveDistance = computed(() => {
  if (!participant.value) {
    return false
  }

  if (!isCurrentTurn.value) {
    return false
  }

  const value = Number(
    distance.value
  )

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false
  }

  return canMove(
    participant.value.id,
    value
  )
})

const move = () => {
  if (!participant.value) {
    return
  }

  if (!canMoveDistance.value) {
    return
  }

  moveParticipant(
    participant.value.id,
    Number(distance.value)
  )
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">
        🏃 Перемещение
      </h3>

      <span
        v-if="participant"
        class="text-sm text-gray-500"
      >
        {{ participant.name }}
      </span>
    </div>

    <div
      v-if="!participant"
      class="mt-3 text-sm text-gray-500"
    >
      Персонаж ещё не добавлен в бой.
    </div>

    <div
      v-else
      class="mt-4"
    >
      <div class="grid grid-cols-3 gap-3">
        <div class="border rounded-lg p-3 text-center">
          <div class="text-sm text-gray-500">
            Скорость
          </div>

          <div class="text-xl font-bold">
            {{ speed }} фт.
          </div>
        </div>

        <div class="border rounded-lg p-3 text-center">
          <div class="text-sm text-gray-500">
            Потрачено
          </div>

          <div class="text-xl font-bold">
            {{ movementUsed }} фт.
          </div>
        </div>

        <div class="border rounded-lg p-3 text-center">
          <div class="text-sm text-gray-500">
            Осталось
          </div>

          <div class="text-xl font-bold">
            {{ remainingMovement }} фт.
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="h-3 border rounded overflow-hidden">
          <div
            class="h-full bg-green-500 transition-all"
            :style="{
              width: `${movementPercent}%`
            }"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="border rounded px-3 py-1"
          :disabled="remainingMovement < 5 || !isCurrentTurn"
          @click="distance = 5"
        >
          5 фт.
        </button>

        <button
          type="button"
          class="border rounded px-3 py-1"
          :disabled="remainingMovement < 10 || !isCurrentTurn"
          @click="distance = 10"
        >
          10 фт.
        </button>

        <button
          type="button"
          class="border rounded px-3 py-1"
          :disabled="remainingMovement < 15 || !isCurrentTurn"
          @click="distance = 15"
        >
          15 фт.
        </button>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <label class="text-sm font-semibold">
          Расстояние:
        </label>

        <input
          v-model.number="distance"
          type="number"
          min="5"
          step="5"
          class="w-24 border rounded px-3 py-1"
          :disabled="!isCurrentTurn"
        >

        <span class="text-sm">
          фт.
        </span>

        <button
          type="button"
          class="border rounded px-4 py-1"
          :disabled="!canMoveDistance"
          @click="move"
        >
          Переместиться
        </button>
      </div>

      <div
        v-if="!isCurrentTurn"
        class="mt-3 text-sm text-gray-500"
      >
        Сейчас ход другого участника.
      </div>

      <div
        v-else-if="remainingMovement === 0"
        class="mt-3 text-sm"
      >
        Движение на этот ход полностью потрачено.
      </div>
    </div>
  </div>
</template>