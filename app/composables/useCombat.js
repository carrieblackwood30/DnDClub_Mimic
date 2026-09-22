import { computed } from 'vue'

import { useCombatStore } from '~/stores/combat'

import { useDice } from '~/composables/useDice'

import { reactions } from '~/data/reactions'

export const useCombat = () => {
  const combatStore = useCombatStore()

  const { rollD20 } = useDice()

  const sortedTurnOrder = computed(() => {
    return [...combatStore.participants].sort(
      (a, b) => b.initiative - a.initiative
    )
  })

  const currentParticipant = computed(() => {
    const currentId = combatStore.currentTurn

    if (!currentId) {
      return null
    }

    return combatStore.participants.find(
      participant => participant.id === currentId
    ) ?? null
  })

  const isCurrentParticipant = (id) => {
    return currentParticipant.value?.id === id
  }

  const canParticipantAct = (id) => {
    if (!combatStore.combatStarted) {
      return false
    }

    if (!currentParticipant.value) {
      return false
    }

    if (currentParticipant.value.currentHP <= 0) {
      return false
    }

    return isCurrentParticipant(id)
  }

  const canUseAction = (id) => {
    if (!canParticipantAct(id)) {
      return false
    }

    const participant = combatStore.participants.find(
      item => item.id === id
    )

    return participant ? !participant.actionUsed : false
  }

  const canUseBonusAction = (id) => {
    if (!canParticipantAct(id)) {
      return false
    }

    const participant = combatStore.participants.find(
      item => item.id === id
    )

    return participant ? !participant.bonusActionUsed : false
  }

  const canUseReaction = (id) => {
    const participant = combatStore.participants.find(
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
      character.abilityScores?.dexterity ?? 10

    const initiativeModifier =
      Math.floor((dexterityScore - 10) / 2)

    combatStore.addParticipant({
      id: `character-${character.id}`,
      characterId: character.id,
      name: character.name || 'Без имени',
      type: 'player',
      level: character.level ?? 1,
      classId: character.classId,
      abilityScores: {
        ...(character.abilityScores ?? {})
      },
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
    combatStore.participants.forEach(participant => {
      const roll = rollD20()

      participant.initiativeRoll = roll

      participant.initiative =
        roll + (participant.initiativeModifier ?? 0)
    })
  }

  const startCombat = () => {
    rollInitiative()

    const order = [...combatStore.participants]
      .filter(participant => participant.currentHP > 0)
      .sort(
        (a, b) => b.initiative - a.initiative
      )
      .map(participant => participant.id)

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

  const getEffectiveArmorClass = (participantId) => {
    return combatStore.getEffectiveArmorClass(
      participantId
    )
  }

  const getReactionById = (id) => {
    return reactions.find(
      reaction => reaction.id === id
    ) ?? null
  }

  const canUseReactionEffect = (
    participantId,
    reactionId,
    context = {}
  ) => {
    const participant =
      combatStore.participants.find(
        item => item.id === participantId
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

    const reaction = getReactionById(reactionId)

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

      if (!hasKnownSpell && !hasPreparedSpell) {
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
      reaction.trigger !== context.trigger
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
      reaction.preventsCriticalHit === false &&
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
        item => item.id === participantId
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

    return reactions.filter(reaction => {
      return canUseReactionEffect(
        participantId,
        reaction.id,
        context
      ).allowed
    })
  }

  const useReactionEffect = (
    participantId,
    reactionId,
    context = {}
  ) => {
    const check = canUseReactionEffect(
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

    const reaction = check.reaction

    const used = useReaction(participantId)

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

  return {
    sortedTurnOrder,
    currentParticipant,
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
    getEffectiveArmorClass,
    useReactionEffect,
    getAvailableReactions,
    canUseReactionEffect,
    getReactionById
  }
}