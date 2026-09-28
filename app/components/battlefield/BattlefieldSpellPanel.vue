<script setup>
import { computed, ref } from 'vue'
import { useCombatStore } from '~/stores/combat'
import { useBattlefieldStore } from '~/stores/battlefield'
import { useCombatSpellcasting } from '~/composables/useCombatSpellcasting'

const combatStore = useCombatStore()
const battlefieldStore = useBattlefieldStore()

const {
  getAvailableCantrips,
  getAvailableLevelledSpells,
  canCastSpell,
  castSpell,
  resolveSpell,
  getSpellAttackBonus,
  getSpellSaveDC,
  getSpellRangeFeet,
  getSpellRangeLabel,
  canResolveSpellTarget
} = useCombatSpellcasting()

const selectedSpellId = ref(null)
const selectedTargetId = ref(null)
const resultMessage = ref('')
const result = ref(null)

const participant = computed(() => {
  return combatStore.currentParticipant ?? null
})

const participantId = computed(() => participant.value?.id ?? null)

const cantrips = computed(() => {
  if (!participantId.value) return []
  return getAvailableCantrips(participantId.value)
})

const levelledSpells = computed(() => {
  if (!participantId.value) return []
  return getAvailableLevelledSpells(participantId.value)
})

const allSpells = computed(() => [
  ...cantrips.value,
  ...levelledSpells.value
])

const selectedSpell = computed(() => {
  return allSpells.value.find(
    spell => spell.id === selectedSpellId.value
  ) ?? null
})

const targets = computed(() => {
  if (!participantId.value) return []

  return combatStore.participants.filter(participantItem => {
    return (
      participantItem.id !== participantId.value &&
      Number(participantItem.currentHP ?? 0) > 0
    )
  })
})

const selectedTarget = computed(() => {
  return targets.value.find(
    target => target.id === selectedTargetId.value
  ) ?? null
})

const requiresTarget = computed(() => {
  const type = selectedSpell.value?.resolution?.type

  return (
    type === 'attack' ||
    type === 'saving-throw' ||
    type === 'automatic-hit'
  )
})

const isAreaSpell = computed(() => {
  const spell = selectedSpell.value
  if (!spell) return false

  return Boolean(
    spell.area ||
    spell.special ||
    spell.resolution?.type === 'special'
  )
})

const spellContext = computed(() => {
  if (
    !participantId.value ||
    !selectedTargetId.value ||
    !selectedSpell.value
  ) {
    return null
  }

  const casterToken = battlefieldStore.tokens.find(
    token => token.combatParticipantId === participantId.value
  )

  const targetToken = battlefieldStore.tokens.find(
    token => token.combatParticipantId === selectedTargetId.value
  )

  if (!casterToken || !targetToken) {
    return null
  }

  return battlefieldStore.getCombatSpellContext(
    casterToken.id,
    targetToken.id,
    selectedSpell.value
  )
})

const canUseSelectedSpell = computed(() => {
  if (!participantId.value || !selectedSpell.value) {
    return false
  }

  if (!canCastSpell(participantId.value, selectedSpell.value)) {
    return false
  }

  if (!requiresTarget.value) {
    return !isAreaSpell.value
  }

  if (!selectedTargetId.value) {
    return false
  }

  return canResolveSpellTarget(
    participantId.value,
    selectedSpell.value,
    selectedTargetId.value,
    spellContext.value?.distanceFeet
  )
})

const selectSpell = spell => {
  selectedSpellId.value = spell.id
  selectedTargetId.value = null
  resultMessage.value = ''
  result.value = null
}

const clearSelection = () => {
  selectedSpellId.value = null
  selectedTargetId.value = null
  resultMessage.value = ''
  result.value = null
}

const getSpellState = spell => {
  if (!participantId.value) return '—'

  if (!canCastSpell(participantId.value, spell)) {
    if (spell.level > 0) {
      return 'Нет ячейки / недоступно'
    }

    return 'Недоступно'
  }

  if (spell.resolution?.type === 'attack') {
    return `Атака +${getSpellAttackBonus(participantId.value)}`
  }

  if (spell.resolution?.type === 'saving-throw') {
    return `Спасбросок ${String(spell.resolution.ability).toUpperCase()} · СЛ ${getSpellSaveDC(participantId.value)}`
  }

  if (spell.resolution?.type === 'automatic-hit') {
    return 'Автоматическое попадание'
  }

  if (spell.resolution?.type === 'reaction') {
    return 'Реакция'
  }

  if (spell.area || spell.special) {
    return 'Особое / область'
  }

  return 'Эффект'
}

const getTargetState = target => {
  if (!selectedSpell.value) return ''

  const casterToken = battlefieldStore.tokens.find(
    token => token.combatParticipantId === participantId.value
  )
  const targetToken = battlefieldStore.tokens.find(
    token => token.combatParticipantId === target.id
  )

  if (!casterToken || !targetToken) {
    return 'Нет токена'
  }

  const context = battlefieldStore.getCombatSpellContext(
    casterToken.id,
    targetToken.id,
    selectedSpell.value
  )

  if (!context.withinRange) {
    return `Вне дальности · ${context.distanceFeet} / ${getSpellRangeLabel(selectedSpell.value)}`
  }

  return `${context.distanceFeet} ft`
}

const getCastError = reason => {
  const labels = {
    'spell-unavailable': 'Заклинание недоступно.',
    'spell-slot-unavailable': 'Нет доступной ячейки заклинания.',
    'casting-time-unavailable': 'Действие / бонусное действие / реакция уже использованы.',
    'invalid-target': 'Недопустимая цель.',
    'target-unconscious': 'Цель без сознания.',
    'out-of-range': 'Цель находится вне дальности заклинания.',
    'area-spell-not-supported': 'Это заклинание требует отдельного выбора области.'
  }

  return labels[reason] ?? 'Не удалось использовать заклинание.'
}

const getResultText = resolution => {
  if (!resolution?.success) {
    return getCastError(resolution?.reason)
  }

  const target = combatStore.participants.find(
    item => item.id === resolution.targetId
  )
  const targetName = target?.name ?? 'цель'

  if (resolution.type === 'attack') {
    if (resolution.critical) {
      return `${resolution.spell.name}: КРИТ! d20 ${resolution.roll}. ${targetName} получает ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''} урона.`
    }

    if (resolution.criticalFailure) {
      return `${resolution.spell.name}: критический промах. d20 ${resolution.roll}.`
    }

    if (!resolution.hit) {
      return `${resolution.spell.name}: промах. d20 ${resolution.roll} + ${resolution.attackBonus} против AC ${resolution.targetAC}.`
    }

    return `${resolution.spell.name}: попадание. d20 ${resolution.roll} + ${resolution.attackBonus} = ${resolution.total}. ${targetName} получает ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''} урона.`
  }

  if (resolution.type === 'saving-throw') {
    if (resolution.passed) {
      return `${resolution.spell.name}: ${targetName} прошёл спасбросок ${String(resolution.ability).toUpperCase()} (${resolution.total} против СЛ ${resolution.saveDC}). Урон: ${resolution.damage?.total ?? 0}.`
    }

    return `${resolution.spell.name}: ${targetName} провалил спасбросок ${String(resolution.ability).toUpperCase()} (${resolution.total} против СЛ ${resolution.saveDC}). Урон: ${resolution.damage?.total ?? 0}.`
  }

  if (resolution.type === 'automatic-hit') {
    return `${resolution.spell.name}: автоматическое попадание по ${targetName}. Урон: ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''}.`
  }

  return `${resolution.spell.name}: заклинание использовано.`
}

const castSelectedSpell = () => {
  const spell = selectedSpell.value
  const casterId = participantId.value
  const targetId = selectedTargetId.value

  if (!spell || !casterId) return

  if (isAreaSpell.value) {
    resultMessage.value = 'Это заклинание требует выбора области. Для него пока не тратится действие.'
    return
  }

  if (!canUseSelectedSpell.value) {
    if (requiresTarget.value && spellContext.value && !spellContext.value.withinRange) {
      resultMessage.value = `Цель вне дальности: ${spellContext.value.distanceFeet} / ${getSpellRangeLabel(spell)}.`
      return
    }

    resultMessage.value = 'Заклинание сейчас недоступно.'
    return
  }

  const castResult = castSpell(
    casterId,
    spell
  )

  if (!castResult.success) {
    resultMessage.value = getCastError(castResult.reason)
    return
  }

  const resolution = resolveSpell(
    casterId,
    targetId,
    spell,
    {
      slotLevel: castResult.slotLevel
    }
  )

  result.value = resolution

  if (!resolution.success) {
    resultMessage.value = getCastError(resolution.reason)
    return
  }

  if (resolution.damage?.success && resolution.damage.total > 0) {
    combatStore.applyDamage(
      resolution.targetId,
      resolution.damage.total
    )
  }

  resultMessage.value = getResultText(resolution)
}
</script>

<template>
  <section class="mt-3 rounded-2xl border border-[#496b78] bg-[#111b1e]/95 p-4 text-[#e7f1ee] shadow-2xl">
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#83aeb8]">
          Заклинания
        </div>
        <div class="mt-1 text-sm font-semibold">
          {{ participant?.name ?? 'Нет активного заклинателя' }}
        </div>
      </div>

      <button
        v-if="selectedSpell"
        type="button"
        class="rounded-lg border border-[#53676b] px-2 py-1 text-[10px] text-[#c5d4d6]"
        @click="clearSelection"
      >
        Сбросить
      </button>
    </div>

    <div
      v-if="!participant"
      class="mt-3 rounded-xl border border-[#4a5558] bg-black/20 p-3 text-[11px] text-[#9eb0b3]"
    >
      Сейчас нет участника, который может использовать заклинания.
    </div>

    <template v-else>
      <div class="mt-3 grid gap-2 md:grid-cols-2">
        <button
          v-for="spell in allSpells"
          :key="spell.id"
          type="button"
          class="rounded-xl border p-3 text-left transition"
          :class="selectedSpellId === spell.id
            ? 'border-[#c9a95f] bg-[#2a2116]'
            : 'border-[#33464a] bg-[#172125] hover:border-[#607c82]'"
          @click="selectSpell(spell)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="font-semibold text-[12px]">
              {{ spell.name }}
            </div>
            <span class="text-[9px] text-[#91a7aa]">
              {{ spell.level === 0 ? 'Заговор' : `${spell.level} ур.` }}
            </span>
          </div>

          <div class="mt-1 text-[10px] text-[#a9bbbd]">
            {{ getSpellRangeLabel(spell) }} · {{ getSpellState(spell) }}
          </div>
        </button>

        <div
          v-if="!allSpells.length"
          class="rounded-xl border border-[#4a5558] bg-black/20 p-3 text-[11px] text-[#9eb0b3] md:col-span-2"
        >
          У этого участника нет известных или подготовленных заклинаний.
        </div>
      </div>

      <div
        v-if="selectedSpell"
        class="mt-3 rounded-xl border border-[#526c73] bg-black/20 p-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold">
              {{ selectedSpell.name }}
            </div>
            <div class="mt-1 text-[10px] text-[#a9bbbd]">
              {{ getSpellRangeLabel(selectedSpell) }}
              <span v-if="selectedSpell.resolution?.type === 'attack'">
                · атака +{{ getSpellAttackBonus(participantId) }}
              </span>
              <span v-else-if="selectedSpell.resolution?.type === 'saving-throw'">
                · {{ String(selectedSpell.resolution.ability).toUpperCase() }} СЛ {{ getSpellSaveDC(participantId) }}
              </span>
              <span v-else-if="selectedSpell.resolution?.type === 'automatic-hit'">
                · автоматическое попадание
              </span>
            </div>
          </div>

          <span class="rounded-full border border-[#405b60] px-2 py-1 text-[9px] text-[#a9bbbd]">
            {{ getSpellState(selectedSpell) }}
          </span>
        </div>

        <div
          v-if="isAreaSpell"
          class="mt-3 rounded-lg border border-[#715b39] bg-[#2a2116] p-3 text-[10px] text-[#d7c397]"
        >
          Это особое или площадное заклинание. Его не превращаем в одиночную атаку: область и её направление подключим отдельным шагом.
        </div>

        <div v-if="requiresTarget" class="mt-3">
          <label class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#91a7aa]">
            Цель
          </label>

          <select
            v-model="selectedTargetId"
            class="mt-1 w-full rounded-lg border border-[#40565a] bg-[#0d1416] px-3 py-2 text-xs text-[#e3eeee] outline-none"
          >
            <option :value="null">
              Выберите цель
            </option>
            <option
              v-for="target in targets"
              :key="target.id"
              :value="target.id"
            >
              {{ target.name }} · HP {{ target.currentHP }}/{{ target.maxHP }} · {{ getTargetState(target) }}
            </option>
          </select>
        </div>

        <div
          v-if="spellContext"
          class="mt-2 flex flex-wrap gap-2 text-[10px]"
        >
          <span class="rounded-full border border-[#405b60] px-2 py-1">
            Дистанция: {{ spellContext.distanceFeet }} ft
          </span>
          <span
            class="rounded-full border px-2 py-1"
            :class="spellContext.withinRange ? 'border-[#4e7659] text-[#b9d8bd]' : 'border-[#744b47] text-[#e0aaa3]'"
          >
            {{ spellContext.withinRange ? 'В дальности' : 'Вне дальности' }}
          </span>
        </div>

        <button
          v-if="requiresTarget && !isAreaSpell"
          type="button"
          class="mt-3 w-full rounded-xl border px-4 py-2.5 text-xs font-semibold transition"
          :class="canUseSelectedSpell
            ? 'border-[#789b73] bg-[#22351f] text-[#d8ead3] hover:bg-[#2d4729]'
            : 'cursor-not-allowed border-[#3e4547] bg-[#151a1b] text-[#687274]'"
          :disabled="!canUseSelectedSpell"
          @click="castSelectedSpell"
        >
          ✨ Наложить заклинание
        </button>

        <div
          v-if="resultMessage"
          class="mt-3 rounded-lg border border-[#4e6d54] bg-[#142016] p-3 text-[11px] text-[#d3e7d0]"
        >
          {{ resultMessage }}
        </div>
      </div>
    </template>
  </section>
</template>
