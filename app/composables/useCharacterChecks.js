import { computed } from 'vue'

export const useCharacterChecks = () => {
  const {
    abilityModifiers
  } = useCharacterStats()

  const {
    savingThrowProficiencies
  } = useCharacterClass()

  const {
    proficiencyBonus
  } = useCharacterProficiency()

  const {
    strengthDisadvantage,
    dexterityDisadvantage
  } = useCharacterEffects()

  const {
    hasSavingThrowProficiency,
    getProficiencyBonus
  } = useCharacterProficiency()

  const getAbilityCheckModifier = (ability) => {
    return abilityModifiers.value[ability] ?? 0
  }

  const getSavingThrowModifier = (ability) => {
    const baseModifier =
      abilityModifiers.value[ability] ?? 0

    const isProficient =
      savingThrowProficiencies.value.includes(ability)

    return isProficient
      ? baseModifier + proficiencyBonus.value
      : baseModifier
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

  return {
    getAbilityCheckModifier,
    getSavingThrowModifier,

    hasAbilityCheckDisadvantage,
    hasSavingThrowDisadvantage
  }
}