import { computed } from 'vue'

export const useCharacterProficiency = () => {
  const characterCreator = useCharacterCreatorStore()

  const proficiencyBonus = computed(() => {
    return Math.floor(
      (characterCreator.level - 1) / 4
    ) + 2
  })

  return {
    proficiencyBonus
  }
}