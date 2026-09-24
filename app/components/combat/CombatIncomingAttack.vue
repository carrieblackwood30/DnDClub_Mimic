<script setup>
import { computed, ref } from 'vue'

const combatStore = useCombatStore()

const {
  getAvailableReactions,
  useReactionEffect,
  getEffectiveArmorClass,
  establishMeleeEngagement
} = useCombat()

const {
  rollD20,
  rollDamage
} = useDice()

const {
  resolveAttack
} = useAttackResolution()

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
  if (!attackerId.value) {
    return null
  }

  return combatStore.participants.find(
    participant =>
      participant.id === attackerId.value
  ) ?? null
})

const target = computed(() => {
  if (!targetId.value) {
    return null
  }

  return combatStore.participants.find(
    participant =>
      participant.id === targetId.value
  ) ?? null
})

const availableReactions = computed(() => {
  if (!target.value) {
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
  if (!target.value) {
    return 0
  }

  return getEffectiveArmorClass(target.value.id)
})

const rollIncomingAttack = () => {
  if (!attacker.value || !target.value) {
    return
  }

  if (target.value.currentHP <= 0) {
    return
  }

  attackResult.value = null
  damageResult.value = null
  appliedDamage.value = null
  reactionUsed.value = false
  reactionResult.value = null

  const roll = rollD20()
  const modifier = attacker.value.attackModifier ?? 0
  const targetAC = getEffectiveArmorClass(target.value.id)

  const resolution = resolveAttack(
    roll,
    modifier,
    targetAC
  )

  establishMeleeEngagement(
    attacker.value.id,
    target.value.id
  )

  attackResult.value = {
    roll,
    modifier,
    ...resolution,
    targetAC
  }

  combatStore.createPendingAttack({
    attackerId: attacker.value.id,
    targetId: target.value.id,
    attackRoll: roll,
    attackModifier: modifier,
    targetAC,
    hit: resolution.hit,
    critical: resolution.critical
  })

  if (!resolution.hit) {
    combatStore.clearPendingAttack()
  }
}

const applyIncomingDamage = () => {
  if (!attacker.value || !target.value) {
    return
  }

  if (!attackResult.value?.hit) {
    return
  }

  const damage = rollDamage(
    attacker.value.damage,
    {
      critical: attackResult.value.critical
    }
  )

  if (!damage) {
    return
  }

  const totalDamage =
    damage.total +
    (attacker.value.damageModifier ?? 0)

  damageResult.value = {
    ...damage,
    modifier: attacker.value.damageModifier ?? 0,
    totalDamage
  }

  appliedDamage.value = combatStore.applyDamage(
    target.value.id,
    totalDamage
  )

  combatStore.resolvePendingAttack()
}

const activateReaction = (reactionId) => {
  if (!target.value) {
    return
  }

  if (!attackResult.value?.hit) {
    return
  }

  if (attackResult.value.critical) {
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

  const resolution = resolveAttack(
    attackResult.value.roll,
    attackResult.value.modifier,
    effectiveAC
  )

  attackResult.value = {
    ...attackResult.value,
    ...resolution,
    targetAC: effectiveAC
  }

  if (resolution.hit) {
    combatStore.setPendingAttack({
      ...combatStore.pendingAttack,
      hit: true,
      critical: resolution.critical,
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
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Входящая атака
    </h2>

    <div class="mt-4 grid gap-3">
      <div>
        <label class="block text-sm font-semibold mb-1">
          Атакующий
        </label>

        <select
          v-model="attackerId"
          class="border rounded px-3 py-1"
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
        <label class="block text-sm font-semibold mb-1">
          Цель
        </label>

        <select
          v-model="targetId"
          class="border rounded px-3 py-1"
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
            — HP {{ participant.currentHP }}/{{ participant.maxHP }}
          </option>
        </select>
      </div>
    </div>

    <button
      type="button"
      class="mt-4 border rounded px-3 py-1"
      :disabled="!attacker || !target"
      @click="rollIncomingAttack"
    >
      ⚔ Бросить атаку
    </button>

    <div
      v-if="attackResult"
      class="mt-4 border-t pt-4"
    >
      <p class="font-semibold">
        Результат атаки
      </p>

      <div class="mt-3 space-y-1">
        <p>
          Бросок:
          <strong>{{ attackResult.roll }}</strong>
        </p>

        <p>
          Модификатор:
          <strong>
            {{ attackResult.modifier >= 0 ? '+' : '' }}{{ attackResult.modifier }}
          </strong>
        </p>

        <p>
          Итог:
          <strong>{{ attackResult.total }}</strong>
        </p>

        <p>
          AC при атаке:
          <strong>{{ attackResult.targetAC }}</strong>
        </p>

        <p>
          Текущий AC:
          <strong>{{ effectiveTargetAC }}</strong>
        </p>
      </div>

      <div
        v-if="attackResult.critical"
        class="mt-3 border rounded-lg p-3"
      >
        🎯 КРИТИЧЕСКОЕ ПОПАДАНИЕ!
      </div>

      <div
        v-else-if="attackResult.criticalFail"
        class="mt-3 border rounded-lg p-3"
      >
        💀 КРИТИЧЕСКИЙ ПРОМАХ!
      </div>

      <div
        v-else-if="attackResult.hit"
        class="mt-3 border rounded-lg p-3"
      >
        ⚔ ПОПАДАНИЕ!
      </div>

      <div
        v-else
        class="mt-3 border rounded-lg p-3"
      >
        ✕ ПРОМАХ!
      </div>

      <div
        v-if="
          attackResult.hit &&
          !attackResult.critical &&
          targetCanReact &&
          !reactionUsed
        "
        class="mt-4 border rounded-lg p-3"
      >
        <p class="font-semibold">
          ⚠ {{ target.name }} может использовать Reaction
        </p>

        <div class="space-y-2">
          <div class="font-semibold">
            Доступные реакции
          </div>

          <button
            v-for="reaction in availableReactions"
            :key="reaction.id"
            type="button"
            class="w-full border rounded-lg p-3 text-left"
            @click="activateReaction(reaction.id)"
          >
            <div class="font-semibold">
              {{ reaction.name }}
            </div>

            <div
              v-if="reaction.acBonus"
              class="text-sm"
            >
              +{{ reaction.acBonus }} к AC
            </div>
          </button>
        </div>
      </div>

      <div
        v-if="attackResult.hit && !damageResult"
        class="mt-4"
      >
        <button
          type="button"
          class="border rounded px-3 py-1"
          @click="applyIncomingDamage"
        >
          🎲 Бросить урон
        </button>
      </div>

      <div
        v-if="reactionUsed"
        class="mt-4 border rounded-lg p-3"
      >
        ↻ Reaction использована
      </div>

      <div
        v-if="damageResult"
        class="mt-4 border-t pt-4"
      >
        <p class="font-semibold">
          Результат урона
        </p>

        <p class="mt-2">
          Кубики:
          <strong>
            {{ damageResult.rolls.join(', ') }}
          </strong>
        </p>

        <p>
          Сумма кубиков:
          <strong>{{ damageResult.total }}</strong>
        </p>

        <p>
          Модификатор:
          <strong>
            {{ damageResult.modifier >= 0 ? '+' : '' }}{{ damageResult.modifier }}
          </strong>
        </p>

        <p>
          Общий урон:
          <strong>{{ damageResult.totalDamage }}</strong>
        </p>

        <p
          v-if="appliedDamage"
          class="mt-2"
        >
          HP цели:
          <strong>
            {{ appliedDamage.currentHP }}/{{ appliedDamage.maxHP }}
          </strong>
        </p>

        <p
          v-if="appliedDamage?.defeated"
          class="mt-2 font-semibold"
        >
          💀 Цель повержена
        </p>
      </div>

      <button
        type="button"
        class="mt-4 border rounded px-3 py-1"
        @click="resetAttack"
      >
        Сбросить атаку
      </button>
    </div>
  </div>
</template>