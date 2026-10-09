import { computed } from 'vue'
import {
  getAbilityModifier
} from '~/domain/character/statRules'
import {
  getMaxHitPoints
} from '~/domain/character/hitPointsRules'

export const useSavedCharacterHP = (character, characterClass) => {
const maxHitPoints = computed(() => {
  const characterValue =
    character.value

  const classValue =
    characterClass.value

  if (
    !characterValue ||
    !classValue
  ) {
    return 0
  }

  return getMaxHitPoints({
    level:
      characterValue.level,

    hitDie:
      classValue.hitDie,

    constitutionModifier:
      getAbilityModifier(
        characterValue
          .abilityScores
          ?.constitution ?? 10
      ),

    hitPointRolls:
      characterValue
        .hitPointRolls ?? {}
  })
})

  return {
    maxHitPoints
  }
}