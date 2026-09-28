import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { combatTargets } from '~/data/combatTargets'
import { races } from '~/data/races'
import { createCharacterParticipant, getParticipantAttackProfile } from '~/domain/combat/participantFactory'
import { resolveRollMode, rollD20ByMode, rollWeaponDamage, getCoverACBonus } from '~/domain/combat/attackEngine'

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

  const getInitiativeModifier = participant => {
    if (participant?.initiativeModifier != null) {
      return Number(participant.initiativeModifier) || 0
    }

    if (participant?.dexterity != null) {
      return Math.floor((Number(participant.dexterity) - 10) / 2)
    }

    return 0
  }

  const rollInitiative = participant => {
    const roll = Math.floor(Math.random() * 20) + 1
    const modifier = getInitiativeModifier(participant)
    participant.initiativeRoll = roll
    participant.initiative = roll + modifier
    return participant.initiative
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

      faction: participant.faction ?? (
        participant.type === 'player'
          ? 'friendly'
          : participant.type === 'enemy' || participant.type === 'monster'
            ? 'hostile'
            : 'neutral'
      ),

      actionUsed: false,

      bonusActionUsed: false,
      bonusActionSpellCast: false,

      reactionUsed: false,
      reactionACBonus: 0,

      attackActionActive: false,
      attackActionAttacksUsed: 0,
      attackActionMaxAttacks:
        participant.attackActionMaxAttacks ?? 1,

      weaponAttackProfile:
        participant.weaponAttackProfile ?? null,

      weaponId:
        participant.weaponId ?? null,

      weaponAbility:
        participant.weaponAbility ?? null,

      armorId:
        participant.armorId ?? null,

      shieldId:
        participant.shieldId ?? null,

      actionType: null,
      disengageActive: false,

      actionSurgeUses,

      actionSurgeUsesRemaining:
        participant.actionSurgeUsesRemaining ??
        actionSurgeUses,

      actionSurgeUsedThisTurn: false,

      speed,

      initiativeModifier: getInitiativeModifier(participant),

      attackBonus: Number(participant.attackBonus ?? participant.attackModifier ?? 5),
      damageDice: participant.damageDice ?? participant.damage ?? '1d6',
      damageBonus: Number(participant.damageBonus ?? participant.damageModifier ?? 2),

      movementUsed:
        participant.movementUsed ?? 0,

      remainingMovement:
        participant.remainingMovement ?? speed
    }
  }

  const pendingOpportunityAttacks = ref([])

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

  // D&D 5e 2014: flanking is an optional DMG rule, not a core PHB rule.
  const flankingEnabled = ref(false)
  const roundNumber = ref(1)

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

      if (combatStarted.value && newParticipant.currentHP > 0) {
        rollInitiative(newParticipant)
        if (!turnOrder.value.includes(newParticipant.id)) {
          turnOrder.value.push(newParticipant.id)
        }
      }

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

      initiativeModifier: getInitiativeModifier(participant),
      attackBonus: Number(participant.attackBonus ?? participant.attackModifier ?? existing.attackBonus ?? existing.attackModifier ?? 5),
      damageDice: participant.damageDice ?? participant.damage ?? existing.damageDice ?? existing.damage ?? '1d6',
      damageBonus: Number(participant.damageBonus ?? participant.damageModifier ?? existing.damageBonus ?? existing.damageModifier ?? 2),

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
    const participant = createCharacterParticipant(character)

    if (!participant) {
      return null
    }

    return addParticipant(participant)
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

    clearOpportunityAttacksForParticipant(participant.id)

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

  const queueOpportunityAttack = ({
    attackerId,
    targetId
  } = {}) => {
    const attacker = participants.value.find(
      item => item.id === attackerId
    )
    const target = participants.value.find(
      item => item.id === targetId
    )

    if (!attacker || !target) {
      return false
    }

    if (attacker.id === target.id) {
      return false
    }

    if (attacker.currentHP <= 0) {
      return false
    }

    if (attacker.reactionUsed) {
      return false
    }

    if (target.currentHP <= 0) {
      return false
    }

    const exists = pendingOpportunityAttacks.value.some(
      item =>
        item.attackerId === attackerId &&
        item.targetId === targetId
    )

    if (exists) {
      return false
    }

    pendingOpportunityAttacks.value.push({
      id: `oa-${attackerId}-${targetId}-${Date.now()}`,
      attackerId,
      targetId
    })

    return true
  }

  const declineOpportunityAttack = opportunityAttackId => {
    const index = pendingOpportunityAttacks.value.findIndex(
      item => item.id === opportunityAttackId
    )

    if (index < 0) {
      return false
    }

    pendingOpportunityAttacks.value.splice(index, 1)
    return true
  }

  const useOpportunityAttack = opportunityAttackId => {
    const pending = pendingOpportunityAttacks.value.find(
      item => item.id === opportunityAttackId
    )

    if (!pending) {
      return false
    }

    if (!useReaction(pending.attackerId)) {
      return false
    }

    pendingOpportunityAttacks.value =
      pendingOpportunityAttacks.value.filter(
        item => item.id !== opportunityAttackId
      )

    return true
  }

  const clearOpportunityAttacksForParticipant = participantId => {
    pendingOpportunityAttacks.value =
      pendingOpportunityAttacks.value.filter(
        item =>
          item.attackerId !== participantId &&
          item.targetId !== participantId
      )
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

  // Total movement spent during the current turn.
  const getMovementUsed = (
    participantId
  ) => {
    const participant =
      participants.value.find(
        item => item.id === participantId
      )

    if (!participant) {
      return 0
    }

    return Number(participant.movementUsed ?? 0)
  }

  // Movement available during the current turn.
  // Dash increases remainingMovement, so this reflects the actual
  // allowance for the current turn rather than only base Speed.
  const getMovementAllowance = (
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
      Number(participant.movementUsed ?? 0) +
      Number(participant.remainingMovement ?? 0)
    )
  }

  /*
   * DASH
   *
   * Dash использует Action и добавляет
   * скорость персонажа к текущему
   * доступному перемещению.
   *
   * Например:
   * скорость 25
   * после Dash = 50
   */

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

    /*
     * Dash использует Action
     */
    participant.actionUsed = true

    participant.actionType = 'dash'

    /*
     * Добавляем ещё одну скорость
     *
     * Было:
     * 25
     *
     * После Dash:
     * 50
     *
     * Если уже потратил 10:
     * было 15 осталось
     * после Dash станет 40
     */
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

    /*
     * Защита от:
     *
     * startCombat(undefined)
     * startCombat(null)
     * startCombat({})
     *
     * В этом случае строим порядок
     * автоматически из участников.
     */
    if (!Array.isArray(combatOrder)) {
      combatOrder = []
    }

    /*
     * Если порядок не передан,
     * формируем его самостоятельно.
     */
    if (
      combatOrder.length === 0
    ) {
      const aliveParticipants = participants.value.filter(
        participant => participant.currentHP > 0
      )

      aliveParticipants.forEach(participant => {
        rollInitiative(participant)
      })

      combatOrder = aliveParticipants
        .sort((a, b) => {
          if (b.initiative !== a.initiative) {
            return b.initiative - a.initiative
          }
          return b.initiativeModifier - a.initiativeModifier
        })
        .map(participant => participant.id)
    }

    /*
     * Убираем ID, которых больше
     * нет среди участников.
     */
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
    roundNumber.value = 1

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

    /*
     * Старый участник больше
     * не получает временный AC.
     */
    const previousParticipant =
      currentParticipant.value

    if (
      previousParticipant
    ) {
      previousParticipant.reactionACBonus =
        0
    }

    if (nextIndex <= turnIndex.value) {
      roundNumber.value += 1
    }

    turnIndex.value =
      nextIndex

    /*
     * Новый участник получает
     * полный набор ресурсов хода.
     */
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

    if (previousIndex >= turnIndex.value) {
      roundNumber.value = Math.max(1, roundNumber.value - 1)
    }

    turnIndex.value =
      previousIndex

    resetTurnActions(
      currentParticipant.value
    )

    return true
  }

  const getAttackProfile = participantId => {
    const participant = participants.value.find(
      item => item.id === participantId
    )

    return getParticipantAttackProfile(participant)
  }

  const getAttackRangeMode = (attackProfile, distanceFeet) => {
    if (!attackProfile) {
      return {
        valid: false,
        ranged: false,
        longRange: false,
        reason: 'weapon-unavailable'
      }
    }

    const distance = Number(distanceFeet ?? 0)

    if (!attackProfile.isRanged && attackProfile.isThrown && distance > attackProfile.reach) {
      if (distance <= attackProfile.longRange) {
        return {
          valid: true,
          ranged: true,
          longRange: distance > attackProfile.normalRange,
          reason: null
        }
      }

      return {
        valid: false,
        ranged: true,
        longRange: true,
        reason: 'out-of-range'
      }
    }

    if (attackProfile.isRanged) {
      if (distance > attackProfile.longRange) {
        return {
          valid: false,
          ranged: true,
          longRange: true,
          reason: 'out-of-range'
        }
      }

      return {
        valid: true,
        ranged: true,
        longRange: distance > attackProfile.normalRange,
        reason: null
      }
    }

    if (distance > attackProfile.reach) {
      return {
        valid: false,
        ranged: false,
        longRange: false,
        reason: 'out-of-reach'
      }
    }

    return {
      valid: true,
      ranged: false,
      longRange: false,
      reason: null
    }
  }

  const canMakeWeaponAttack = (attackerId, targetId, attackContext = {}) => {
    const attacker = participants.value.find(item => item.id === attackerId)
    const target = participants.value.find(item => item.id === targetId)

    if (!attacker || !target) {
      return { allowed: false, reason: 'participant-not-found' }
    }

    if (target.currentHP <= 0) {
      return { allowed: false, reason: 'target-unconscious' }
    }

    if (attacker.currentHP <= 0) {
      return { allowed: false, reason: 'attacker-unconscious' }
    }

    if (currentTurn.value !== attackerId) {
      return { allowed: false, reason: 'not-current-turn' }
    }

    if (!canUseAttackActionAttack(attackerId)) {
      return { allowed: false, reason: 'attack-action-unavailable' }
    }

    const attackProfile = getAttackProfile(attackerId)
    const range = getAttackRangeMode(
      attackProfile,
      attackContext.distanceFeet ?? 0
    )

    if (!range.valid) {
      return { allowed: false, reason: range.reason }
    }

    if (attackContext.lineOfSight === false) {
      return { allowed: false, reason: 'line-of-sight-blocked' }
    }

    if (attackContext.cover === 'total') {
      return { allowed: false, reason: 'total-cover' }
    }

    const disadvantageSources = [
      ...(attackContext.disadvantageSources ?? [])
    ]

    if (range.ranged && attackContext.withinFiveFeetOfHostile && !disadvantageSources.includes('hostile-within-5-feet')) {
      disadvantageSources.push('hostile-within-5-feet')
    }

    if (range.longRange && !disadvantageSources.includes('long-range')) {
      disadvantageSources.push('long-range')
    }

    return {
      allowed: true,
      attackProfile,
      range,
      disadvantageSources
    }
  }

  const resolveWeaponAttack = ({
    attackerId,
    targetId,
    attackContext = {}
  } = {}) => {
    const check = canMakeWeaponAttack(
      attackerId,
      targetId,
      attackContext
    )

    if (!check.allowed) {
      return {
        success: false,
        reason: check.reason
      }
    }

    const attacker = participants.value.find(item => item.id === attackerId)
    const target = participants.value.find(item => item.id === targetId)
    const attackProfile = check.attackProfile

    const advantageSources = [
      ...(attackContext.advantageSources ?? [])
    ]
    const disadvantageSources = [
      ...(check.disadvantageSources ?? attackContext.disadvantageSources ?? [])
    ]

    const mode = resolveRollMode(
      advantageSources,
      disadvantageSources
    )

    if (!useAttackActionAttack(attackerId)) {
      return {
        success: false,
        reason: 'attack-action-unavailable'
      }
    }

    const roll = rollD20ByMode(mode)
    const d20 = roll.roll
    const coverBonus = getCoverACBonus(attackContext.cover)
    const baseTargetAC = getEffectiveArmorClass(targetId)
    const targetAC = baseTargetAC + coverBonus
    const total = d20 + Number(attackProfile.attackModifier ?? 0)
    const critical = d20 === 20
    const naturalOne = d20 === 1
    const hit = critical || (!naturalOne && total >= targetAC)

    let damage = null

    if (hit) {
      damage = rollWeaponDamage(
        attackProfile.weapon.damage,
        attackProfile.damageModifier,
        critical,
        attackProfile.weapon.id === 'unarmed-strike'
      )

      applyDamage(targetId, damage.total)
    }

    return {
      success: true,
      attackerId,
      targetId,
      weapon: attackProfile.weapon,
      attackProfile,
      mode,
      advantageSources,
      disadvantageSources,
      rolls: roll.rolls,
      d20,
      attackBonus: attackProfile.attackModifier,
      total,
      targetAC,
      baseTargetAC,
      cover: attackContext.cover ?? null,
      coverBonus,
      critical,
      naturalOne,
      hit,
      damage: damage?.total ?? 0,
      damageRolls: damage?.rolls ?? [],
      damageDiceTotal: damage?.diceTotal ?? 0,
      targetCurrentHP: target.currentHP,
      attacksUsed: attacker.attackActionAttacksUsed,
      attacksRemaining: Math.max(
        0,
        attacker.attackActionMaxAttacks - attacker.attackActionAttacksUsed
      )
    }
  }

  const canMakeBasicAttack = (attackerId, targetId, attackContext = null) => {
    return canMakeWeaponAttack(
      attackerId,
      targetId,
      attackContext ?? {}
    ).allowed
  }

  const resolveBasicAttack = ({
    attackerId,
    targetId,
    advantage = false,
    disadvantage = false,
    attackContext = null
  } = {}) => {
    const context = {
      ...(attackContext ?? {}),
      advantageSources: [
        ...(attackContext?.advantageSources ?? []),
        ...(advantage ? ['legacy-advantage'] : [])
      ],
      disadvantageSources: [
        ...(attackContext?.disadvantageSources ?? []),
        ...(disadvantage ? ['legacy-disadvantage'] : [])
      ]
    }

    return resolveWeaponAttack({
      attackerId,
      targetId,
      attackContext: context
    })
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

  const setFlankingEnabled = enabled => {
    flankingEnabled.value = Boolean(enabled)
    return flankingEnabled.value
  }

  const toggleFlanking = () => {
    flankingEnabled.value = !flankingEnabled.value
    return flankingEnabled.value
  }

  const endCombat = () => {
    combatStarted.value =
      false

    turnOrder.value = []

    turnIndex.value = 0
    roundNumber.value = 1

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
    roundNumber.value = 1

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

  const enemyPresets = {
    goblin: { id: 'goblin', name: 'Гоблин', type: 'enemy', faction: 'enemy', maxHP: 7, currentHP: 7, armorClass: 15, speed: 30, initiativeModifier: 2, attackBonus: 4, damageDice: '1d6', damageBonus: 2 },
    orc: { id: 'orc', name: 'Орк', type: 'enemy', faction: 'enemy', maxHP: 15, currentHP: 15, armorClass: 13, speed: 30, initiativeModifier: 1, attackBonus: 5, damageDice: '1d12', damageBonus: 3 },
    skeleton: { id: 'skeleton', name: 'Скелет', type: 'enemy', faction: 'enemy', maxHP: 13, currentHP: 13, armorClass: 13, speed: 30, initiativeModifier: 2, attackBonus: 4, damageDice: '1d6', damageBonus: 2 }
  }

  const addEnemyPreset = presetId => {
    const preset = enemyPresets[presetId]
    if (!preset) return null
    const count = participants.value.filter(item => item.enemyPreset === presetId).length + 1
    return addParticipant({ ...preset, id: `${presetId}-${Date.now()}-${count}`, enemyPreset: presetId, name: count > 1 ? `${preset.name} ${count}` : preset.name })
  }

  const addTestPlayer = () => {
    const count = participants.value.filter(item => item.type === 'player').length + 1
    return addParticipant({ id: `test-player-${Date.now()}-${count}`, name: count > 1 ? `Игрок ${count}` : 'Тестовый герой', type: 'player', faction: 'friendly', level: 1, maxHP: 12, currentHP: 12, armorClass: 16, speed: 30, initiativeModifier: 2, attackBonus: 5, damageDice: '1d8', damageBonus: 3 })
  }

  return {
    participants,

    targets,

    selectedTargetId,

    selectedTarget,

    combatStarted,

    turnOrder,

    turnIndex,
    roundNumber,
    flankingEnabled,

    currentTurn,

    currentParticipant,

    addParticipant,
    enemyPresets,
    addEnemyPreset,
    addTestPlayer,

    addCharacter,

    selectTarget,

    applyDamage,

    resetTarget,

    useAction,

    canMove,

    moveParticipant,

    getRemainingMovement,
    getMovementUsed,
    getMovementAllowance,

    canUseAttackActionAttack,

    useAttackActionAttack,

    canUseActionSurge,

    useActionSurge,

    useBonusAction,

    useReaction,

    pendingOpportunityAttacks,
    queueOpportunityAttack,
    declineOpportunityAttack,
    useOpportunityAttack,
    clearOpportunityAttacksForParticipant,

    markBonusActionSpellCast,

    canUseSpellSlot,

    useSpellSlot,

    setReactionACBonus,

    getEffectiveArmorClass,

    canDash,

    useDash,

    setTurnOrder,

    startCombat,

    nextTurn,

    previousTurn,

    endCombat,
    setFlankingEnabled,
    toggleFlanking,

    resetCombat,

    pendingAttack,

    getAttackProfile,
    canMakeWeaponAttack,
    resolveWeaponAttack,
    canMakeBasicAttack,
    resolveBasicAttack,
    setPendingAttack,

    clearPendingAttack,

    createPendingAttack,

    resolvePendingAttack
  }
})