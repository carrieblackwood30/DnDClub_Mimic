import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { combatTargets } from '~/data/combatTargets'

export const useCombatStore = defineStore('combat', () => {
  const participants = ref(
    combatTargets.map(target => ({
      ...target,
      actionUsed: false,
      bonusActionUsed: false,
      bonusActionSpellCast: false,
      reactionUsed: false,
      reactionACBonus: 0,
      attackActionActive: false,
      attackActionAttacksUsed: 0,
      attackActionMaxAttacks: 1
    }))
  )

  const selectedTargetId = ref(null)
  const pendingAttack = ref(null)
  const combatStarted = ref(false)
  const turnIndex = ref(0)
  const turnOrder = ref([])

  const targets = computed(() => {
    return participants.value.filter(
      participant =>
        participant.type !== 'player'
    )
  })

  const selectedTarget = computed(() => {
    if (!selectedTargetId.value) {
      return null
    }

    return participants.value.find(
      participant =>
        participant.id === selectedTargetId.value
    ) ?? null
  })

  const currentTurn = computed(() => {
    return turnOrder.value[turnIndex.value] ?? null
  })

  const currentParticipant = computed(() => {
    if (!currentTurn.value) {
      return null
    }

    return participants.value.find(
      participant =>
        participant.id === currentTurn.value
    ) ?? null
  })

  const addParticipant = (participant) => {
    const index = participants.value.findIndex(
      item => item.id === participant.id
    )

    if (index === -1) {
      participants.value.push({
        ...participant,
        actionUsed: false,
        bonusActionUsed: false,
        bonusActionSpellCast: false,
        reactionUsed: false,
        reactionACBonus: 0,
        attackActionActive: false,
        attackActionAttacksUsed: 0,
        attackActionMaxAttacks: 1
      })

      return participants.value[
        participants.value.length - 1
      ]
    }

    const existing =
      participants.value[index]

    const preserveCombatState =
      combatStarted.value

    const updatedParticipant = {
      ...existing,
      ...participant,
      actionUsed: preserveCombatState
        ? existing.actionUsed
        : false,
      bonusActionUsed: preserveCombatState
        ? existing.bonusActionUsed
        : false,
      bonusActionSpellCast:
        preserveCombatState
          ? existing.bonusActionSpellCast
          : false,
      reactionUsed: preserveCombatState
        ? existing.reactionUsed
        : false,
      reactionACBonus: preserveCombatState
        ? existing.reactionACBonus
        : 0,
      attackActionActive:
        preserveCombatState
          ? existing.attackActionActive
          : false,
      attackActionAttacksUsed:
        preserveCombatState
          ? existing.attackActionAttacksUsed
          : 0,
      attackActionMaxAttacks:
        preserveCombatState
          ? existing.attackActionMaxAttacks
          : 1,
      currentHP: preserveCombatState
        ? existing.currentHP
        : participant.currentHP,
      currentSpellSlots: preserveCombatState
        ? [
            ...(existing.currentSpellSlots ?? [])
          ]
        : [
            ...(participant.currentSpellSlots ?? [])
          ],
      initiative: preserveCombatState
        ? existing.initiative
        : participant.initiative ?? 0,
      initiativeRoll: preserveCombatState
        ? existing.initiativeRoll
        : undefined
    }

    participants.value[index] =
      updatedParticipant

    return updatedParticipant
  }

  const selectTarget = (id) => {
    const target = participants.value.find(
      participant =>
        participant.id === id
    )

    if (!target) {
      return
    }

    if (target.currentHP <= 0) {
      return
    }

    selectedTargetId.value = id
    pendingAttack.value = null
  }

  const applyDamage = (
    targetId,
    damage
  ) => {
    const target = participants.value.find(
      participant =>
        participant.id === targetId
    )

    if (!target) {
      return null
    }

    const amount = Math.max(
      0,
      Number(damage)
    )

    target.currentHP = Math.max(
      0,
      target.currentHP - amount
    )

    return {
      damage: amount,
      currentHP: target.currentHP,
      maxHP: target.maxHP,
      defeated: target.currentHP <= 0
    }
  }

  const resetTarget = (targetId) => {
    const target = participants.value.find(
      participant =>
        participant.id === targetId
    )

    if (!target) {
      return
    }

    target.currentHP = target.maxHP
    resetTurnActions(target)
  }

  const resetTurnActions = (participant) => {
    if (!participant) {
      return
    }

    participant.actionUsed = false
    participant.bonusActionUsed = false
    participant.bonusActionSpellCast = false
    participant.reactionUsed = false
    participant.reactionACBonus = 0
    participant.attackActionActive = false
    participant.attackActionAttacksUsed = 0
    participant.attackActionMaxAttacks = 1
  }

  const useAction = (participantId) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (participant.actionUsed) {
      return false
    }

    if (
      currentTurn.value !== participantId
    ) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    participant.actionUsed = true
    participant.attackActionActive = false
    participant.attackActionAttacksUsed = 0
    participant.attackActionMaxAttacks = 1

    return true
  }

  const canUseAttackActionAttack = (
    participantId,
    maxAttacks = 1
  ) => {
    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (currentTurn.value !== participantId) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    const normalizedMaxAttacks = Math.max(
      1,
      Number(maxAttacks) || 1
    )

    if (!participant.actionUsed) {
      return true
    }

    if (!participant.attackActionActive) {
      return false
    }

    return (
      participant.attackActionAttacksUsed <
      normalizedMaxAttacks
    )
  }

  const useAttackActionAttack = (
    participantId,
    maxAttacks = 1
  ) => {
    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (currentTurn.value !== participantId) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    const normalizedMaxAttacks = Math.max(
      1,
      Number(maxAttacks) || 1
    )

    if (!participant.actionUsed) {
      participant.actionUsed = true
      participant.attackActionActive = true
      participant.attackActionMaxAttacks =
        normalizedMaxAttacks
      participant.attackActionAttacksUsed = 1

      return true
    }

    if (!participant.attackActionActive) {
      return false
    }

    if (
      participant.attackActionAttacksUsed >=
      normalizedMaxAttacks
    ) {
      return false
    }

    participant.attackActionAttacksUsed += 1
    participant.attackActionMaxAttacks =
      normalizedMaxAttacks

    return true
  }

  const useBonusAction = (participantId) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (participant.bonusActionUsed) {
      return false
    }

    if (
      currentTurn.value !== participantId
    ) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    participant.bonusActionUsed = true

    return true
  }

  const useReaction = (participantId) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (participant.reactionUsed) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    participant.reactionUsed = true

    return true
  }

  const markBonusActionSpellCast = (participantId) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (!participant.bonusActionUsed) {
      return false
    }

    if (
      currentTurn.value !== participantId
    ) {
      return false
    }

    if (participant.currentHP <= 0) {
      return false
    }

    participant.bonusActionSpellCast = true

    return true
  }

  const setTurnOrder = (order) => {
    turnOrder.value = [...order]
    turnIndex.value = 0
  }

  const startCombat = (order = []) => {
    participants.value.forEach(
      participant => {
        resetTurnActions(participant)
      }
    )

    turnOrder.value = [...order]
    turnIndex.value = 0
    combatStarted.value = true
  }

  const findNextAliveIndex = () => {
    if (!turnOrder.value.length) {
      return null
    }

    for (
      let offset = 1;
      offset <= turnOrder.value.length;
      offset++
    ) {
      const index =
        (
          turnIndex.value +
          offset
        ) %
        turnOrder.value.length

      const participant =
        participants.value.find(
          item =>
            item.id ===
            turnOrder.value[index]
        )

      if (
        participant &&
        participant.currentHP > 0
      ) {
        return index
      }
    }

    return null
  }

  const findPreviousAliveIndex = () => {
    if (!turnOrder.value.length) {
      return null
    }

    for (
      let offset = 1;
      offset <= turnOrder.value.length;
      offset++
    ) {
      const index =
        (
          turnIndex.value -
          offset +
          turnOrder.value.length
        ) %
        turnOrder.value.length

      const participant =
        participants.value.find(
          item =>
            item.id ===
            turnOrder.value[index]
        )

      if (
        participant &&
        participant.currentHP > 0
      ) {
        return index
      }
    }

    return null
  }

  const nextTurn = () => {
    const nextIndex = findNextAliveIndex()

    if (nextIndex === null) {
      return
    }

    turnIndex.value = nextIndex

    resetTurnActions(
      currentParticipant.value
    )
  }

  const previousTurn = () => {
    const previousIndex =
      findPreviousAliveIndex()

    if (previousIndex === null) {
      return
    }

    turnIndex.value = previousIndex

    resetTurnActions(
      currentParticipant.value
    )
  }

  const setPendingAttack = (attack) => {
    pendingAttack.value = attack
  }

  const clearPendingAttack = () => {
    pendingAttack.value = null
  }

  const createPendingAttack = ({
    attackerId,
    targetId,
    attackRoll,
    attackModifier,
    targetAC,
    hit,
    critical
  }) => {
    const attacker =
      participants.value.find(
        participant =>
          participant.id === attackerId
      )

    const target =
      participants.value.find(
        participant =>
          participant.id === targetId
      )

    if (!attacker || !target) {
      return false
    }

    if (target.currentHP <= 0) {
      return false
    }

    pendingAttack.value = {
      attackerId,
      targetId,
      attackRoll,
      attackModifier,
      targetAC,
      hit,
      critical
    }

    return true
  }

  const resolvePendingAttack = () => {
    const attack = pendingAttack.value

    if (!attack) {
      return null
    }

    const target =
      participants.value.find(
        participant =>
          participant.id === attack.targetId
      )

    if (!target) {
      pendingAttack.value = null
      return null
    }

    pendingAttack.value = null

    return {
      ...attack,
      targetCurrentHP: target.currentHP
    }
  }

  const setReactionACBonus = (
    participantId,
    bonus
  ) => {
    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return false
    }

    participant.reactionACBonus =
      Number(bonus) || 0

    return true
  }

  const getEffectiveArmorClass = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return 0
    }

    return (
      participant.armorClass +
      (participant.reactionACBonus ?? 0)
    )
  }

  const endCombat = () => {
    combatStarted.value = false
    turnOrder.value = []
    turnIndex.value = 0
    selectedTargetId.value = null
    pendingAttack.value = null
  }

  const resetCombat = () => {
    participants.value.forEach(
      participant => {
        participant.currentHP =
          participant.maxHP

        resetTurnActions(
          participant
        )
      }
    )

    combatStarted.value = false
    turnOrder.value = []
    turnIndex.value = 0
    selectedTargetId.value = null
    pendingAttack.value = null
  }

  const canUseSpellSlot = (
    participantId,
    level
  ) => {
    if (level < 1) {
      return false
    }

    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return false
    }

    return (
      participant.currentSpellSlots?.[level - 1] ?? 0
    ) > 0
  }

  const useSpellSlot = (
    participantId,
    level
  ) => {
    if (
      !canUseSpellSlot(
        participantId,
        level
      )
    ) {
      return false
    }

    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    const index = level - 1

    participant.currentSpellSlots[index] =
      Math.max(
        0,
        participant.currentSpellSlots[index] - 1
      )

    return true
  }

  return {
    participants,
    targets,
    selectedTargetId,
    selectedTarget,
    combatStarted,
    turnOrder,
    turnIndex,
    currentTurn,
    currentParticipant,
    addParticipant,
    selectTarget,
    applyDamage,
    resetTarget,
    useAction,
    canUseAttackActionAttack,
    useAttackActionAttack,
    useBonusAction,
    useReaction,
    markBonusActionSpellCast,
    canUseSpellSlot,
    useSpellSlot,
    setReactionACBonus,
    getEffectiveArmorClass,
    setTurnOrder,
    startCombat,
    nextTurn,
    previousTurn,
    endCombat,
    resetCombat,
    pendingAttack,
    setPendingAttack,
    clearPendingAttack,
    createPendingAttack,
    resolvePendingAttack
  }
})
