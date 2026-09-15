import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { combatTargets } from '~/data/combatTargets'

export const useCombatStore = defineStore('combat', () => {
  const participants = ref(
    combatTargets.map(target => ({
      ...target,
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      reactionACBonus: 0
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
    const exists = participants.value.some(
      item => item.id === participant.id
    )

    if (exists) {
      return
    }

    participants.value.push({
      ...participant,
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      reactionACBonus: 0
    })
  }

  const addCharacter = (character) => {
    if (!character) {
      return
    }

    addParticipant({
      id: `character-${character.id}`,
      characterId: character.id,
      name: character.name || 'Без имени',
      type: 'player',
      initiativeModifier: 0,
      initiative: 0,
      maxHP: 0,
      currentHP: 0,
      armorClass: 10
    })
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
    target.actionUsed = false
    target.bonusActionUsed = false
    target.reactionUsed = false
    target.reactionACBonus = 0
  }

  const resetTurnActions = (participant) => {
    if (!participant) {
      return
    }

    participant.actionUsed = false
    participant.bonusActionUsed = false
    participant.reactionUsed = false
    participant.reactionACBonus = 0
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

    const previousParticipant = currentParticipant.value

    if (previousParticipant) {
      previousParticipant.reactionACBonus = 0
    }

    turnIndex.value = nextIndex

    resetTurnActions(
      currentParticipant.value
    )
  }

  const previousTurn = () => {
    const previousIndex = findPreviousAliveIndex()

    if (previousIndex === null) {
      return
    }

    const previousParticipant = currentParticipant.value

    if (previousParticipant) {
      previousParticipant.reactionACBonus = 0
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
  targetAC
}) => {
  const attacker = participants.value.find(
    participant => participant.id === attackerId
  )

  const target = participants.value.find(
    participant => participant.id === targetId
  )

  if (!attacker || !target) return false
  if (target.currentHP <= 0) return false

  pendingAttack.value = {
    attackerId,
    targetId,
    attackRoll,
    attackModifier,
    targetAC
  }

  return true
}

const resolvePendingAttack = () => {
  const attack = pendingAttack.value

  if (!attack) return null

  const target = participants.value.find(
    participant => participant.id === attack.targetId
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

const setReactionACBonus = (participantId, bonus) => {
  const participant = participants.value.find(
    item => item.id === participantId
  )

  if (!participant) return false

  participant.reactionACBonus = Number(bonus) || 0

  return true
}

const getEffectiveArmorClass = (participantId) => {
  const participant = participants.value.find(
    item => item.id === participantId
  )

  if (!participant) return 0

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
    addCharacter,
    selectTarget,
    applyDamage,
    resetTarget,
    useAction,
    useBonusAction,
    useReaction,
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
    resolvePendingAttack,
  }
})