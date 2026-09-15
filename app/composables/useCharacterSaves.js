import { computed } from 'vue'

export const useCharacterSaves = () => {
  const {
    characterClass
  } = useCharacterClass()

  const {
    abilityModifiers
  } = useCharacterStats()

  const savingThrowProficiencies = computed(() => {
    return characterClass.value?.savingThrowProficiencies ?? []
  })

  const proficiencyBonus = computed(() => {
    const level = useCharacterCreatorStore().level

    return Math.floor(
      (level - 1) / 4
    ) + 2
  })

  const getSavingThrowModifier = (ability) => {
    const baseModifier =
      abilityModifiers.value[ability] ?? 0

    const isProficient =
      savingThrowProficiencies.value.includes(ability)

    return baseModifier +
      (isProficient ? proficiencyBonus.value : 0)
  }

  const isSavingThrowProficient = (ability) => {
    return savingThrowProficiencies.value.includes(ability)
  }

  return {
    savingThrowProficiencies,
    proficiencyBonus,
    getSavingThrowModifier,
    isSavingThrowProficient
  }
}