import { computed } from 'vue'
import {
  getMaxHitPoints
} from '~/domain/character/hitPointsRules'

export const useCharacterHP = () => {
  const characterCreator = useCharacterCreatorStore()

  const { hitDie } = useCharacterClass()
  const { abilityModifiers } = useCharacterStats()

  const constitutionModifier = computed(() => {
    return abilityModifiers.value.constitution
  })

  const maxHitPoints = computed(() => {
    return getMaxHitPoints({
      level: characterCreator.level,
      hitDie: hitDie.value,
      constitutionModifier:
        constitutionModifier.value
    })
  })

  return {
    maxHitPoints
  }
}