<script setup>
import { computed } from 'vue'

const props = defineProps({
  characterId: {
    type: String,
    required: true
  }
})

const {
  combatStore,
  currentParticipant,
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canDash,
  useDash,
  canDisengage,
  useDisengage,
  useReaction
} = useCombat()

const participant = computed(() => {
  return combatStore.participants.find(
    item => item.characterId === props.characterId
  ) ?? null
})

const participantId = computed(() => {
  return participant.value?.id ?? null
})

const isCurrentTurn = computed(() => {
  if (!participant.value) {
    return false
  }

  return currentParticipant.value?.id === participant.value.id
})

const actionAvailable = computed(() => {
  if (!participantId.value || !isCurrentTurn.value) {
    return false
  }

  return canUseAction(participantId.value)
})

const dashAvailable = computed(() => {
  if (!participantId.value || !isCurrentTurn.value) {
    return false
  }

  return canDash(participantId.value)
})

const disengageAvailable = computed(() => {
  if (!participantId.value || !isCurrentTurn.value) {
    return false
  }

  return canDisengage(participantId.value)
})

const bonusActionAvailable = computed(() => {
  if (!participantId.value || !isCurrentTurn.value) {
    return false
  }

  return canUseBonusAction(participantId.value)
})

const reactionAvailable = computed(() => {
  if (!participantId.value) {
    return false
  }

  return canUseReaction(participantId.value)
})

const activateDash = () => {
  if (!participantId.value || !isCurrentTurn.value) {
    return
  }

  useDash(participantId.value)
}

const activateDisengage = () => {
  if (!participantId.value || !isCurrentTurn.value) {
    return
  }

  useDisengage(participantId.value)
}

const activateReaction = () => {
  if (!participantId.value) {
    return
  }

  useReaction(participantId.value)
}
</script>

<template>
  <div
    v-if="participant"
    class="mt-4 border rounded-lg p-4"
  >
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">
        Ресурсы хода
      </h3>

      <span class="text-sm text-gray-500">
        {{ participant.name }}
      </span>
    </div>

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
          {{
            actionAvailable
              ? 'Доступно'
              : isCurrentTurn
                ? 'Использовано'
                : 'Не ваш ход'
          }}
        </div>

        <div
          v-if="isCurrentTurn && actionAvailable"
          class="mt-2 flex flex-col gap-2"
        >
          <button
            v-if="dashAvailable"
            type="button"
            class="border rounded px-3 py-1"
            @click="activateDash"
          >
            Рывок (Dash)
          </button>

          <button
            v-if="disengageAvailable"
            type="button"
            class="border rounded px-3 py-1"
            @click="activateDisengage"
          >
            Отход (Disengage)
          </button>
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
          {{
            bonusActionAvailable
              ? 'Доступно'
              : isCurrentTurn
                ? 'Использовано'
                : 'Не ваш ход'
          }}
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
          {{
            reactionAvailable
              ? 'Доступно'
              : 'Использовано'
          }}
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
      Сейчас ход:

      <span class="font-semibold">
        {{ currentParticipant?.name ?? '—' }}
      </span>
    </div>
  </div>
</template>