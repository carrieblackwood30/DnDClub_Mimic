import { useCharacterCreatorStore } from '~/stores/characterCreator'
import { useCharacterClass } from '~/composables/useCharacterClass'
import { useCharacterStats } from '~/composables/useCharacterStats'
import { useCharacterProficiency } from '~/composables/useCharacterProficiency'
import { useCharacterEffects } from '~/composables/useCharacterEffects'
import { useDice } from '~/composables/useDice'

export const useCharacterSaves = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    savingThrowProficiencies
  } = useCharacterClass()

  const {
    abilityModifiers
  } = useCharacterStats()

  const {
    proficiencyBonus
  } = useCharacterProficiency()

  const {
    strengthDisadvantage,
    dexterityDisadvantage
  } = useCharacterEffects()

  const {
    rollCheck
  } = useDice()

  const getSavingThrowModifier = (ability) => {
    const baseModifier =
      abilityModifiers.value[ability] ?? 0

    const isProficient =
      savingThrowProficiencies.value.includes(ability)

    return (
      baseModifier +
      (isProficient ? proficiencyBonus.value : 0)
    )
  }

  const hasSavingThrowDisadvantage = (ability) => {
    if (ability === 'strength') {
      return strengthDisadvantage.value
    }

    if (ability === 'dexterity') {
      return dexterityDisadvantage.value
    }

    return false
  }

  const rollSavingThrow = (ability) => {
    const modifier =
      getSavingThrowModifier(ability)

    const hasDisadvantage =
      hasSavingThrowDisadvantage(ability)

    return rollCheck(
      modifier,
      hasDisadvantage
        ? 'disadvantage'
        : 'normal'
    )
  }

  const isSavingThrowProficient = (ability) => {
    return savingThrowProficiencies.value.includes(
      ability
    )
  }

  return {
    savingThrowProficiencies,
    proficiencyBonus,
    getSavingThrowModifier,
    isSavingThrowProficient,
    hasSavingThrowDisadvantage,
    rollSavingThrow
  }
}