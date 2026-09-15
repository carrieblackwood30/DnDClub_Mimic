<script setup>
import { computed, ref } from 'vue'

const combatStore = useCombatStore()

const {
  getAvailableReactions,
  useReactionEffect,
  getEffectiveArmorClass
} = useCombat()

const {
  rollD20,
  rollDamage
} = useDice()

const attackerId = ref(null)
const targetId = ref(null)
const attackResult = ref(null)
const damageResult = ref(null)
const appliedDamage = ref(null)
const reactionUsed = ref(false)
const reactionResult = ref(null)

const attackers = computed(() => {
  return combatStore.participants.filter(
    participant => participant.type === 'monster'
  )
})

const targets = computed(() => {
  return combatStore.participants.filter(
    participant =>
      participant.type === 'player' &&
      participant.currentHP > 0
  )
})

const attacker = computed(() => {
  if (!attackerId.value) return null

  return combatStore.participants.find(
    participant => participant.id === attackerId.value
  ) ?? null
})

const target = computed(() => {
  if (!targetId.value) return null

  return combatStore.participants.find(
    participant => participant.id === targetId.value
  ) ?? null
})

const availableReactions = computed(() => {
  if (!target.value || !attackResult.value) {
    return []
  }

  return getAvailableReactions(
    target.value.id,
    {
      trigger: 'incoming-attack',
      attackResult: attackResult.value
    }
  )
})

const targetCanReact = computed(() => {
  return availableReactions.value.length > 0
})

const effectiveTargetAC = computed(() => {
  if (!target.value) return 0

  return getEffectiveArmorClass(target.value.id)
})

const rollIncomingAttack = () => {
  if (!attacker.value || !target.value) return
  if (target.value.currentHP <= 0) return

  attackResult.value = null
  damageResult.value = null
  appliedDamage.value = null
  reactionUsed.value = false
  reactionResult.value = null

  const roll = rollD20()
  const modifier = attacker.value.attackModifier ?? 0
  const total = roll + modifier
  const critical = roll === 20
  const criticalFail = roll === 1
  const targetAC = getEffectiveArmorClass(target.value.id)

  const hit = critical
    ? true
    : criticalFail
      ? false
      : total >= targetAC

  attackResult.value = {
    roll,
    modifier,
    total,
    targetAC,
    hit,
    critical,
    criticalFail
  }

  combatStore.createPendingAttack({
    attackerId: attacker.value.id,
    targetId: target.value.id,
    attackRoll: roll,
    attackModifier: modifier,
    targetAC,
    hit,
    critical
  })

  if (!hit) {
    combatStore.clearPendingAttack()
  }
}

const applyIncomingDamage = () => {
  if (!attackResult.value?.hit) return
  if (!attacker.value || !target.value) return

  const damage = rollDamage(
    attacker.value.damage,
    {
      critical: attackResult.value.critical
    }
  )

  if (!damage) return

  const totalDamage =
    damage.total +
    (attacker.value.damageModifier ?? 0)

  damageResult.value = {
    ...damage,
    modifier: attacker.value.damageModifier ?? 0,
    totalDamage
  }

  appliedDamage.value =
    combatStore.applyDamage(
      target.value.id,
      totalDamage
    )

  combatStore.resolvePendingAttack()
}

const activateReaction = (reactionId) => {
  if (!target.value || !attackResult.value) {
    return
  }

  const reaction = availableReactions.value.find(
    item => item.id === reactionId
  )

  if (!reaction) {
    return
  }

  const result = useReactionEffect(
    target.value.id,
    reaction.id,
    {
      trigger: 'incoming-attack',
      attackResult: attackResult.value
    }
  )

  if (!result.success) {
    return
  }

  reactionUsed.value = true
  reactionResult.value = result

  const effectiveAC = getEffectiveArmorClass(
    target.value.id
  )

  const hitAfterReaction =
    attackResult.value.critical
      ? true
      : attackResult.value.total >= effectiveAC

  attackResult.value = {
    ...attackResult.value,
    targetAC: effectiveAC,
    hit: hitAfterReaction
  }

  if (hitAfterReaction) {
    combatStore.setPendingAttack({
      ...combatStore.pendingAttack,
      hit: true,
      targetAC: effectiveAC
    })

    return
  }

  combatStore.clearPendingAttack()
}

const resetAttack = () => {
  attackResult.value = null
  damageResult.value = null
  appliedDamage.value = null
  reactionUsed.value = false
  reactionResult.value = null

  combatStore.clearPendingAttack()
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Входящая атака
    </h2>

    <div class="mt-4 space-y-4">
      <div>
        <label class="block mb-1 font-medium">
          Атакующий
        </label>

        <select
          v-model="attackerId"
          class="w-full border rounded-lg p-2"
        >
          <option :value="null">
            Выберите атакующего
          </option>

          <option
            v-for="participant in attackers"
            :key="participant.id"
            :value="participant.id"
          >
            {{ participant.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-medium">
          Цель
        </label>

        <select
          v-model="targetId"
          class="w-full border rounded-lg p-2"
        >
          <option :value="null">
            Выберите цель
          </option>

          <option
            v-for="participant in targets"
            :key="participant.id"
            :value="participant.id"
          >
            {{ participant.name }}
            — AC {{ getEffectiveArmorClass(participant.id) }}
          </option>
        </select>
      </div>

      <div
        v-if="attacker && target"
        class="border rounded-lg p-3"
      >
        <div class="flex justify-between">
          <span>
            Атакующий
          </span>

          <span class="font-semibold">
            {{ attacker.name }}
          </span>
        </div>

        <div class="flex justify-between mt-2">
          <span>
            Цель
          </span>

          <span class="font-semibold">
            {{ target.name }}
          </span>
        </div>

        <div class="flex justify-between mt-2">
          <span>
            AC цели
          </span>

          <span class="font-semibold">
            {{ effectiveTargetAC }}
          </span>
        </div>
      </div>

      <button
        type="button"
        class="w-full border rounded-lg p-3 font-semibold"
        :disabled="!attacker || !target"
        @click="rollIncomingAttack"
      >
        Бросить атаку
      </button>

      <div
        v-if="attackResult"
        class="border rounded-lg p-4"
      >
        <h3 class="font-bold">
          Результат атаки
        </h3>

        <div class="mt-3 space-y-2">
          <div class="flex justify-between">
            <span>
              d20
            </span>

            <span class="font-semibold">
              {{ attackResult.roll }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>
              Модификатор атаки
            </span>

            <span class="font-semibold">
              {{ attackResult.modifier >= 0 ? '+' : '' }}{{ attackResult.modifier }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>
              Итог
            </span>

            <span class="font-semibold">
              {{ attackResult.total }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>
              AC цели
            </span>

            <span class="font-semibold">
              {{ attackResult.targetAC }}
            </span>
          </div>

          <div
            v-if="attackResult.critical"
            class="mt-3 border rounded-lg p-3"
          >
            Натуральная 20 — критическое попадание
          </div>

          <div
            v-else-if="attackResult.criticalFail"
            class="mt-3 border rounded-lg p-3"
          >
            Натуральная 1 — критический промах
          </div>

          <div
            v-else-if="attackResult.hit"
            class="mt-3 border rounded-lg p-3"
          >
            Атака попала
          </div>

          <div
            v-else
            class="mt-3 border rounded-lg p-3"
          >
            Атака промахнулась
          </div>
        </div>
      </div>

      <div
        v-if="attackResult?.hit && targetCanReact && !reactionUsed"
        class="border rounded-lg p-4"
      >
        <h3 class="font-bold">
          Реакция
        </h3>

        <div class="mt-3 space-y-2">
          <button
            v-for="reaction in availableReactions"
            :key="reaction.id"
            type="button"
            class="w-full border rounded-lg p-3 text-left"
            @click="activateReaction(reaction.id)"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold">
                {{ reaction.name }}
              </span>

              <span v-if="reaction.acBonus">
                +{{ reaction.acBonus }} AC
              </span>
            </div>
          </button>
        </div>
      </div>

      <div
        v-if="reactionUsed"
        class="border rounded-lg p-3"
      >
        ↻ {{ reactionResult?.reaction?.name }} использована.
      </div>

      <div
        v-if="attackResult?.hit"
        class="border rounded-lg p-4"
      >
        <h3 class="font-bold">
          Урон
        </h3>

        <button
          type="button"
          class="w-full mt-3 border rounded-lg p-3 font-semibold"
          :disabled="!!damageResult"
          @click="applyIncomingDamage"
        >
          Бросить урон
        </button>

        <div
          v-if="damageResult"
          class="mt-3 space-y-2"
        >
          <div class="flex justify-between">
            <span>
              Бросок урона
            </span>

            <span class="font-semibold">
              {{ damageResult.total }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>
              Модификатор
            </span>

            <span class="font-semibold">
              {{ damageResult.modifier >= 0 ? '+' : '' }}{{ damageResult.modifier }}
            </span>
          </div>

          <div class="flex justify-between">
            <span>
              Итоговый урон
            </span>

            <span class="font-semibold">
              {{ damageResult.totalDamage }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="appliedDamage"
        class="border rounded-lg p-3"
      >
        <div class="flex justify-between">
          <span>
            Получено урона
          </span>

          <span class="font-semibold">
            {{ appliedDamage.damage }}
          </span>
        </div>

        <div class="flex justify-between mt-2">
          <span>
            Осталось HP
          </span>

          <span class="font-semibold">
            {{ appliedDamage.currentHP }}
          </span>
        </div>
      </div>

      <button
        v-if="attackResult"
        type="button"
        class="w-full border rounded-lg p-3"
        @click="resetAttack"
      >
        Сбросить атаку
      </button>
    </div>
  </div>
</template>