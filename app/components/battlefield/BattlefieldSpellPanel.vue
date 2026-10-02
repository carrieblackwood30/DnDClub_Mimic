<script setup>
import { computed, ref } from 'vue'
import { useCombatStore } from '~/stores/combat'
import { useBattlefieldStore } from '~/stores/battlefield'
import { useCombat } from '~/composables/useCombat'
import { useCombatSpellcasting } from '~/composables/useCombatSpellcasting'

const combatStore = useCombatStore()
const battlefieldStore = useBattlefieldStore()

const {
  useReactionEffect,
  getEffectiveArmorClass
} = useCombat()

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
const selectedSlotLevel = ref(null)
const resultMessage = ref('')
const resultDetails = ref([])
const isResolving = ref(false)

const participant = computed(() => combatStore.currentParticipant ?? null)
const participantId = computed(() => participant.value?.id ?? null)

const casterToken = computed(() => {
  if (!participantId.value) return null

  return battlefieldStore.tokens.find(
    token => token.combatParticipantId === participantId.value
  ) ?? null
})

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

  return combatStore.participants.filter(item => {
    return (
      item.id !== participantId.value &&
      Number(item.currentHP ?? 0) > 0
    )
  })
})

const selectedTarget = computed(() => {
  return targets.value.find(
    target => target.id === selectedTargetId.value
  ) ?? null
})

const selectedTargetToken = computed(() => {
  if (!selectedTargetId.value) return null

  return battlefieldStore.tokens.find(
    token => token.combatParticipantId === selectedTargetId.value
  ) ?? null
})

const selectedTargetContext = computed(() => {
  if (
    !participantId.value ||
    !selectedTargetId.value ||
    !selectedSpell.value ||
    !casterToken.value ||
    !selectedTargetToken.value
  ) {
    return null
  }

  return battlefieldStore.getSpellTargetContext(
    casterToken.value.id,
    selectedTargetToken.value.id
  )
})

const selectedSpellAreaContext = computed(() => {
  const spell = selectedSpell.value

  if (
    !spell ||
    spell.target?.type !== 'creatures-in-area' ||
    !casterToken.value ||
    !selectedTargetToken.value
  ) {
    return null
  }

  const direction = battlefieldStore.getSpellAreaDirection(
    casterToken.value.id,
    selectedTargetToken.value.position
  )

  if (!direction) return null

  return battlefieldStore.getSpellAreaContext({
    casterTokenId: casterToken.value.id,
    direction,
    sizeFeet: spell.area?.size ?? 15
  })
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

  return spell.target?.type === 'creatures-in-area'
})

const availableSlotLevels = computed(() => {
  const result = []
  if (!participantId.value) return result

  for (let level = 1; level <= 9; level += 1) {
    const current = combatStore.getCurrentSpellSlotCount?.(
      participantId.value,
      level
    ) ?? (participant.value?.currentSpellSlots?.[level - 1] ?? 0)

    const maximum = combatStore.getMaxSpellSlotCount?.(
      participantId.value,
      level
    ) ?? (participant.value?.spellSlots?.[level - 1] ?? 0)

    if (maximum > 0) {
      result.push({ level, current, maximum })
    }
  }

  return result
})

const castableSlotLevels = computed(() => {
  if (!selectedSpell.value || selectedSpell.value.level === 0) return []

  return availableSlotLevels.value.filter(
    slot =>
      slot.level >= selectedSpell.value.level &&
      slot.current > 0
  )
})

const pendingAttack = computed(() => combatStore.pendingAttack ?? null)

const isShieldReaction = computed(() => {
  return selectedSpell.value?.id === 'shield' &&
    selectedSpell.value?.resolution?.type === 'reaction'
})

const canUseShieldReaction = computed(() => {
  if (!participantId.value || !isShieldReaction.value) return false

  const attack = pendingAttack.value
  if (!attack?.hit) return false

  return !attack.critical && !participant.value?.reactionUsed
})

const getSpellState = spell => {
  if (!participantId.value) return '—'

  if (!canCastSpell(participantId.value, spell)) {
    if (spell.resolution?.type === 'reaction') {
      return 'Реакция недоступна'
    }

    if (spell.level > 0) {
      return 'Нет доступной ячейки'
    }

    return 'Недоступно'
  }

  if (spell.resolution?.type === 'attack') {
    return `Атака +${getSpellAttackBonus(participantId.value)}`
  }

  if (spell.resolution?.type === 'saving-throw') {
    return `Спасбросок ${String(spell.resolution.ability ?? '').toUpperCase()} · СЛ ${getSpellSaveDC(participantId.value)}`
  }

  if (spell.resolution?.type === 'automatic-hit') {
    return 'Автоматическое попадание'
  }

  if (spell.resolution?.type === 'reaction') {
    return pendingAttack.value?.hit ? 'Реакция · доступна' : 'Реакция · ожидает триггер'
  }

  return 'Готово'
}

const selectSpell = spell => {
  resultMessage.value = ''
  resultDetails.value = []
  selectedSpellId.value = spell.id
  selectedTargetId.value = null
  selectedSlotLevel.value = spell.level === 0
    ? 0
    : (availableSlotLevels.value.find(
        slot => slot.level >= spell.level && slot.current > 0
      )?.level ?? null)
}

const clearSelection = () => {
  selectedSpellId.value = null
  selectedTargetId.value = null
  selectedSlotLevel.value = null
  resultMessage.value = ''
  resultDetails.value = []
  isResolving.value = false
}

const getSpellTargetState = target => {
  if (!selectedSpell.value) return ''

  const caster = casterToken.value
  const targetToken = battlefieldStore.tokens.find(
    token => token.combatParticipantId === target.id
  )

  if (!caster || !targetToken) {
    return 'Нет токена'
  }

  const context = battlefieldStore.getSpellTargetContext(
    caster.id,
    targetToken.id
  )

  if (!context) return 'Нет контекста'

  if (!context.withinRange) {
    return `Вне дальности · ${context.distanceFeet} / ${getSpellRangeLabel(selectedSpell.value)}`
  }

  if (!context.lineOfSight) {
    return 'Нет Line of Sight'
  }

  if (context.cover === 'total') {
    return 'Полное укрытие'
  }

  return `${context.distanceFeet} ft`
}

const canUseSelectedSpell = computed(() => {
  const spell = selectedSpell.value
  if (!participantId.value || !spell) return false

  if (isShieldReaction.value) {
    return canUseShieldReaction.value
  }

  if (!canCastSpell(participantId.value, spell)) {
    return false
  }

  if (isAreaSpell.value) {
    if (!selectedTargetId.value || !selectedSpellAreaContext.value) {
      return false
    }

    const rangeFeet = getSpellRangeFeet(spell)

    if (rangeFeet === 0) {
      return true
    }

    if (!selectedTargetContext.value) {
      return false
    }

    return (
      selectedTargetContext.value.withinRange &&
      selectedTargetContext.value.lineOfSight &&
      selectedTargetContext.value.cover !== 'total'
    )
  }

  if (!requiresTarget.value) {
    return true
  }

  if (!selectedTargetId.value || !selectedTargetContext.value) {
    return false
  }

  return canResolveSpellTarget(
    participantId.value,
    spell,
    selectedTargetId.value,
    selectedTargetContext.value.distanceFeet,
    selectedTargetContext.value
  )
})

const getCastError = reason => {
  const labels = {
    'spell-unavailable': 'Заклинание недоступно.',
    'spell-slot-unavailable': 'Нет доступной ячейки заклинания.',
    'casting-time-unavailable': 'Действие / бонусное действие / реакция уже использованы.',
    'invalid-target': 'Недопустимая цель.',
    'target-unconscious': 'Цель без сознания.',
    'missing-saving-throw-ability': 'У заклинания не указан тип спасброска.',
    'invalid-area-context': 'Не удалось определить область заклинания.',
    'reaction-unavailable': 'Реакция уже использована.',
    'attack-did-not-hit': 'Реакция больше не нужна: атака не попала.',
    'critical-hit': 'Щит нельзя применить после критического попадания.'
  }

  return labels[reason] ?? 'Не удалось использовать заклинание.'
}

const applyResolutionEffects = resolution => {
  if (!resolution) {
    return resolution
  }

  if (resolution.type === 'area-saving-throw') {
    for (const result of resolution.results ?? []) {
      if (
        result.damage?.success &&
        result.damage.total > 0 &&
        result.combatParticipantId
      ) {
        result.damageApplied = combatStore.applyDamage(
          result.combatParticipantId,
          result.damage.total
        )
      } else {
        result.damageApplied = null
      }

      if (
        result.push?.distanceFeet > 0 &&
        result.tokenId &&
        resolution.area?.casterTokenId
      ) {
        battlefieldStore.pushToken(
          result.tokenId,
          resolution.area.casterTokenId,
          result.push.distanceFeet
        )
      }
    }

    return resolution
  }

  if (
    resolution.damage?.success &&
    resolution.damage.total > 0 &&
    resolution.targetId
  ) {
    resolution.damageApplied = combatStore.applyDamage(
      resolution.targetId,
      resolution.damage.total
    )
  } else {
    resolution.damageApplied = null
  }

  if (
    resolution.push?.distanceFeet > 0 &&
    resolution.targetId &&
    casterToken.value
  ) {
    const targetToken = selectedTargetToken.value
    if (targetToken) {
      battlefieldStore.pushToken(
        targetToken.id,
        casterToken.value.id,
        resolution.push.distanceFeet
      )
    }
  }

  return resolution
}

const getResolutionLines = resolution => {
  if (!resolution?.success) {
    return []
  }

  const formatDamage = damage => {
    const total = Number(damage?.total ?? 0)
    const type = damage?.type ? ` ${damage.type}` : ''
    return `Урон: ${total}${type}`
  }

  const formatAppliedHP = applied => {
    if (!applied) {
      return null
    }

    return `HP цели: ${applied.currentHP}/${applied.maxHP}`
  }

  if (resolution.type === 'attack') {
    const target = combatStore.participants.find(
      item => item.id === resolution.targetId
    )

    const lines = [
      `Цель: ${target?.name ?? '—'}`,
      `d20 ${resolution.roll} ${resolution.rollMode !== 'normal' ? `(${resolution.rollMode})` : ''}`,
      `Итог: ${resolution.total} против AC ${resolution.targetAC}`,
      `Бонус атаки: ${resolution.attackBonus >= 0 ? '+' : ''}${resolution.attackBonus}`,
      resolution.hit
        ? 'Результат: ПОПАДАНИЕ'
        : (resolution.criticalFailure ? 'Результат: КРИТИЧЕСКИЙ ПРОМАХ' : 'Результат: ПРОМАХ')
    ]

    if (resolution.hit) {
      lines.push(formatDamage(resolution.damage))

      if (resolution.damage?.rolls?.length) {
        lines.push(
          `Кости урона: ${resolution.damage.dice} · ${resolution.damage.rolls.join(' + ')}`
        )
      }

      const hpLine = formatAppliedHP(
        resolution.damageApplied
      )

      if (hpLine) {
        lines.push(hpLine)
      }

      if (resolution.critical) {
        lines.push('Критическое попадание · кости урона удвоены')
      }

      if (resolution.damageApplied?.defeated) {
        lines.push('Цель повержена')
      }
    }

    return lines
  }

  if (resolution.type === 'saving-throw') {
    const target = combatStore.participants.find(
      item => item.id === resolution.targetId
    )

    const lines = [
      `Цель: ${target?.name ?? '—'}`,
      `${String(resolution.ability ?? '').toUpperCase()} спасбросок`,
      `d20 ${resolution.roll} + ${resolution.saveBonus} = ${resolution.total}`,
      `${resolution.passed ? 'Результат: УСПЕХ' : 'Результат: ПРОВАЛ'} против СЛ ${resolution.saveDC}`
    ]

    if (resolution.damage) {
      lines.push(formatDamage(resolution.damage))

      if (resolution.damage?.rolls?.length) {
        lines.push(
          `Кости урона: ${resolution.damage.dice} · ${resolution.damage.rolls.join(' + ')}`
        )
      }
    }

    const hpLine = formatAppliedHP(
      resolution.damageApplied
    )

    if (hpLine) {
      lines.push(hpLine)
    }

    if (resolution.push?.distanceFeet > 0) {
      lines.push(`Отталкивание: ${resolution.push.distanceFeet} ft`)
    }

    if (resolution.sleep?.applied) {
      lines.push('Наложен эффект сна')
    }

    if (resolution.sleep?.immune) {
      lines.push('Цель невосприимчива ко сну')
    }

    if (resolution.damageApplied?.defeated) {
      lines.push('Цель повержена')
    }

    return lines
  }

  if (resolution.type === 'area-saving-throw') {
    if (!(resolution.results ?? []).length) {
      return ['В области нет существ для спасброска.']
    }

    return (resolution.results ?? []).flatMap(result => {
      const target = combatStore.participants.find(
        item => item.id === result.combatParticipantId
      )

      const lines = [
        `Цель: ${target?.name ?? '—'}`,
        `${String(result.ability ?? '').toUpperCase()} · d20 ${result.roll} + ${result.saveBonus} = ${result.total}`,
        `${result.passed ? 'Результат: УСПЕХ' : 'Результат: ПРОВАЛ'} против СЛ ${result.saveDC}`
      ]

      if (result.damage) {
        lines.push(formatDamage(result.damage))
      }

      const hpLine = formatAppliedHP(
        result.damageApplied
      )

      if (hpLine) {
        lines.push(hpLine)
      }

      if (result.push?.distanceFeet > 0) {
        lines.push(`Отталкивание: ${result.push.distanceFeet} ft`)
      }

      if (result.sleep?.applied) {
        lines.push('Наложен эффект сна')
      }

      if (result.damageApplied?.defeated) {
        lines.push('Цель повержена')
      }

      return lines
    })
  }

  if (resolution.type === 'automatic-hit') {
    const lines = [
      'Автоматическое попадание',
      formatDamage(resolution.damage)
    ]

    const hpLine = formatAppliedHP(
      resolution.damageApplied
    )

    if (hpLine) {
      lines.push(hpLine)
    }

    if (resolution.damageApplied?.defeated) {
      lines.push('Цель повержена')
    }

    return lines
  }

  return ['Заклинание использовано.']
}

const castSelectedSpell = () => {
  const spell = selectedSpell.value
  const casterId = participantId.value

  if (!spell || !casterId) return

  isResolving.value = true
  resultMessage.value = ''
  resultDetails.value = []

  if (isShieldReaction.value) {
    const result = useReactionEffect(
      casterId,
      'shield',
      {
        trigger: 'incoming-attack',
        attackResult: pendingAttack.value
      }
    )

    if (!result.success) {
      resultMessage.value = getCastError(result.reason)
      isResolving.value = false
      return
    }

    const attacker = pendingAttack.value?.attackerId
      ? combatStore.participants.find(
          item => item.id === pendingAttack.value.attackerId
        )
      : null

    resultMessage.value = `Щит: +5 AC до начала вашего следующего хода.`
    resultDetails.value = [
      `Атака: d20 ${pendingAttack.value?.attackRoll ?? '—'} + ${pendingAttack.value?.attackModifier ?? 0}`,
      `AC после Щита: ${getEffectiveArmorClass(casterId)}`,
      attacker ? `Атакующий: ${attacker.name}` : 'Атакующий не указан'
    ]

    isResolving.value = false
    return
  }

  if (!canUseSelectedSpell.value) {
    resultMessage.value = 'Заклинание сейчас недоступно или цель не подходит.'
    isResolving.value = false
    return
  }

  const slotLevel = spell.level === 0
    ? 0
    : selectedSlotLevel.value

  const castResult = castSpell(
    casterId,
    spell,
    { slotLevel }
  )

  if (!castResult.success) {
    resultMessage.value = getCastError(castResult.reason)
    isResolving.value = false
    return
  }

  if (!castResult.requiresResolution) {
    resultMessage.value = `${spell.name}: заклинание использовано.`
    resultDetails.value = [
      `Дальность: ${getSpellRangeLabel(spell)}`,
      spell.concentration ? 'Требует концентрации' : 'Концентрация не требуется'
    ]
    isResolving.value = false
    return
  }

  const resolution = resolveSpell(
    casterId,
    isAreaSpell.value ? null : selectedTargetId.value,
    spell,
    {
      slotLevel: castResult.slotLevel,
      tokenId: selectedTargetToken.value?.id ?? null,
      areaContext: selectedSpellAreaContext.value,
      targetContext: selectedTargetContext.value,
      withinFiveFeetOfHostile:
        selectedTargetContext.value?.withinFiveFeetOfHostile ?? false
    }
  )

  if (!resolution.success) {
    resultMessage.value = getCastError(resolution.reason)
    isResolving.value = false
    return
  }

  applyResolutionEffects(resolution)

  const spellName = resolution.spell?.name ?? spell.name

  if (resolution.type === 'attack') {
    const target = combatStore.participants.find(
      item => item.id === resolution.targetId
    )
    const targetName = target?.name ?? 'цель'

    resultMessage.value = resolution.hit
      ? `${spellName}: попадание по ${targetName}.`
      : `${spellName}: ${resolution.criticalFailure ? 'критический промах по' : 'промах по'} ${targetName}.`
  } else if (resolution.type === 'saving-throw') {
    const target = combatStore.participants.find(
      item => item.id === resolution.targetId
    )
    const targetName = target?.name ?? 'цель'

    resultMessage.value = resolution.passed
      ? `${spellName}: ${targetName} успешно прошёл спасбросок.`
      : `${spellName}: ${targetName} провалил спасбросок.`
  } else if (resolution.type === 'area-saving-throw') {
    resultMessage.value = `${spellName}: спасброски разрешены.`
  } else if (resolution.type === 'automatic-hit') {
    resultMessage.value = `${spellName}: автоматическое попадание.`
  } else {
    resultMessage.value = `${spellName}: заклинание использовано.`
  }

  resultDetails.value = getResolutionLines(resolution)

  isResolving.value = false
}
</script>

<template>
  <section class="rounded-2xl border border-[#675338] bg-[#14110d]/95 text-[#eee3cd] shadow-2xl backdrop-blur-xl">
    <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div class="min-w-0">
        <div class="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a58a59]">
          Боевые заклинания
        </div>
        <div class="mt-1 truncate text-sm font-semibold">
          {{ participant?.name ?? 'Нет активного заклинателя' }}
        </div>
      </div>

      <button
        v-if="selectedSpell"
        type="button"
        class="rounded-lg border border-[#5d4c34] px-2 py-1 text-[9px] text-[#cdbd9f]"
        @click="clearSelection"
      >
        Назад
      </button>
    </div>

    <div class="max-h-[calc(100vh-10rem)] overflow-y-auto p-3">
      <div
        v-if="!participant"
        class="rounded-xl border border-white/10 bg-black/20 p-3 text-[10px] text-[#9f927d]"
      >
        Сейчас нет участника, который может использовать заклинания.
      </div>

      <template v-else>
        <div
          v-if="!selectedSpell"
          class="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <button
            v-for="spell in allSpells"
            :key="spell.id"
            type="button"
            class="rounded-xl border border-[#403a31] bg-[#1a1611] px-3 py-2 text-left transition hover:border-[#756343]"
            @click="selectSpell(spell)"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="text-[11px] font-semibold">
                {{ spell.name }}
              </span>
              <span class="text-[8px] text-[#9b8d76]">
                {{ spell.level === 0 ? 'Заговор' : `${spell.level} ур.` }}
              </span>
            </div>

            <div class="mt-1 text-[9px] text-[#a99c88]">
              {{ getSpellRangeLabel(spell) }} · {{ getSpellState(spell) }}
            </div>
          </button>

          <div
            v-if="!allSpells.length"
            class="rounded-xl border border-white/10 bg-black/20 p-3 text-[10px] text-[#9f927d] sm:col-span-2"
          >
            У текущего участника нет доступных заклинаний.
          </div>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div class="rounded-xl border border-[#514634] bg-[#1a1611] p-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">
                  {{ selectedSpell.name }}
                </div>
                <div class="mt-1 text-[9px] text-[#a99c88]">
                  {{ getSpellRangeLabel(selectedSpell) }}
                  <span v-if="selectedSpell.resolution?.type === 'attack'">
                    · атака +{{ getSpellAttackBonus(participantId) }}
                  </span>
                  <span v-else-if="selectedSpell.resolution?.type === 'saving-throw'">
                    · {{ String(selectedSpell.resolution.ability).toUpperCase() }} СЛ {{ getSpellSaveDC(participantId) }}
                  </span>
                  <span v-else-if="selectedSpell.resolution?.type === 'reaction'">
                    · реакция
                  </span>
                </div>
              </div>

              <span class="rounded-full border border-[#514634] px-2 py-1 text-[8px] text-[#cdbd9f]">
                {{ getSpellState(selectedSpell) }}
              </span>
            </div>

            <div
              v-if="selectedSpell.level > 0 && !isShieldReaction"
              class="mt-3"
            >
              <label class="mb-1 block text-[9px] uppercase tracking-[0.14em] text-[#978b77]">
                Ячейка
              </label>
              <select
                v-model="selectedSlotLevel"
                class="w-full rounded-lg border border-[#514a3e] bg-[#0f0c09] px-3 py-2 text-[10px] text-[#e8decb]"
              >
                <option
                  v-for="slot in castableSlotLevels"
                  :key="slot.level"
                  :value="slot.level"
                >
                  {{ slot.level }} уровень · {{ slot.current }}/{{ slot.maximum }}
                </option>
              </select>
            </div>

            <div class="mt-3 grid gap-2 text-[9px] sm:grid-cols-2">
              <div
                v-if="selectedSpell.resolution?.type === 'attack'"
                class="rounded-lg border border-white/10 bg-black/20 p-2"
              >
                <div>Бонус атаки: <strong>+{{ getSpellAttackBonus(participantId) }}</strong></div>
                <div v-if="selectedTargetContext">
                  AC цели: <strong>{{ getEffectiveArmorClass(selectedTargetId) }}</strong>
                </div>
              </div>

              <div
                v-if="selectedSpell.resolution?.type === 'saving-throw'"
                class="rounded-lg border border-white/10 bg-black/20 p-2"
              >
                <div>Спасбросок: <strong>{{ String(selectedSpell.resolution.ability).toUpperCase() }}</strong></div>
                <div>СЛ: <strong>{{ getSpellSaveDC(participantId) }}</strong></div>
              </div>

              <div
                v-if="selectedTargetContext"
                class="rounded-lg border border-white/10 bg-black/20 p-2"
              >
                <div>Дистанция: <strong>{{ selectedTargetContext.distanceFeet }} ft</strong></div>
                <div>{{ selectedTargetContext.lineOfSight ? 'Line of Sight есть' : 'Line of Sight нет' }}</div>
                <div>Укрытие: <strong>{{ selectedTargetContext.cover ?? 'нет' }}</strong></div>
              </div>

              <div
                v-if="selectedSpell.resolution?.type === 'reaction'"
                class="rounded-lg border border-[#695430] bg-[#251d12] p-2"
              >
                <div>Триггер: <strong>попадание по цели</strong></div>
                <div>Бонус AC: <strong>+5</strong></div>
                <div v-if="pendingAttack">Атака: d20 {{ pendingAttack.attackRoll }} + {{ pendingAttack.attackModifier }}</div>
              </div>
            </div>

            <div
              v-if="requiresTarget"
              class="mt-3"
            >
              <label class="mb-1 block text-[9px] uppercase tracking-[0.14em] text-[#978b77]">
                {{ isAreaSpell ? 'Направление области' : 'Цель' }}
              </label>

              <select
                v-model="selectedTargetId"
                class="w-full rounded-lg border border-[#514a3e] bg-[#0f0c09] px-3 py-2 text-[10px] text-[#e8decb]"
              >
                <option :value="null">
                  {{ isAreaSpell ? 'Выберите направление' : 'Выберите цель' }}
                </option>
                <option
                  v-for="target in targets"
                  :key="target.id"
                  :value="target.id"
                >
                  {{ target.name }} · HP {{ target.currentHP }}/{{ target.maxHP }} · {{ getSpellTargetState(target) }}
                </option>
              </select>
            </div>

            <div
              v-if="selectedSpellAreaContext"
              class="mt-2 rounded-lg border border-[#695430] bg-[#251d12] p-2 text-[9px] text-[#dbc99f]"
            >
              Область: {{ selectedSpellAreaContext.affectedTokens.length }} существ.
              Спасбросок {{ String(selectedSpell.resolution?.ability ?? '').toUpperCase() }}
              против СЛ {{ getSpellSaveDC(participantId) }}.
            </div>

            <div
              v-if="isShieldReaction && !canUseShieldReaction"
              class="mt-2 rounded-lg border border-[#75443f] bg-[#2a1715] p-2 text-[9px] text-[#e5aaa2]"
            >
              Щит можно применить только как реакцию на попавшую атаку до её разрешения.
            </div>

            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-xl border px-4 py-2 text-[10px] font-semibold"
                :class="canUseSelectedSpell
                  ? 'border-[#789b73] bg-[#22351f] text-[#d8ead3] hover:bg-[#2d4729]'
                  : 'cursor-not-allowed border-[#3e4547] bg-[#151a1b] text-[#687274]'"
                :disabled="isResolving || !canUseSelectedSpell"
                @click="castSelectedSpell"
              >
                ✨ {{ isShieldReaction ? 'Применить Щит' : 'Использовать' }}
              </button>

              <button
                type="button"
                class="rounded-xl border border-[#514a3e] px-4 py-2 text-[10px] text-[#cdbd9f]"
                :disabled="isResolving"
                @click="clearSelection"
              >
                Отмена
              </button>
            </div>
          </div>

          <div
            v-if="resultMessage"
            class="rounded-xl border border-[#4e6d54] bg-[#142016] p-3 text-[10px] text-[#d3e7d0]"
          >
            <div class="font-semibold">{{ resultMessage }}</div>
            <div
              v-for="(line, index) in resultDetails"
              :key="`${index}-${line}`"
              class="mt-1 text-[#a9c5aa]"
            >
              {{ line }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
