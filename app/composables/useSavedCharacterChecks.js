import { useDice } from '~/composables/useDice'

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

  const getAbilityModifier = (ability) => {
    const score =
      character.value?.abilityScores?.[ability] ?? 10

    return Math.floor((score - 10) / 2)
  }

  const getProficiencyBonus = () => {
    const level =
      character.value?.level ?? 1

    return Math.floor((level - 1) / 4) + 2
  }

  const getAbilityCheckModifier = (ability) => {
    return getAbilityModifier(ability)
  }

  const getSavingThrowModifier = (ability) => {
    const baseModifier =
      getAbilityModifier(ability)

    const savingThrowProficiencies =
      characterClass.value?.savingThrowProficiencies ?? []

    const isProficient =
      savingThrowProficiencies.includes(ability)

    return baseModifier +
      (isProficient
        ? getProficiencyBonus()
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