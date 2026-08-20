import { computed } from 'vue'

export const useCharacterProficiency = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    savingThrowProficiencies
  } = useCharacterClass()

  const proficiencyBonus = computed(() => {
    return Math.floor(
      (characterCreator.level - 1) / 4
    ) + 2
  })

  const hasSavingThrowProficiency = (ability) => {
    return savingThrowProficiencies.value.includes(
      ability
    )
  }

  const getProficiencyBonus = (isProficient) => {
    return isProficient
      ? proficiencyBonus.value
      : 0
  }

  return {
    proficiencyBonus,
    hasSavingThrowProficiency,
    getProficiencyBonus
  }
}