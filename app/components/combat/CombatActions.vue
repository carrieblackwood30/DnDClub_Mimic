<script setup>
import { computed } from 'vue'

const {
  currentParticipant,
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  useReaction
} = useCombat()

const participantId = computed(() => {
  return currentParticipant.value?.id ?? null
})

const actionAvailable = computed(() => {
  if (!participantId.value) return false
  return canUseAction(participantId.value)
})

const bonusActionAvailable = computed(() => {
  if (!participantId.value) return false
  return canUseBonusAction(participantId.value)
})

const reactionAvailable = computed(() => {
  if (!participantId.value) return false
  return canUseReaction(participantId.value)
})

const activateReaction = () => {
  if (!participantId.value) return

  useReaction(participantId.value)
}
</script>

<template>
  <div
    v-if="currentParticipant"
    class="mt-4 border rounded-lg p-4"
  >
    <h3 class="font-bold text-lg">
      Ресурсы хода
    </h3>

    <div class="mt-3 grid grid-cols-3 gap-3">
      <div
        class="border rounded-lg p-3 text-center"
        :class="actionAvailable ? 'border-green-500' : 'opacity-50'"
      >
        <div class="text-2xl">
          ⚔
        </div>

        <div class="font-semibold">
          Action
        </div>

        <div class="text-sm">
          {{ actionAvailable ? 'Доступно' : 'Использовано' }}
        </div>
      </div>

      <div
        class="border rounded-lg p-3 text-center"
        :class="bonusActionAvailable ? 'border-green-500' : 'opacity-50'"
      >
        <div class="text-2xl">
          ✦
        </div>

        <div class="font-semibold">
          Bonus Action
        </div>

        <div class="text-sm">
          {{ bonusActionAvailable ? 'Доступно' : 'Использовано' }}
        </div>
      </div>

      <div
        class="border rounded-lg p-3 text-center"
        :class="reactionAvailable ? 'border-green-500' : 'opacity-50'"
      >
        <div class="text-2xl">
          ↻
        </div>

        <div class="font-semibold">
          Reaction
        </div>

        <div class="text-sm">
          {{ reactionAvailable ? 'Доступно' : 'Использовано' }}
        </div>

        <button
          v-if="reactionAvailable"
          type="button"
          class="mt-2 border rounded px-3 py-1"
          @click="activateReaction"
        >
          Использовать
        </button>
      </div>
    </div>

    <div class="mt-3 text-sm text-gray-500">
      Ход:
      <span class="font-semibold">
        {{ currentParticipant.name }}
      </span>
    </div>
  </div>
</template>