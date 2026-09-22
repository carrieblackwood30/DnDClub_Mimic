import { useCombatStore } from '~/stores/combat'
import { useDice } from '~/composables/useDice'
import { useClassesStore } from '~/stores/classes'
import { spells } from '~/data/spells'

export const useCombatSpellcasting = () => {
const combatStore = useCombatStore()
const classesStore = useClassesStore()
const { rollD20, rollDamage } = useDice()

const getParticipant = (participantId) => {
return combatStore.participants.find(
participant => participant.id === participantId
) ?? null
}

const getSpellById = (spellId) => {
return spells.find(
spell => spell.id === spellId
) ?? null
}

const getKnownCantrips = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return []

return (participant.knownCantripIds ?? [])
  .map(getSpellById)
  .filter(Boolean)


}

const getKnownSpells = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return []

return (participant.knownSpellIds ?? [])
  .map(getSpellById)
  .filter(Boolean)


}

const getPreparedSpells = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return []

return (participant.preparedSpellIds ?? [])
  .map(getSpellById)
  .filter(Boolean)


}

const getSpellbookSpells = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return []

return (participant.spellbookSpellIds ?? [])
  .map(getSpellById)
  .filter(Boolean)


}

const knowsCantrip = (participantId, spellId) => {
const participant = getParticipant(participantId)


if (!participant) return false

return (participant.knownCantripIds ?? []).includes(spellId)


}

const knowsSpell = (participantId, spellId) => {
const participant = getParticipant(participantId)


if (!participant) return false

return (participant.knownSpellIds ?? []).includes(spellId)


}

const hasPreparedSpell = (participantId, spellId) => {
const participant = getParticipant(participantId)


if (!participant) return false

return (participant.preparedSpellIds ?? []).includes(spellId)


}

const hasSpellInSpellbook = (participantId, spellId) => {
const participant = getParticipant(participantId)


if (!participant) return false

return (participant.spellbookSpellIds ?? []).includes(spellId)


}

const getCastingTimeType = (spell) => {
if (!spell?.castingTime) return null


const castingTime = spell.castingTime.toLowerCase()

if (castingTime.includes('reaction')) return 'reaction'
if (castingTime.includes('bonus-action')) return 'bonus-action'
if (castingTime.includes('bonus action')) return 'bonus-action'
if (castingTime.includes('action')) return 'action'

return 'other'


}

const getSpellcastingAbility = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return null

const classData = classesStore.getClassById?.(participant.classId)

return classData?.spellcasting?.ability ?? null


}

const getSpellcastingAbilityModifier = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return 0

const ability = getSpellcastingAbility(participantId)

if (!ability) return 0

const score = participant.abilityScores?.[ability] ?? 10

return Math.floor((score - 10) / 2)


}

const getProficiencyBonus = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return 0

return Math.floor((participant.level - 1) / 4) + 2


}

const getSpellAttackBonus = (participantId) => {
return (
getSpellcastingAbilityModifier(participantId) +
getProficiencyBonus(participantId)
)
}

const getSpellSaveDC = (participantId) => {
return 8 + getSpellAttackBonus(participantId)
}

const canUseSpell = (participantId, spell) => {
const participant = getParticipant(participantId)


if (!participant || !spell) return false
if (participant.currentHP <= 0) return false

if (spell.level === 0) {
  return knowsCantrip(participantId, spell.id)
}

if (hasPreparedSpell(participantId, spell.id)) {
  return combatStore.canUseSpellSlot(
    participantId,
    spell.level
  )
}

if (knowsSpell(participantId, spell.id)) {
  return combatStore.canUseSpellSlot(
    participantId,
    spell.level
  )
}

return false


}

const canUseCastingTime = (participantId, spell) => {
const participant = getParticipant(participantId)


if (!participant || !spell) return false

const castingTimeType = getCastingTimeType(spell)

if (
  participant.bonusActionSpellCast &&
  (
    spell.level !== 0 ||
    castingTimeType !== 'action'
  )
) {
  return false
}

if (castingTimeType === 'action') {
  return (
    combatStore.currentTurn === participantId &&
    !participant.actionUsed
  )
}

if (castingTimeType === 'bonus-action') {
  return (
    combatStore.currentTurn === participantId &&
    !participant.bonusActionUsed
  )
}

if (castingTimeType === 'reaction') {
  return !participant.reactionUsed
}

return true


}

const spendCastingTime = (participantId, spell) => {
if (!canUseCastingTime(participantId, spell)) {
return false
}


const castingTimeType = getCastingTimeType(spell)

if (castingTimeType === 'action') {
  return combatStore.useAction(participantId)
}

if (castingTimeType === 'bonus-action') {
  return combatStore.useBonusAction(participantId)
}

if (castingTimeType === 'reaction') {
  return combatStore.useReaction(participantId)
}

return true


}

const canCastSpell = (participantId, spell) => {
if (!canUseSpell(participantId, spell)) {
return false
}


if (!canUseCastingTime(participantId, spell)) {
  return false
}

return true


}

const getScaledDamageDice = (spell, participantLevel, slotLevel = spell.level) => {
if (!spell?.damage) return null


if (spell.damage.scaling?.characterLevels) {
  const scaling = spell.damage.scaling.characterLevels
  const levels = Object.keys(scaling)
    .map(Number)
    .sort((a, b) => a - b)

  let dice = spell.damage.dice

  for (const level of levels) {
    if (participantLevel >= level) {
      dice = scaling[level]
    }
  }

  return dice
}

if (
  spell.scaling?.type === 'additional-dice' &&
  slotLevel > spell.level
) {
  const additionalLevels = slotLevel - spell.level
  const baseDice = spell.damage.dice

  const match = baseDice.match(/^(\d+)d(\d+)$/)

  if (!match) return baseDice

  const baseCount = Number(match[1])
  const dieSize = match[2]
  const scalingCount = Number(
    spell.scaling.dice.match(/^(\d+)d/)?.[1] ?? 0
  )

  return `${baseCount + scalingCount * additionalLevels}d${dieSize}`
}

if (
  spell.scaling?.type === 'additional-instances' &&
  slotLevel > spell.level
) {
  return spell.damage.dice
}

return spell.damage.dice


}

const getScaledDamageInstances = (spell, slotLevel = spell.level) => {
if (!spell?.damage) return 0


let instances = spell.damage.instances ?? 1

if (
  spell.scaling?.type === 'additional-instances' &&
  slotLevel > spell.level
) {
  instances += (
    slotLevel - spell.level
  ) * (spell.scaling.value ?? 1)
}

return instances


}

const rollSpellDamage = (
  participantId,
  spell,
  slotLevel = spell.level,
  critical = false
) => {
  const participant = getParticipant(participantId)

  if (!participant || !spell?.damage) {
    return {
      success: false,
      total: 0,
      rolls: [],
      type: null
    }
  }

  const dice = getScaledDamageDice(
    spell,
    participant.level,
    slotLevel
  )

  const instances = getScaledDamageInstances(
    spell,
    slotLevel
  )

  const rolls = []
  let total = 0

  for (let index = 0; index < instances; index += 1) {
    const firstRoll = rollDamage(dice)

    const firstTotal = Number(
      firstRoll?.total ?? firstRoll ?? 0
    )

    rolls.push(firstTotal)
    total += firstTotal

    if (critical) {
      const secondRoll = rollDamage(dice)

      const secondTotal = Number(
        secondRoll?.total ?? secondRoll ?? 0
      )

      rolls.push(secondTotal)
      total += secondTotal
    }
  }

  const modifier = spell.damage.modifier ?? 0

  return {
    success: true,
    total: total + modifier * instances,
    rolls,
    type: spell.damage.type ?? null,
    dice,
    instances,
    critical
  }
}

const getAttackType = (spell) => {
return spell?.resolution?.attackType ?? null
}

const getResolutionType = (spell) => {
return spell?.resolution?.type ?? null
}

const getTargetAbilityModifier = (target, ability) => {
if (!target || !ability) return 0


return Math.floor(
  ((target.abilityScores?.[ability] ?? 10) - 10) / 2
)


}

const getTargetSavingThrowBonus = (target, ability) => {
if (!target || !ability) return 0


const abilityModifier = getTargetAbilityModifier(
  target,
  ability
)

const classData = classesStore.getClassById?.(target.classId)

const savingThrowProficiencies =
  classData?.savingThrowProficiencies ?? []

const proficiencyBonus =
  Math.floor((target.level - 1) / 4) + 2

const proficient = savingThrowProficiencies.includes(ability)

return abilityModifier + (
  proficient
    ? proficiencyBonus
    : 0
)


}

const getEffectiveArmorClass = (participantId) => {
return combatStore.getEffectiveArmorClass(
participantId
)
}

const rollSpellAttack = (
attackerId,
targetId,
spell,
options = {}
) => {
const attacker = getParticipant(attackerId)
const target = getParticipant(targetId)


if (!attacker || !target || !spell) {
  return {
    success: false,
    reason: 'invalid-target'
  }
}

if (target.currentHP <= 0) {
  return {
    success: false,
    reason: 'target-unconscious'
  }
}

const attackBonus = getSpellAttackBonus(attackerId)
const targetAC = getEffectiveArmorClass(targetId)

const roll = rollD20()
const total = roll + attackBonus

const critical = roll === 20
const criticalFailure = roll === 1
const hit = !criticalFailure && (
  critical ||
  total >= targetAC
)

return {
  success: true,
  type: 'attack',
  spell,
  attackerId,
  targetId,
  attackType: getAttackType(spell),
  roll,
  attackBonus,
  total,
  targetAC,
  hit,
  critical,
  criticalFailure,
  advantage: options.advantage ?? false,
  disadvantage: options.disadvantage ?? false,
  damage: hit
    ? rollSpellDamage(
        attackerId,
        spell,
        options.slotLevel ?? spell.level,
        critical
      )
    : null
}


}

const rollSavingThrow = (
casterId,
targetId,
spell
) => {
const caster = getParticipant(casterId)
const target = getParticipant(targetId)


if (!caster || !target || !spell) {
  return {
    success: false,
    reason: 'invalid-target'
  }
}

if (target.currentHP <= 0) {
  return {
    success: false,
    reason: 'target-unconscious'
  }
}

const ability = spell.resolution?.ability

if (!ability) {
  return {
    success: false,
    reason: 'missing-saving-throw-ability'
  }
}

const saveBonus = getTargetSavingThrowBonus(
  target,
  ability
)

const saveDC = getSpellSaveDC(casterId)
const roll = rollD20()
const total = roll + saveBonus
const success = total >= saveDC

let damage = null

if (spell.damage) {
  damage = rollSpellDamage(
    casterId,
    spell,
    spell.level,
    false
  )

  if (
    success &&
    spell.damage.onSave === 'half'
  ) {
    damage.total = Math.floor(
      damage.total / 2
    )
  }

  if (
    success &&
    spell.damage.onSave === 'none'
  ) {
    damage.total = 0
  }
}

return {
  success: true,
  type: 'saving-throw',
  spell,
  casterId,
  targetId,
  ability,
  roll,
  saveBonus,
  total,
  saveDC,
  passed: success,
  failed: !success,
  damage
}


}

const resolveAutomaticHit = (
casterId,
targetId,
spell,
options = {}
) => {
const caster = getParticipant(casterId)
const target = getParticipant(targetId)


if (!caster || !target || !spell) {
  return {
    success: false,
    reason: 'invalid-target'
  }
}

if (target.currentHP <= 0) {
  return {
    success: false,
    reason: 'target-unconscious'
  }
}

const damage = rollSpellDamage(
  casterId,
  spell,
  options.slotLevel ?? spell.level,
  false
)

return {
  success: true,
  type: 'automatic-hit',
  spell,
  casterId,
  targetId,
  damage
}


}

const resolveSpell = (
casterId,
targetId,
spell,
options = {}
) => {
const resolutionType = getResolutionType(spell)


if (resolutionType === 'attack') {
  return rollSpellAttack(
    casterId,
    targetId,
    spell,
    options
  )
}

if (resolutionType === 'saving-throw') {
  return rollSavingThrow(
    casterId,
    targetId,
    spell
  )
}

if (resolutionType === 'automatic-hit') {
  return resolveAutomaticHit(
    casterId,
    targetId,
    spell,
    options
  )
}

return {
  success: true,
  type: resolutionType ?? 'effect',
  spell,
  casterId,
  targetId
}


}

const castSpell = (
participantId,
spell,
options = {}
) => {
if (!canCastSpell(participantId, spell)) {
return {
success: false,
reason: 'spell-unavailable'
}
}


const slotLevel = options.slotLevel ?? spell.level

if (
  spell.level > 0 &&
  !combatStore.canUseSpellSlot(
    participantId,
    slotLevel
  )
) {
  return {
    success: false,
    reason: 'spell-slot-unavailable'
  }
}

const castingTimeSpent = spendCastingTime(
  participantId,
  spell
)

if (!castingTimeSpent) {
  return {
    success: false,
    reason: 'casting-time-unavailable'
  }
}

if (spell.level > 0) {
  const slotUsed = combatStore.useSpellSlot(
    participantId,
    slotLevel
  )

  if (!slotUsed) {
    return {
      success: false,
      reason: 'spell-slot-unavailable'
    }
  }
}

if (getCastingTimeType(spell) === 'bonus-action') {
  combatStore.markBonusActionSpellCast(
    participantId
  )
}

if (
  spell.resolution?.type === 'attack' ||
  spell.resolution?.type === 'saving-throw' ||
  spell.resolution?.type === 'automatic-hit'
) {
  return {
    success: true,
    spell,
    slotUsed: spell.level > 0,
    slotLevel,
    requiresResolution: true
  }
}

return {
  success: true,
  spell,
  slotUsed: spell.level > 0,
  slotLevel,
  requiresResolution: false
}


}

const getCurrentSpellSlots = (participantId) => {
return getParticipant(participantId)?.currentSpellSlots ?? []
}

const getMaxSpellSlots = (participantId) => {
return getParticipant(participantId)?.spellSlots ?? []
}

const getCurrentSpellSlotCount = (
participantId,
level
) => {
if (level < 1) return 0


return getCurrentSpellSlots(
  participantId
)[level - 1] ?? 0


}

const getMaxSpellSlotCount = (
participantId,
level
) => {
if (level < 1) return 0


return getMaxSpellSlots(
  participantId
)[level - 1] ?? 0


}

const hasAnySpellSlot = (participantId) => {
return getCurrentSpellSlots(
participantId
).some(count => count > 0)
}

const getAvailableSpells = (participantId) => {
const participant = getParticipant(participantId)


if (!participant) return []

return spells.filter(spell => {
  if (spell.level === 0) {
    return knowsCantrip(
      participantId,
      spell.id
    )
  }

  return (
    knowsSpell(
      participantId,
      spell.id
    ) ||
    hasPreparedSpell(
      participantId,
      spell.id
    )
  )
})


}

const getAvailableCantrips = (participantId) => {
return getKnownCantrips(participantId)
}

const getAvailableLevelledSpells = (participantId) => {
return getAvailableSpells(
participantId
).filter(
spell => spell.level > 0
)
}

return {
getParticipant,
getSpellById,
getKnownCantrips,
getKnownSpells,
getPreparedSpells,
getSpellbookSpells,
knowsCantrip,
knowsSpell,
hasPreparedSpell,
hasSpellInSpellbook,
getCastingTimeType,
getSpellcastingAbility,
getSpellcastingAbilityModifier,
getProficiencyBonus,
getSpellAttackBonus,
getSpellSaveDC,
canUseSpell,
canUseCastingTime,
canCastSpell,
spendCastingTime,
getResolutionType,
getAttackType,
getScaledDamageDice,
getScaledDamageInstances,
rollSpellDamage,
rollSpellAttack,
rollSavingThrow,
resolveAutomaticHit,
resolveSpell,
castSpell,
getCurrentSpellSlots,
getMaxSpellSlots,
getCurrentSpellSlotCount,
getMaxSpellSlotCount,
hasAnySpellSlot,
getAvailableSpells,
getAvailableCantrips,
getAvailableLevelledSpells
}
}
