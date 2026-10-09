import { computed } from 'vue'

import {
  getAbilityModifier
} from '~/domain/character/statRules'

import {
  getCharacterArmorClass
} from '~/domain/character/armorClassRules'


export const useCharacterAC = () => {
  const characterCreator =
    useCharacterCreatorStore()

  const armorsStore =
    useArmorsStore()

  const shieldsStore =
    useShieldsStore()

  const { abilityScores } =
    useCharacterStats()

  const armor = computed(() => {
    if (!characterCreator.armorId) {
      return null
    }

    return (
      armorsStore.allArmors.find(
        item =>
          item.id ===
          characterCreator.armorId
      ) ?? null
    )
  })

  const shield = computed(() => {
    if (!characterCreator.shieldId) {
      return null
    }

    return shieldsStore.getShieldById(
      characterCreator.shieldId
    )
  })

  const dexterityModifier = computed(() => {
    return getAbilityModifier(
      abilityScores.value.dexterity
    )
  })

  const armorClass = computed(() => {
    return getCharacterArmorClass({
      classId:
        characterCreator.classId,

      subclassId:
        characterCreator.subclassId,

      level:
        characterCreator.level,

      abilityScores:
        abilityScores.value,

      armor:
        armor.value,

      shield:
        shield.value,

      classChoices:
        characterCreator.classChoices ?? {}
    })
  })

  const meetsStrengthRequirement = computed(() => {
    if (!armor.value) {
      return true
    }

    const requirement =
      armor.value.strengthRequirement ?? 0

    const strength =
      abilityScores.value.strength ?? 10

    return strength >= requirement
  })

  return {
    armor,
    shield,
    dexterityModifier,
    armorClass,
    meetsStrengthRequirement
  }
}