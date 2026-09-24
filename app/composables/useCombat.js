import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useCombatStore } from '~/stores/combat'

import { useDice } from '~/composables/useDice'

import { reactions } from '~/data/reactions'

export const useCombat = () => {
  const combatStore = useCombatStore()
  const {
    participants,
    currentTurn,
    currentParticipant,
    combatStarted,
    pendingOpportunityAttack
  } = storeToRefs(combatStore)

  const { rollD20 } = useDice()

  const sortedTurnOrder = computed(() => {
    return [...participants.value].sort(
      (a, b) => b.initiative - a.initiative
    )
  })

  const isCurrentParticipant = (
    id
  ) => {
    return (
      currentParticipant.value?.id === id
    )
  }

  const canParticipantAct = (
    participantId
  ) => {
    if (!combatStarted.value) {
      return false
    }

    if (!currentTurn.value) {
      return false
    }

    return currentTurn.value === participantId
  }

  const canUseAction = (id) => {
    if (!canParticipantAct(id)) {
      return false
    }

    const participant =
      combatStore.participants.find(
        item => item.id === id
      )

    return participant
      ? !participant.actionUsed
      : false
  }

  const canUseBonusAction = (id) => {
    if (!canParticipantAct(id)) {
      return false
    }

    const participant =
      combatStore.participants.find(
        item => item.id === id
      )

    return participant
      ? !participant.bonusActionUsed
      : false
  }

  const canUseReaction = (id) => {
    const participant =
      combatStore.participants.find(
        item => item.id === id
      )

    if (!participant) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    return !participant.reactionUsed
  }

  const useAction = (id) => {
    return combatStore.useAction(id)
  }

  const useBonusAction = (id) => {
    return combatStore.useBonusAction(id)
  }

  const useReaction = (id) => {
    return combatStore.useReaction(id)
  }

  const addCharacter = (
    character,
    armorClass,
    maxHitPoints
  ) => {
    if (!character) {
      return
    }

    const dexterityScore =
      character.abilityScores?.dexterity ??
      10

    const initiativeModifier =
      Math.floor(
        (dexterityScore - 10) / 2
      )

    combatStore.addParticipant({
      id: `character-${character.id}`,
      characterId: character.id,
      name: character.name || 'Без имени',
      type: 'player',
      level: character.level ?? 1,
      classId: character.classId ?? null,
      subclassId:
        character.subclassId ?? null,
      raceId:
        character.raceId ?? null,
      subraceId:
        character.subraceId ?? null,
      abilityScores: {
        ...(character.abilityScores ?? {})
      },
      weaponId: character.weaponId ?? null,
      weaponAbility: character.weaponAbility ?? null,
      initiativeModifier,
      initiative: 0,
      maxHP: maxHitPoints,
      currentHP: maxHitPoints,
      armorClass,
      selectedReactions: [
        ...(character.selectedReactions ?? [])
      ],
      spellSlots: [
        ...(character.spellSlots ?? [])
      ],
      currentSpellSlots: [
        ...(character.spellSlots ?? [])
      ],
      knownCantripIds: [
        ...(character.knownCantripIds ?? [])
      ],
      knownSpellIds: [
        ...(character.knownSpellIds ?? [])
      ],
      preparedSpellIds: [
        ...(character.preparedSpellIds ?? [])
      ],
      spellbookSpellIds: [
        ...(character.spellbookSpellIds ?? [])
      ]
    })
  }

  const rollInitiative = () => {
    combatStore.participants.forEach(
      participant => {
        const roll = rollD20()

        participant.initiativeRoll = roll

        participant.initiative =
          roll +
          (
            participant.initiativeModifier ??
            0
          )
      }
    )
  }

  const startCombat = () => {
    rollInitiative()

    const order = [
      ...combatStore.participants
    ]
      .filter(
        participant =>
          participant.currentHP > 0
      )
      .sort(
        (a, b) =>
          b.initiative -
          a.initiative
      )
      .map(
        participant =>
          participant.id
      )

    combatStore.startCombat(order)
  }

  const nextTurn = () => {
    combatStore.nextTurn()
  }

  const previousTurn = () => {
    combatStore.previousTurn()
  }

  const endCombat = () => {
    combatStore.endCombat()
  }

  const resetCombat = () => {
    combatStore.resetCombat()
  }

  const selectTarget = (
    targetId
  ) => {
    combatStore.selectTarget(targetId)
  }

  const applyDamage = (
    targetId,
    damage
  ) => {
    return combatStore.applyDamage(
      targetId,
      damage
    )
  }

  const getEffectiveArmorClass = (
    participantId
  ) => {
    return combatStore.getEffectiveArmorClass(
      participantId
    )
  }

  const canUseAttackActionAttack = (
    participantId
  ) => {
    return combatStore.canUseAttackActionAttack(
      participantId
    )
  }

  const useAttackActionAttack = (
    participantId
  ) => {
    return combatStore.useAttackActionAttack(
      participantId
    )
  }

  const canUseActionSurge = (
    participantId
  ) => {
    return combatStore.canUseActionSurge(
      participantId
    )
  }

  const useActionSurge = (
    participantId
  ) => {
    return combatStore.useActionSurge(
      participantId
    )
  }

  const markBonusActionSpellCast = (
    participantId
  ) => {
    return combatStore.markBonusActionSpellCast(
      participantId
    )
  }

  const canUseSpellSlot = (
    participantId,
    level
  ) => {
    return combatStore.canUseSpellSlot(
      participantId,
      level
    )
  }

  const useSpellSlot = (
    participantId,
    level
  ) => {
    return combatStore.useSpellSlot(
      participantId,
      level
    )
  }

  const setReactionACBonus = (
    participantId,
    bonus
  ) => {
    return combatStore.setReactionACBonus(
      participantId,
      bonus
    )
  }

  const canMove = (
    participantId,
    distance
  ) => {
    return combatStore.canMove(
      participantId,
      distance
    )
  }

  const moveParticipant = (
    participantId,
    distance
  ) => {
    return combatStore.moveParticipant(
      participantId,
      distance
    )
  }

  const establishMeleeEngagement = (
    attackerId,
    targetId
  ) => {
    return combatStore.establishMeleeEngagement(
      attackerId,
      targetId
    )
  }

  const clearMeleeEngagementsFor = (
    participantId
  ) => {
    return combatStore.clearMeleeEngagementsFor(
      participantId
    )
  }

  const getEngagedHostiles = (
    participantId
  ) => {
    return combatStore.getEngagedHostiles(
      participantId
    )
  }

  const getOpportunityAttackProfile = (
    participantId
  ) => {
    return combatStore.getOpportunityAttackProfile(
      participantId
    )
  }

  const getOpportunityAttackers = (
    participantId
  ) => {
    return combatStore.getOpportunityAttackers(
      participantId
    )
  }

  const useOpportunityAttackReaction = (
    attackerId
  ) => {
    return combatStore.useOpportunityAttackReaction(
      attackerId
    )
  }

  const skipOpportunityAttack = (
    attackerId
  ) => {
    return combatStore.skipOpportunityAttack(
      attackerId
    )
  }

  const finishOpportunityAttack = (
    attackerId
  ) => {
    return combatStore.finishOpportunityAttack(
      attackerId
    )
  }

  const getRemainingMovement = (
    participantId
  ) => {
    return combatStore.getRemainingMovement(
      participantId
    )
  }

  const getReactionById = (
    id
  ) => {
    return (
      reactions.find(
        reaction =>
          reaction.id === id
      ) ?? null
    )
  }

  const canUseReactionEffect = (
    participantId,
    reactionId,
    context = {}
  ) => {
    const participant =
      combatStore.participants.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return {
        allowed: false,
        reason: 'participant-not-found'
      }
    }

    if (participant.currentHP <= 0) {
      return {
        allowed: false,
        reason: 'participant-dead'
      }
    }

    if (participant.reactionUsed) {
      return {
        allowed: false,
        reason: 'reaction-unavailable'
      }
    }

    const reaction =
      getReactionById(
        reactionId
      )

    if (!reaction) {
      return {
        allowed: false,
        reason: 'reaction-not-found'
      }
    }

    if (reaction.spellId) {
      const hasKnownSpell =
        participant.knownSpellIds?.includes(
          reaction.spellId
        )

      const hasPreparedSpell =
        participant.preparedSpellIds?.includes(
          reaction.spellId
        )

      if (
        !hasKnownSpell &&
        !hasPreparedSpell
      ) {
        return {
          allowed: false,
          reason: 'spell-not-available'
        }
      }
    } else if (
      !participant.selectedReactions?.includes(
        reactionId
      )
    ) {
      return {
        allowed: false,
        reason: 'reaction-not-selected'
      }
    }

    if (reaction.spellLevel) {
      if (
        !combatStore.canUseSpellSlot(
          participantId,
          reaction.spellLevel
        )
      ) {
        return {
          allowed: false,
          reason: 'spell-slot-unavailable'
        }
      }
    }

    if (
      reaction.trigger &&
      context.trigger &&
      reaction.trigger !==
        context.trigger
    ) {
      return {
        allowed: false,
        reason: 'invalid-trigger'
      }
    }

    if (
      reaction.requiresHit &&
      context.attackResult &&
      !context.attackResult.hit
    ) {
      return {
        allowed: false,
        reason: 'attack-did-not-hit'
      }
    }

    if (
      reaction.preventsCriticalHit ===
        false &&
      context.attackResult?.critical
    ) {
      return {
        allowed: false,
        reason: 'critical-hit'
      }
    }

    return {
      allowed: true,
      reaction
    }
  }

  const getAvailableReactions = (
    participantId,
    context = {}
  ) => {
    const participant =
      combatStore.participants.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return []
    }

    if (participant.currentHP <= 0) {
      return []
    }

    if (participant.reactionUsed) {
      return []
    }

    return reactions.filter(
      reaction => {
        return canUseReactionEffect(
          participantId,
          reaction.id,
          context
        ).allowed
      }
    )
  }

  const useReactionEffect = (
    participantId,
    reactionId,
    context = {}
  ) => {
    const check =
      canUseReactionEffect(
        participantId,
        reactionId,
        context
      )

    if (!check.allowed) {
      return {
        success: false,
        reason: check.reason
      }
    }

    const reaction =
      check.reaction

    const used =
      useReaction(participantId)

    if (!used) {
      return {
        success: false,
        reason: 'reaction-unavailable'
      }
    }

    if (reaction.spellLevel) {
      const slotUsed =
        combatStore.useSpellSlot(
          participantId,
          reaction.spellLevel
        )

      if (!slotUsed) {
        return {
          success: false,
          reason: 'spell-slot-unavailable'
        }
      }
    }

    if (reaction.acBonus) {
      combatStore.setReactionACBonus(
        participantId,
        reaction.acBonus
      )
    }

    return {
      success: true,
      reaction
    }
  }

  const canDisengage = (participantId) => {
    return combatStore.canDisengage(
      participantId
    )
  }

  const useDisengage = (participantId) => {
    return combatStore.useDisengage(
      participantId
    )
  }

  const canDash = (
    participantId
    ) => {
      return combatStore.canDash(
        participantId
      )
    }

    const useDash = (
      participantId
    ) => {
      return combatStore.useDash(
        participantId
      )
    }

  return {
    combatStore,

    sortedTurnOrder,
    currentParticipant,
    combatStarted,

    isCurrentParticipant,
    canParticipantAct,

    canUseAction,
    canUseBonusAction,
    canUseReaction,

    useAction,
    useBonusAction,
    useReaction,

    addCharacter,

    rollInitiative,
    startCombat,
    nextTurn,
    previousTurn,
    endCombat,
    resetCombat,

    selectTarget,
    applyDamage,

    getEffectiveArmorClass,

    canUseAttackActionAttack,
    useAttackActionAttack,

    canUseActionSurge,
    useActionSurge,

    markBonusActionSpellCast,

    canUseSpellSlot,
    useSpellSlot,

    setReactionACBonus,

    canMove,
    moveParticipant,
    getRemainingMovement,

    establishMeleeEngagement,
    clearMeleeEngagementsFor,
    getEngagedHostiles,
    getOpportunityAttackProfile,
    getOpportunityAttackers,
    useOpportunityAttackReaction,
    skipOpportunityAttack,
    finishOpportunityAttack,

    canDisengage,
    useDisengage,

    canDash,
    useDash,

    currentTurn,
    pendingOpportunityAttack,

    useReactionEffect,
    getAvailableReactions,
    canUseReactionEffect,
    getReactionById
  }
}