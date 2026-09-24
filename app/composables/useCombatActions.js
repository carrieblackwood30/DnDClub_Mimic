import { computed } from 'vue'

import { combatActions } from '~/data/combatActions'
import { useCombat } from '~/composables/useCombat'
import { useCombatStore } from '~/stores/combat'

export const useCombatActions = () => {
  const combatStore = useCombatStore()

  const {
    canUseAction
  } = useCombat()

  const actions = computed(
    () => combatActions
  )

  const getActionById = (id) => {
    return combatActions.find(
      action =>
        action.id === id
    ) ?? null
  }

  const getActionsByResource = (
    resource
  ) => {
    return combatActions.filter(
      action =>
        action.resource === resource
    )
  }

  const canUseCombatAction = (
    participantId,
    actionId
  ) => {
    const action =
      getActionById(actionId)

    if (!action) {
      return false
    }

    if (
      action.resource !==
      'action'
    ) {
      return false
    }

    if (
      actionId === 'attack'
    ) {
      return combatStore.canUseAttackActionAttack(
        participantId
      )
    }

    return canUseAction(
      participantId
    )
  }

  const useCombatAction = (
    participantId,
    actionId,
    options = {}
  ) => {
    return combatStore.useCombatAction(
      participantId,
      actionId,
      options
    )
  }

  const isAttackAction = (
    actionId
  ) => {
    return actionId === 'attack'
  }

  const isSpellAction = (
    actionId
  ) => {
    return actionId === 'cast-spell'
  }

  const isMovementAction = (
    actionId
  ) => {
    const action =
      getActionById(actionId)

    return (
      action?.type ===
      'movement'
    )
  }

  const isUtilityAction = (
    actionId
  ) => {
    const action =
      getActionById(actionId)

    return (
      action?.type ===
      'utility'
    )
  }

  return {
    actions,
    combatStore,

    getActionById,
    getActionsByResource,

    canUseCombatAction,
    useCombatAction,

    isAttackAction,
    isSpellAction,
    isMovementAction,
    isUtilityAction
  }
}