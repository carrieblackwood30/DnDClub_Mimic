import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { combatTargets } from '~/data/combatTargets'
import { races } from '~/data/races'

export const useCombatStore = defineStore('combat', () => {
  const getActionSurgeUses = (participant) => {
    if (
      participant.classId !== 'fighter' &&
      participant.classId !== 'Воин'
    ) {
      return 0
    }

    const level = Number(
      participant.level ?? 1
    )

    if (level < 2) {
      return 0
    }

    return level >= 17 ? 2 : 1
  }

  const getParticipantSpeed = (participant) => {
    if (participant.speed != null) {
      return Number(participant.speed)
    }

    if (participant.raceId) {
      const race = races.find(
        item => item.id === participant.raceId
      )

      if (race) {
        if (participant.subraceId) {
          const subrace = race.subraces?.find(
            item => item.id === participant.subraceId
          )

          if (subrace?.speed != null) {
            return Number(subrace.speed)
          }
        }

        if (race.speed != null) {
          return Number(race.speed)
        }
      }
    }

    return 30
  }

  const createParticipantState = (
    participant
  ) => {
    const speed = getParticipantSpeed(participant)

    const actionSurgeUses =
      participant.actionSurgeUses ??
      getActionSurgeUses(participant)

    return {
      ...participant,

      actionUsed: false,

      bonusActionUsed: false,
      bonusActionSpellCast: false,

      reactionUsed: false,
      reactionACBonus: 0,

      attackActionActive: false,
      attackActionAttacksUsed: 0,
      attackActionMaxAttacks:
        participant.attackActionMaxAttacks ?? 1,

      actionType: null,
      disengageActive: false,

      actionSurgeUses,

      actionSurgeUsesRemaining:
        participant.actionSurgeUsesRemaining ??
        actionSurgeUses,

      actionSurgeUsedThisTurn: false,

      speed,

      movementUsed:
        participant.movementUsed ?? 0,

      remainingMovement:
        participant.remainingMovement ?? speed
    }
  }

  const participants = ref(
    combatTargets.map(target =>
      createParticipantState(target)
    )
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

    return (
      participants.value.find(
        participant =>
          participant.id ===
          selectedTargetId.value
      ) ?? null
    )
  })

  const currentTurn = computed(() => {
    return (
      turnOrder.value[
        turnIndex.value
      ] ?? null
    )
  })

  const currentParticipant = computed(() => {
    if (!currentTurn.value) {
      return null
    }

    return (
      participants.value.find(
        participant =>
          participant.id ===
          currentTurn.value
      ) ?? null
    )
  })

  const addParticipant = (participant) => {
    const index =
      participants.value.findIndex(
        item =>
          item.id === participant.id
      )

    if (index === -1) {
      const newParticipant =
        createParticipantState(
          participant
        )

      participants.value.push(
        newParticipant
      )

      return newParticipant
    }

    const existing =
      participants.value[index]

    const preserveCombatState =
      combatStarted.value

    const newActionSurgeUses =
      participant.actionSurgeUses ??
      getActionSurgeUses(participant)

    const speed =
      participant.speed ??
      existing.speed ??
      getParticipantSpeed(participant)

    const updatedParticipant = {
      ...existing,
      ...participant,

      actionUsed: preserveCombatState
        ? existing.actionUsed
        : false,

      bonusActionUsed:
        preserveCombatState
          ? existing.bonusActionUsed
          : false,

      bonusActionSpellCast:
        preserveCombatState
          ? existing.bonusActionSpellCast
          : false,

      reactionUsed:
        preserveCombatState
          ? existing.reactionUsed
          : false,

      reactionACBonus:
        preserveCombatState
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
          : participant.attackActionMaxAttacks ??
            1,

      actionType:
        preserveCombatState
          ? existing.actionType
          : null,

      disengageActive:
        preserveCombatState
          ? existing.disengageActive ?? false
          : false,

      actionSurgeUses:
        existing.actionSurgeUses ??
        newActionSurgeUses,

      actionSurgeUsesRemaining:
        existing.actionSurgeUsesRemaining ??
        newActionSurgeUses,

      actionSurgeUsedThisTurn:
        preserveCombatState
          ? existing.actionSurgeUsedThisTurn
          : false,

      speed,

      movementUsed:
        preserveCombatState
          ? existing.movementUsed
          : 0,

      remainingMovement:
        preserveCombatState
          ? existing.remainingMovement
          : speed,

      currentHP:
        preserveCombatState
          ? existing.currentHP
          : participant.currentHP,

      currentSpellSlots:
        preserveCombatState
          ? [
              ...(existing.currentSpellSlots ??
                [])
            ]
          : [
              ...(participant.currentSpellSlots ??
                [])
            ],

      initiative:
        preserveCombatState
          ? existing.initiative
          : participant.initiative ?? 0,

      initiativeRoll:
        preserveCombatState
          ? existing.initiativeRoll
          : undefined
    }

    participants.value[index] =
      updatedParticipant

    return updatedParticipant
  }

  const addCharacter = (character) => {
    if (!character) {
      return
    }

    addParticipant({
      id: `character-${character.id}`,

      characterId: character.id,

      name:
        character.name ||
        'Без имени',

      type: 'player',

      classId:
        character.classId ?? null,

      subclassId:
        character.subclassId ?? null,

      level:
        character.level ?? 1,

      raceId:
        character.raceId ?? null,

      subraceId:
        character.subraceId ?? null,

      initiativeModifier: 0,

      initiative: 0,

      maxHP:
        character.maxHP ?? 0,

      currentHP:
        character.currentHP ??
        character.maxHP ??
        0,

      armorClass:
        character.armorClass ?? 10,

      spellSlots: [
        ...(character.spellSlots ?? [])
      ],

      currentSpellSlots: [
        ...(character.currentSpellSlots ??
          character.spellSlots ??
          [])
      ]
    })
  }

  const selectTarget = (id) => {
    const target =
      participants.value.find(
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
    const target =
      participants.value.find(
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

      currentHP:
        target.currentHP,

      maxHP:
        target.maxHP,

      defeated:
        target.currentHP <= 0
    }
  }

  const resetTarget = (targetId) => {
    const target =
      participants.value.find(
        participant =>
          participant.id === targetId
      )

    if (!target) {
      return
    }

    target.currentHP =
      target.maxHP

    resetTurnActions(target)
  }

  const resetTurnActions = (
    participant
  ) => {
    if (!participant) {
      return
    }

    participant.actionUsed = false

    participant.bonusActionUsed = false

    participant.bonusActionSpellCast =
      false

    participant.reactionUsed = false

    participant.reactionACBonus = 0

    participant.attackActionActive =
      false

    participant.attackActionAttacksUsed =
      0

    participant.actionType = null

    participant.disengageActive = false

    participant.actionSurgeUsedThisTurn =
      false

    participant.movementUsed = 0

    participant.remainingMovement =
      participant.speed ?? 0
  }

  const canMove = (
    participantId,
    distance
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    const amount = Number(distance)

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return false
    }

    return (
      amount <=
      participant.remainingMovement
    )
  }

  const moveParticipant = (
    participantId,
    distance
  ) => {
    if (
      !canMove(
        participantId,
        distance
      )
    ) {
      return false
    }

    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    const amount =
      Number(distance)

    participant.movementUsed +=
      amount

    participant.remainingMovement -=
      amount

    return true
  }

  const getRemainingMovement = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return 0
    }

    return participant.remainingMovement
  }

  const canDash = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    if (participant.actionUsed) {
      return false
    }

    return true
  }

  const useDash = (
    participantId
  ) => {
    if (
      !canDash(participantId)
    ) {
      return false
    }

    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    participant.actionUsed = true

    participant.actionType = 'dash'

    participant.remainingMovement +=
      participant.speed

    return true
  }

  const canDisengage = (
    participantId
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

    return !participant.actionUsed
  }

  const useDisengage = (
    participantId
  ) => {
    if (!canDisengage(participantId)) {
      return false
    }

    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return false
    }

    participant.actionUsed = true
    participant.attackActionActive = false
    participant.attackActionAttacksUsed = 0
    participant.actionType = 'disengage'
    participant.disengageActive = true

    return true
  }

  const useAction = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      participant.actionUsed
    ) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    participant.actionUsed = true

    participant.attackActionActive =
      false

    participant.attackActionAttacksUsed =
      0

    participant.actionType =
      'action'

    return true
  }

  const canUseAttackActionAttack = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    if (
      !participant.actionUsed
    ) {
      return true
    }

    if (
      !participant.attackActionActive
    ) {
      return false
    }

    return (
      participant.attackActionAttacksUsed <
      participant.attackActionMaxAttacks
    )
  }

  const useAttackActionAttack = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    if (
      !participant.actionUsed
    ) {
      participant.actionUsed = true

      participant.actionType =
        'attack'

      participant.attackActionActive =
        true

      participant.attackActionAttacksUsed =
        1

      return true
    }

    if (
      !participant.attackActionActive
    ) {
      return false
    }

    if (
      participant.attackActionAttacksUsed >=
      participant.attackActionMaxAttacks
    ) {
      return false
    }

    participant.attackActionAttacksUsed +=
      1

    return true
  }

  const canUseActionSurge = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    if (
      participant.actionSurgeUsesRemaining <=
      0
    ) {
      return false
    }

    if (
      participant.actionSurgeUsedThisTurn
    ) {
      return false
    }

    return true
  }

  const useActionSurge = (
    participantId
  ) => {
    if (
      !canUseActionSurge(
        participantId
      )
    ) {
      return false
    }

    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    participant.actionSurgeUsesRemaining -=
      1

    participant.actionSurgeUsedThisTurn =
      true

    if (
      participant.actionUsed
    ) {
      participant.actionUsed = false

      participant.attackActionActive =
        false

      participant.attackActionAttacksUsed =
        0

      participant.actionType = null
    }

    return true
  }

  const useBonusAction = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      participant.bonusActionUsed
    ) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    participant.bonusActionUsed =
      true

    return true
  }

  const useReaction = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      participant.reactionUsed
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    participant.reactionUsed =
      true

    return true
  }

  const markBonusActionSpellCast = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    if (
      !participant.bonusActionUsed
    ) {
      return false
    }

    if (
      currentTurn.value !==
      participantId
    ) {
      return false
    }

    if (
      participant.currentHP <= 0
    ) {
      return false
    }

    participant.bonusActionSpellCast =
      true

    return true
  }

  const setTurnOrder = (
    order
  ) => {
    if (!Array.isArray(order)) {
      return false
    }

    turnOrder.value = [
      ...order
    ]

    turnIndex.value = 0

    return true
  }

  const startCombat = (
    order = []
  ) => {
    let combatOrder = order

    if (!Array.isArray(combatOrder)) {
      combatOrder = []
    }

    if (
      combatOrder.length === 0
    ) {
      combatOrder = participants.value
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
    }

    combatOrder =
      combatOrder.filter(
        id =>
          participants.value.some(
            participant =>
              participant.id === id &&
              participant.currentHP > 0
          )
      )

    if (
      combatOrder.length === 0
    ) {
      combatStarted.value = false

      turnOrder.value = []

      turnIndex.value = 0

      return false
    }

    participants.value.forEach(
      participant => {
        resetTurnActions(
          participant
        )
      }
    )

    turnOrder.value = [
      ...combatOrder
    ]

    turnIndex.value = 0

    combatStarted.value = true

    return true
  }

  const findNextAliveIndex = () => {
    if (
      !turnOrder.value.length
    ) {
      return null
    }

    for (
      let offset = 1;
      offset <=
      turnOrder.value.length;
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
    if (
      !turnOrder.value.length
    ) {
      return null
    }

    for (
      let offset = 1;
      offset <=
      turnOrder.value.length;
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
    const nextIndex =
      findNextAliveIndex()

    if (
      nextIndex === null
    ) {
      return false
    }

    const previousParticipant =
      currentParticipant.value

    if (
      previousParticipant
    ) {
      previousParticipant.reactionACBonus =
        0
    }

    turnIndex.value =
      nextIndex

    resetTurnActions(
      currentParticipant.value
    )

    return true
  }

  const previousTurn = () => {
    const previousIndex =
      findPreviousAliveIndex()

    if (
      previousIndex === null
    ) {
      return false
    }

    const previousParticipant =
      currentParticipant.value

    if (
      previousParticipant
    ) {
      previousParticipant.reactionACBonus =
        0
    }

    turnIndex.value =
      previousIndex

    resetTurnActions(
      currentParticipant.value
    )

    return true
  }

  const setPendingAttack = (
    attack
  ) => {
    pendingAttack.value =
      attack
  }

  const clearPendingAttack = () => {
    pendingAttack.value =
      null
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
          participant.id ===
          attackerId
      )

    const target =
      participants.value.find(
        participant =>
          participant.id ===
          targetId
      )

    if (
      !attacker ||
      !target
    ) {
      return false
    }

    if (
      target.currentHP <= 0
    ) {
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
    const attack =
      pendingAttack.value

    if (!attack) {
      return null
    }

    const target =
      participants.value.find(
        participant =>
          participant.id ===
          attack.targetId
      )

    if (!target) {
      pendingAttack.value =
        null

      return null
    }

    pendingAttack.value =
      null

    return {
      ...attack,

      targetCurrentHP:
        target.currentHP
    }
  }

  const setReactionACBonus = (
    participantId,
    bonus
  ) => {
    const participant =
      participants.value.find(
        item =>
          item.id === participantId
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
        item =>
          item.id === participantId
      )

    if (!participant) {
      return 0
    }

    return (
      participant.armorClass +
      (
        participant.reactionACBonus ??
        0
      )
    )
  }

  const endCombat = () => {
    combatStarted.value =
      false

    turnOrder.value = []

    turnIndex.value = 0

    selectedTargetId.value =
      null

    pendingAttack.value =
      null
  }

  const resetCombat = () => {
    participants.value.forEach(
      participant => {
        participant.currentHP =
          participant.maxHP

        participant.actionSurgeUsesRemaining =
          participant.actionSurgeUses

        resetTurnActions(
          participant
        )
      }
    )

    combatStarted.value =
      false

    turnOrder.value = []

    turnIndex.value = 0

    selectedTargetId.value =
      null

    pendingAttack.value =
      null
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
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    return (
      participant
        .currentSpellSlots?.[
          level - 1
        ] ?? 0
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
        item =>
          item.id === participantId
      )

    if (!participant) {
      return false
    }

    const index =
      level - 1

    participant.currentSpellSlots[
      index
    ] = Math.max(
      0,
      participant
        .currentSpellSlots[index] - 1
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

    addCharacter,

    selectTarget,

    applyDamage,

    resetTarget,

    useAction,

    canMove,

    moveParticipant,

    getRemainingMovement,

    canUseAttackActionAttack,

    useAttackActionAttack,

    canUseActionSurge,

    useActionSurge,

    useBonusAction,

    useReaction,

    markBonusActionSpellCast,

    canUseSpellSlot,

    useSpellSlot,

    setReactionACBonus,

    getEffectiveArmorClass,

    canDash,

    useDash,

    canDisengage,

    useDisengage,

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