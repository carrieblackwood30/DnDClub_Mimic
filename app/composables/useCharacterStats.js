import { computed } from 'vue'
import {
  getAbilityModifiers
} from '~/domain/character/statRules'

export const useCharacterStats = () => {
  const characterCreator = useCharacterCreatorStore()
  const {
    race,
    subrace
  } = useCharacterRace()

  const abilityScoreIncrease = computed(() => {
    const result = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    }

    const applyBonus = (bonus) => {
      if (!bonus) {
        return
      }

      for (const [ability, value] of Object.entries(bonus)) {
        if (ability in result) {
          result[ability] += value
        }
      }
    }

    applyBonus(race.value?.abilityScoreIncrease)
    applyBonus(subrace.value?.abilityScoreIncrease)

    return result
  })

  const abilityScores = computed(() => {
    const result = {}

    for (const [ability, value] of Object.entries(
      characterCreator.abilityScores
    )) {
      result[ability] = value + abilityScoreIncrease.value[ability]
    }

    return result
  })

  const abilityModifiers = computed(() => {
    return getAbilityModifiers(
      abilityScores.value
    )
  })

  return {
    abilityScoreIncrease,
    abilityScores,
    abilityModifiers
  }
}