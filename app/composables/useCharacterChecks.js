import { useCharacterStats } from '~/composables/useCharacterStats'
import { useCharacterClass } from '~/composables/useCharacterClass'
import { useCharacterProficiency } from '~/composables/useCharacterProficiency'
import { useCharacterEffects } from '~/composables/useCharacterEffects'
import { useDice } from '~/composables/useDice'

export const useCharacterChecks = () => {
  const { abilityModifiers } = useCharacterStats()

  const { savingThrowProficiencies } = useCharacterClass()

  const { proficiencyBonus } = useCharacterProficiency()

  const {
    strengthDisadvantage,
    dexterityDisadvantage
  } = useCharacterEffects()

  const { rollCheck } = useDice()

  const getAbilityCheckModifier = (ability) => {
    return abilityModifiers.value[ability] ?? 0
  }

  const getSavingThrowModifier = (ability) => {
    const baseModifier =
      abilityModifiers.value[ability] ?? 0

    const isProficient =
      savingThrowProficiencies.value.includes(ability)

    return baseModifier +
      (isProficient ? proficiencyBonus.value : 0)
  }

  const hasAbilityCheckDisadvantage = (ability) => {
    if (ability === 'strength') {
      return strengthDisadvantage.value
    }

    if (ability === 'dexterity') {
      return dexterityDisadvantage.value
    }

    return false
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

  const rollAbilityCheck = (ability) => {
    const modifier = getAbilityCheckModifier(ability)

    const hasDisadvantage =
      hasAbilityCheckDisadvantage(ability)

    return rollCheck(
      modifier,
      hasDisadvantage ? 'disadvantage' : 'normal'
    )
  }

  const rollSavingThrow = (ability) => {
    const modifier = getSavingThrowModifier(ability)

    const hasDisadvantage =
      hasSavingThrowDisadvantage(ability)

    return rollCheck(
      modifier,
      hasDisadvantage ? 'disadvantage' : 'normal'
    )
  }

  return {
    getAbilityCheckModifier,
    getSavingThrowModifier,
    hasAbilityCheckDisadvantage,
    hasSavingThrowDisadvantage,
    rollAbilityCheck,
    rollSavingThrow
  }
}