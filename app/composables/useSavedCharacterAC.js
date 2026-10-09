import { computed } from 'vue'

import {
  getCharacterArmorClass
} from '~/domain/character/armorClassRules'

export const useSavedCharacterAC = (
  character,
  armor,
  shield
) => {
  const armorClass = computed(() => {
    const value = character.value

    if (!value) {
      return 10
    }

    return getCharacterArmorClass({
      classId:
        value.classId,

      subclassId:
        value.subclassId,

      level:
        value.level,

      abilityScores:
        value.abilityScores ?? {},

      armor:
        armor.value,

      shield:
        shield.value,

      classChoices:
        value.classChoices ?? {}
    })
  })

  return {
    armorClass
  }
}