import { useCombatStore } from '~/stores/combat'
import { useDice } from '~/composables/useDice'
import { useClassesStore } from '~/stores/classes'
import { spells } from '~/data/spells'

export const useCombatSpellcasting = () => {
  const combatStore = useCombatStore()
  const classesStore = useClassesStore()
  const { rollD20, rollDamage } = useDice()

  const getParticipant = participantId => {
    return combatStore.participants.find(
      participant => participant.id === participantId
    ) ?? null
  }

  const getSpellById = spellId => {
    return spells.find(
      spell => spell.id === spellId
    ) ?? null
  }

  const getKnownCantrips = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return []

    return (participant.knownCantripIds ?? [])
      .map(getSpellById)
      .filter(Boolean)
  }

  const getKnownSpells = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return []

    return (participant.knownSpellIds ?? [])
      .map(getSpellById)
      .filter(Boolean)
  }

  const getPreparedSpells = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return []

    return (participant.preparedSpellIds ?? [])
      .map(getSpellById)
      .filter(Boolean)
  }

  const getSpellbookSpells = participantId => {
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

  const getCastingTimeType = spell => {
    if (!spell?.castingTime) return null

    const castingTime = spell.castingTime
      .toLowerCase()
      .trim()

    if (castingTime.includes('reaction')) {
      return 'reaction'
    }

    if (
      castingTime.includes('bonus-action') ||
      castingTime.includes('bonus action')
    ) {
      return 'bonus-action'
    }

    if (castingTime.includes('action')) {
      return 'action'
    }

    return 'other'
  }

  const getSpellcastingAbility = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return null

    const classData = classesStore.getClassById?.(
      participant.classId
    )

    return classData?.spellcasting?.ability ?? null
  }

  const getSpellcastingAbilityModifier = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return 0

    const ability = getSpellcastingAbility(participantId)

    if (!ability) return 0

    const score = participant.abilityScores?.[ability] ?? 10

    return Math.floor(
      (Number(score) - 10) / 2
    )
  }

  const getProficiencyBonus = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return 0

    return Math.floor(
      (Number(participant.level ?? 1) - 1) / 4
    ) + 2
  }

  const getSpellAttackBonus = participantId => {
    return (
      getSpellcastingAbilityModifier(participantId) +
      getProficiencyBonus(participantId)
    )
  }

  const getSpellSaveDC = participantId => {
    return 8 + getSpellAttackBonus(participantId)
  }

  const isPreparedCaster = participantId => {
    const participant = getParticipant(participantId)

    if (!participant) return false

    const classData = classesStore.getClassById?.(
      participant.classId
    )

    return Boolean(
      classData?.spellcasting?.preparesSpells ||
      classData?.spellcasting?.spellbook
    )
  }

  const canUseSpell = (participantId, spell) => {
    const participant = getParticipant(participantId)

    if (!participant || !spell) return false

    if (Number(participant.currentHP ?? 0) <= 0) {
      return false
    }

    if (spell.level === 0) {
      return knowsCantrip(
        participantId,
        spell.id
      )
    }

    if (isPreparedCaster(participantId)) {
      if (!hasPreparedSpell(
        participantId,
        spell.id
      )) {
        return false
      }
    } else if (!knowsSpell(
      participantId,
      spell.id
    )) {
      return false
    }

    return combatStore.canUseSpellSlot(
      participantId,
      spell.level
    )
  }

  const canUseCastingTime = (participantId, spell) => {
    const participant = getParticipant(participantId)

    if (!participant || !spell) return false

    if (combatStore.isParticipantIncapacitated(participantId)) {
      return false
    }

    const castingTimeType = getCastingTimeType(spell)

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
    return (
      canUseSpell(participantId, spell) &&
      canUseCastingTime(participantId, spell)
    )
  }

  const getSpellRangeFeet = spell => {
    if (!spell?.range) return null

    if (typeof spell.range === 'number') {
      return spell.range
    }

    const range = String(spell.range)
      .toLowerCase()
      .trim()

    if (
      range === 'self' ||
      range === 'touch'
    ) {
      return 0
    }

    const match = range.match(
      /(\d+(?:\.\d+)?)\s*(?:-| )?feet/
    )

    if (!match) {
      return null
    }

    return Number(match[1])
  }

  const getSpellRangeLabel = spell => {
    if (!spell?.range) {
      return 'Дальность не указана'
    }

    if (
      spell.range === 'self' ||
      spell.range === 'touch'
    ) {
      return spell.range === 'self'
        ? 'На себя'
        : 'Касание'
    }

    const feet = getSpellRangeFeet(spell)

    if (feet == null) {
      return String(spell.range)
    }

    return `${feet} ft`
  }

  const canResolveSpellTarget = (
    participantId,
    spell,
    targetId,
    distanceFeet = null,
    targetContext = null
  ) => {
    const caster = getParticipant(participantId)
    const target = getParticipant(targetId)

    if (!caster || !target || !spell) {
      return false
    }

    if (Number(target.currentHP ?? 0) <= 0) {
      return false
    }

    const range = getSpellRangeFeet(spell)

    if (
      range !== null &&
      distanceFeet !== null &&
      distanceFeet > range
    ) {
      return false
    }

    if (targetContext) {
      if (!targetContext.lineOfSight) {
        return false
      }

      if (targetContext.cover === 'total') {
        return false
      }
    }

    const resolutionType =
      spell.resolution?.type

    return (
      resolutionType === 'attack' ||
      resolutionType === 'saving-throw' ||
      resolutionType === 'automatic-hit'
    )
  }

  const getScaledDamageDice = (
    spell,
    participantLevel,
    slotLevel = spell.level
  ) => {
    if (!spell?.damage) return null

    if (
      spell.damage.scaling?.characterLevels
    ) {
      const scaling =
        spell.damage.scaling.characterLevels

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
      const baseMatch =
        String(spell.damage.dice)
          .match(/^(\d+)d(\d+)$/)

      const scalingMatch =
        String(spell.scaling.dice)
          .match(/^(\d+)d(\d+)$/)

      if (!baseMatch || !scalingMatch) {
        return spell.damage.dice
      }

      const baseCount =
        Number(baseMatch[1])

      const dieSize =
        baseMatch[2]

      const scalingCount =
        Number(scalingMatch[1])

      const additionalLevels =
        slotLevel - spell.level

      return `${baseCount + scalingCount * additionalLevels}d${dieSize}`
    }

    return spell.damage.dice
  }

  const getScaledDamageInstances = (
    spell,
    slotLevel = spell.level
  ) => {
    if (!spell?.damage) return 0

    let instances =
      Number(spell.damage.instances ?? 1)

    if (
      spell.scaling?.type === 'additional-instances' &&
      slotLevel > spell.level
    ) {
      instances += (
        slotLevel - spell.level
      ) * Number(
        spell.scaling.value ?? 1
      )
    }

    return instances
  }

  const rollSpellDamage = (
    participantId,
    spell,
    slotLevel = spell.level,
    critical = false
  ) => {
    const participant =
      getParticipant(participantId)

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
      Number(participant.level ?? 1),
      slotLevel
    )

    const instances =
      getScaledDamageInstances(
        spell,
        slotLevel
      )

    const rolls = []
    let total = 0

    for (
      let index = 0;
      index < instances;
      index += 1
    ) {
      const first =
        rollDamage(dice)

      const firstTotal =
        Number(first?.total ?? first ?? 0)

      rolls.push(firstTotal)
      total += firstTotal

      if (critical) {
        const second =
          rollDamage(dice)

        const secondTotal =
          Number(second?.total ?? second ?? 0)

        rolls.push(secondTotal)
        total += secondTotal
      }
    }

    const modifier =
      Number(spell.damage.modifier ?? 0)

    return {
      success: true,
      total:
        total +
        modifier * instances,
      rolls,
      type:
        spell.damage.type ?? null,
      dice,
      instances,
      critical
    }
  }

  const getAttackType = spell => {
    return spell?.resolution?.attackType ?? null
  }

  const getResolutionType = spell => {
    return spell?.resolution?.type ?? null
  }

  const getTargetAbilityModifier = (
    target,
    ability
  ) => {
    if (!target || !ability) return 0

    return Math.floor(
      (
        Number(
          target.abilityScores?.[ability] ?? 10
        ) - 10
      ) / 2
    )
  }

  const getTargetSavingThrowBonus = (
    target,
    ability
  ) => {
    if (!target || !ability) return 0

    const abilityModifier =
      getTargetAbilityModifier(
        target,
        ability
      )

    const classData =
      classesStore.getClassById?.(
        target.classId
      )

    const proficiencies =
      classData?.savingThrowProficiencies ?? []

    const proficiencyBonus =
      Math.floor(
        (Number(target.level ?? 1) - 1) / 4
      ) + 2

    const proficient =
      proficiencies.includes(ability)

    return (
      abilityModifier +
      (
        proficient
          ? proficiencyBonus
          : 0
      )
    )
  }

  const getEffectiveArmorClass = participantId => {
    return combatStore.getEffectiveArmorClass(
      participantId
    )
  }

  const rollD20ByMode = (
    advantage = false,
    disadvantage = false
  ) => {
    const first = rollD20()

    if (advantage === disadvantage) {
      return {
        roll: first,
        rolls: [first],
        mode: 'normal'
      }
    }

    const second = rollD20()

    if (advantage) {
      return {
        roll: Math.max(first, second),
        rolls: [first, second],
        mode: 'advantage'
      }
    }

    return {
      roll: Math.min(first, second),
      rolls: [first, second],
      mode: 'disadvantage'
    }
  }

  const getSpellAttackModifiers = (
    attackerId,
    targetId,
    spell,
    options = {}
  ) => {
    const advantageSources = [
      ...(options.advantageSources ?? [])
    ]

    const disadvantageSources = [
      ...(options.disadvantageSources ?? [])
    ]

    for (
      const modifier
      of spell?.attackModifiers ?? []
    ) {
      if (
        modifier.type === 'advantage' &&
        modifier.condition ===
          'target-wearing-metal-armor'
      ) {
        const target =
          getParticipant(targetId)

        if (
          target?.armorId ||
          target?.armorType === 'metal'
        ) {
          advantageSources.push(
            'metal-armor'
          )
        }
      }
    }

    return {
      advantage:
        Boolean(options.advantage) ||
        advantageSources.length > 0,

      disadvantage:
        Boolean(options.disadvantage) ||
        disadvantageSources.length > 0,

      advantageSources,
      disadvantageSources
    }
  }

  const rollSpellAttack = (
    attackerId,
    targetId,
    spell,
    options = {}
  ) => {
    const attacker =
      getParticipant(attackerId)

    const target =
      getParticipant(targetId)

    if (!attacker || !target || !spell) {
      return {
        success: false,
        reason: 'invalid-target'
      }
    }

    if (
      Number(target.currentHP ?? 0) <= 0
    ) {
      return {
        success: false,
        reason: 'target-unconscious'
      }
    }

    const attackBonus =
      getSpellAttackBonus(attackerId)

    const targetAC =
      getEffectiveArmorClass(targetId)

    const modifiers =
      getSpellAttackModifiers(
        attackerId,
        targetId,
        spell,
        options
      )

    const attackType =
      getAttackType(spell)

    if (
      attackType === 'ranged' &&
      options.withinFiveFeetOfHostile
    ) {
      modifiers.disadvantageSources.push(
        'hostile-within-5-feet'
      )
      modifiers.disadvantage = true
    }

    const rollResult =
      rollD20ByMode(
        modifiers.advantage,
        modifiers.disadvantage
      )

    const roll = rollResult.roll

    const total =
      roll + attackBonus

    const canCrit =
      spell.resolution?.canCrit !== false

    const critical =
      canCrit && roll === 20

    const criticalFailure =
      roll === 1

    const hit =
      !criticalFailure &&
      (
        critical ||
        total >= targetAC
      )

    return {
      success: true,
      type: 'attack',
      spell,
      attackerId,
      targetId,
      attackType,
      roll,
      rolls:
        rollResult.rolls,
      rollMode:
        rollResult.mode,
      attackBonus,
      total,
      targetAC,
      hit,
      critical,
      criticalFailure,
      advantage:
        modifiers.advantage,
      disadvantage:
        modifiers.disadvantage,
      advantageSources:
        modifiers.advantageSources,
      disadvantageSources:
        modifiers.disadvantageSources,
      damage:
        hit
          ? rollSpellDamage(
              attackerId,
              spell,
              options.slotLevel ??
                spell.level,
              critical
            )
          : null
    }
  }

  const rollSavingThrow = (
    casterId,
    targetId,
    spell,
    options = {}
  ) => {
    const caster =
      getParticipant(casterId)

    const target =
      getParticipant(targetId)

    if (!caster || !target || !spell) {
      return {
        success: false,
        reason: 'invalid-target'
      }
    }

    if (
      Number(target.currentHP ?? 0) <= 0
    ) {
      return {
        success: false,
        reason: 'target-unconscious'
      }
    }

    const ability =
      spell.resolution?.ability

    if (!ability) {
      return {
        success: false,
        reason:
          'missing-saving-throw-ability'
      }
    }

    const saveBonus =
      getTargetSavingThrowBonus(
        target,
        ability
      )

    const saveDC =
      getSpellSaveDC(casterId)

    const roll = rollD20()

    const total =
      roll + saveBonus

    const passed =
      total >= saveDC

    const isSleep =
      spell.special?.type === 'sleep-2024'

    const sleepImmune =
      Boolean(
        target.sleepImmune ||
        target.conditionImmunities?.includes?.('sleep') ||
        target.conditionImmunities?.includes?.('unconscious')
      )

    if (
      isSleep &&
      spell.special?.sleepImmuneAutoSuccess &&
      sleepImmune
    ) {
      return {
        success: true,
        type: 'saving-throw',
        spell,
        casterId,
        targetId,
        ability,
        roll: null,
        saveBonus,
        total: null,
        saveDC,
        passed: true,
        failed: false,
        immune: true,
        damage: null,
        push: null,
        sleep: {
          applied: false,
          immune: true
        }
      }
    }

    if (
      isSleep &&
      !passed
    ) {
      combatStore.applySleepEffect(
        targetId,
        casterId,
        spell.id
      )

      combatStore.pushCombatEvent({
        type: 'sleep',
        title: 'Сон',
        message: `${target.name} провалил спасбросок`,
        detail: `d20 ${roll} + ${saveBonus} = ${total} против СЛ ${saveDC}. Недееспособен. Повторный спасбросок после следующего хода.`,
        duration: 5200
      })
    }

    if (
      isSleep &&
      passed
    ) {
      combatStore.pushCombatEvent({
        type: 'success',
        title: 'Сон',
        message: `${target.name} успешно прошёл спасбросок`,
        detail: `d20 ${roll} + ${saveBonus} = ${total} против СЛ ${saveDC}. Эффект не наложен.`,
        duration: 4200
      })
    }

    let damage = null

    if (spell.damage) {
      damage =
        rollSpellDamage(
          casterId,
          spell,
          options.slotLevel ??
            spell.level,
          false
        )

      if (
        passed &&
        spell.damage.onSave === 'half'
      ) {
        damage.total =
          Math.floor(
            damage.total / 2
          )
      }

      if (
        passed &&
        spell.damage.onSave === 'none'
      ) {
        damage.total = 0
      }
    }

    let push = null

    const pushEffect =
      spell.effects?.find(
        effect =>
          effect.type === 'push' &&
          effect.on === 'failed-save'
      )

    if (
      pushEffect &&
      !passed &&
      options.tokenId
    ) {
      push = {
        distanceFeet:
          Number(
            pushEffect.distance ?? 0
          ),
        targetTokenId:
          options.tokenId
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
      passed,
      failed: !passed,
      damage,
      push,
      sleep: isSleep
        ? {
            applied: !passed,
            immune: false
          }
        : null
    }
  }

  const processPendingSleepSaves = () => {
    const results = []

    for (const target of combatStore.participants) {
      const sleepState = target.sleepState

      if (!sleepState?.pendingSecondSave) {
        continue
      }

      const caster = getParticipant(
        sleepState.casterId
      )

      const spell = getSpellById(
        sleepState.spellId
      )

      if (!caster || !spell) {
        combatStore.clearSleepEffect(target.id)
        continue
      }

      const ability =
        spell.resolution?.ability ?? 'wisdom'

      const saveBonus =
        getTargetSavingThrowBonus(
          target,
          ability
        )

      const saveDC =
        getSpellSaveDC(caster.id)

      const roll = rollD20()
      const total = roll + saveBonus
      const passed = total >= saveDC

      if (passed) {
        combatStore.clearSleepEffect(target.id)

        combatStore.pushCombatEvent({
          type: 'success',
          title: 'Сон',
          message: `${target.name} проснулся`,
          detail: `Повторный спасбросок: d20 ${roll} + ${saveBonus} = ${total} против СЛ ${saveDC}. Эффект сна прекращён.`,
          duration: 5000
        })
      } else {
        combatStore.setSleepUnconscious(target.id)

        combatStore.pushCombatEvent({
          type: 'condition',
          title: 'Сон',
          message: `${target.name} стал бессознательным`,
          detail: `Повторный спасбросок провален: d20 ${roll} + ${saveBonus} = ${total} против СЛ ${saveDC}.`,
          duration: 6500
        })
      }

      results.push({
        success: true,
        type: 'sleep-second-save',
        spell,
        casterId: caster.id,
        targetId: target.id,
        ability,
        roll,
        saveBonus,
        total,
        saveDC,
        passed,
        failed: !passed
      })
    }

    return results
  }

  const resolveAreaSavingThrow = (
    casterId,
    spell,
    options = {}
  ) => {
    const caster =
      getParticipant(casterId)

    if (!caster || !spell) {
      return {
        success: false,
        reason: 'invalid-target'
      }
    }

    const areaContext =
      options.areaContext

    if (
      !areaContext ||
      !Array.isArray(
        areaContext.affectedTokens
      )
    ) {
      return {
        success: false,
        reason: 'invalid-area-context'
      }
    }

    const results = []

    for (
      const areaToken
      of areaContext.affectedTokens
    ) {
      if (
        !areaToken.combatParticipantId
      ) {
        continue
      }

      if (
        areaToken.combatParticipantId ===
        casterId
      ) {
        continue
      }

      const target =
        getParticipant(
          areaToken.combatParticipantId
        )

      if (!target) {
        continue
      }

      if (
        Number(target.currentHP ?? 0) <= 0
      ) {
        continue
      }

      const result =
        rollSavingThrow(
          casterId,
          target.id,
          spell,
          {
            ...options,
            tokenId:
              areaToken.tokenId
          }
        )

      if (!result.success) {
        continue
      }

      results.push({
        ...result,
        combatParticipantId:
          target.id,
        tokenId:
          areaToken.tokenId
      })
    }

    return {
      success: true,
      type: 'area-saving-throw',
      spell,
      casterId,
      area: {
        ...areaContext
      },
      results
    }
  }

  const resolveAutomaticHit = (
    casterId,
    targetId,
    spell,
    options = {}
  ) => {
    const caster =
      getParticipant(casterId)

    const target =
      getParticipant(targetId)

    if (!caster || !target || !spell) {
      return {
        success: false,
        reason: 'invalid-target'
      }
    }

    if (
      Number(target.currentHP ?? 0) <= 0
    ) {
      return {
        success: false,
        reason: 'target-unconscious'
      }
    }

    const damage =
      rollSpellDamage(
        casterId,
        spell,
        options.slotLevel ??
          spell.level,
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
    const resolutionType =
      getResolutionType(spell)

    if (
      resolutionType ===
        'saving-throw' &&
      spell.target?.type ===
        'creatures-in-area' &&
      options.areaContext
    ) {
      return resolveAreaSavingThrow(
        casterId,
        spell,
        options
      )
    }

    if (
      resolutionType === 'attack'
    ) {
      return rollSpellAttack(
        casterId,
        targetId,
        spell,
        options
      )
    }

    if (
      resolutionType ===
      'saving-throw'
    ) {
      return rollSavingThrow(
        casterId,
        targetId,
        spell,
        options
      )
    }

    if (
      resolutionType ===
      'automatic-hit'
    ) {
      return resolveAutomaticHit(
        casterId,
        targetId,
        spell,
        options
      )
    }

    return {
      success: true,
      type:
        resolutionType ?? 'effect',
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
    if (
      !canCastSpell(
        participantId,
        spell
      )
    ) {
      return {
        success: false,
        reason: 'spell-unavailable'
      }
    }

    const slotLevel =
      options.slotLevel ??
      spell.level

    if (
      spell.level > 0 &&
      !combatStore.canUseSpellSlot(
        participantId,
        slotLevel
      )
    ) {
      return {
        success: false,
        reason:
          'spell-slot-unavailable'
      }
    }

    const castingTimeSpent =
      spendCastingTime(
        participantId,
        spell
      )

    if (!castingTimeSpent) {
      return {
        success: false,
        reason:
          'casting-time-unavailable'
      }
    }

    if (spell.level > 0) {
      const slotUsed =
        combatStore.useSpellSlot(
          participantId,
          slotLevel
        )

      if (!slotUsed) {
        return {
          success: false,
          reason:
            'spell-slot-unavailable'
        }
      }
    }

    if (
      getCastingTimeType(spell) ===
      'bonus-action'
    ) {
      combatStore.markBonusActionSpellCast(
        participantId
      )
    }

    return {
      success: true,
      spell,
      slotUsed:
        spell.level > 0,
      slotLevel,
      requiresResolution:
        (
          spell.resolution?.type ===
            'attack' ||
          spell.resolution?.type ===
            'saving-throw' ||
          spell.resolution?.type ===
            'automatic-hit'
        )
    }
  }

  const getCurrentSpellSlots =
    participantId => {
      return (
        getParticipant(
          participantId
        )?.currentSpellSlots ?? []
      )
    }

  const getMaxSpellSlots =
    participantId => {
      return (
        getParticipant(
          participantId
        )?.spellSlots ?? []
      )
    }

  const getCurrentSpellSlotCount = (
    participantId,
    level
  ) => {
    if (level < 1) return 0

    return (
      getCurrentSpellSlots(
        participantId
      )[level - 1] ?? 0
    )
  }

  const getMaxSpellSlotCount = (
    participantId,
    level
  ) => {
    if (level < 1) return 0

    return (
      getMaxSpellSlots(
        participantId
      )[level - 1] ?? 0
    )
  }

  const hasAnySpellSlot =
    participantId => {
      return getCurrentSpellSlots(
        participantId
      ).some(
        count => count > 0
      )
    }

  const getAvailableSpells =
    participantId => {
      const participant =
        getParticipant(
          participantId
        )

      if (!participant) return []

      return spells.filter(
        spell => {
          if (spell.level === 0) {
            return knowsCantrip(
              participantId,
              spell.id
            )
          }

          if (
            isPreparedCaster(
              participantId
            )
          ) {
            return hasPreparedSpell(
              participantId,
              spell.id
            )
          }

          return knowsSpell(
            participantId,
            spell.id
          )
        }
      )
    }

  const getAvailableCantrips =
    participantId => {
      return getKnownCantrips(
        participantId
      )
    }

  const getAvailableLevelledSpells =
    participantId => {
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
    getSpellRangeFeet,
    getSpellRangeLabel,
    canResolveSpellTarget,
    getResolutionType,
    getAttackType,
    getScaledDamageDice,
    getScaledDamageInstances,
    rollSpellDamage,
    rollSpellAttack,
    rollSavingThrow,
    resolveAreaSavingThrow,
    resolveAutomaticHit,
    resolveSpell,
    processPendingSleepSaves,
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