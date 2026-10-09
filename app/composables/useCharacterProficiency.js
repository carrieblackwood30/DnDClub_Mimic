import { computed } from 'vue'
import {
  getProficiencyBonus
} from '~/domain/character/statRules'

export const useCharacterProficiency = () => {
  const characterCreator = useCharacterCreatorStore()

  const proficiencyBonus = computed(() => {
    return getProficiencyBonus(
      characterCreator.level
    )
  })

  return {
    proficiencyBonus
  }
}