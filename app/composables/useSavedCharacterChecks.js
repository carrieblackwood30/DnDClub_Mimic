import { useDice } from '~/composables/useDice'
import {
  getAbilityModifier,
  getProficiencyBonus
} from '~/domain/character/statRules'

export const useSavedCharacterChecks = (
  character,
  characterClass
) => {
  const { rollCheck } = useDice()

  const {
    getAbilityCheckMode
  } = useSavedCharacterEffects(
    character,
    characterClass
  )

const getCharacterAbilityModifier = (
  ability
) => {
  return getAbilityModifier(
    character.value?.abilityScores?.[ability] ??
      10
  )
}

  const getAbilityCheckModifier = (ability) => {
    return getCharacterAbilityModifier(ability)
  }

const getSavingThrowModifier = (ability) => {
  const baseModifier =
    getCharacterAbilityModifier(ability)

  const savingThrowProficiencies =
    characterClass.value?.savingThrowProficiencies ?? []

  const isProficient =
    savingThrowProficiencies.includes(ability)

  return baseModifier +
    (isProficient
      ? getProficiencyBonus(
          character.value?.level
        )
      : 0)
}

  const rollAbilityCheck = (
    ability,
    mode = null
  ) => {
    const modifier =
      getAbilityCheckModifier(ability)

    const finalMode =
      mode ?? getAbilityCheckMode(ability)

    return rollCheck(
      modifier,
      finalMode
    )
  }

  const rollSavingThrow = (
    ability,
    mode = 'normal'
  ) => {
    const modifier =
      getSavingThrowModifier(ability)

    return rollCheck(
      modifier,
      mode
    )
  }

  return {
    getAbilityModifier,
    getAbilityCheckModifier,
    getSavingThrowModifier,
    getAbilityCheckMode,
    rollAbilityCheck,
    rollSavingThrow
  }
}