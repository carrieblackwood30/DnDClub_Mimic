import { computed, isRef } from 'vue'

import { armors } from '~/data/armors'
import { shields } from '~/data/shields'

import {
  getCharacterArmorClass
} from '~/domain/character/armorClassRules'

export const useSavedCharacter = (character) => {
  const racesStore = useRacesStore()
  const classesStore = useClassesStore()

  const characterValue = computed(() => {
    return isRef(character)
      ? character.value
      : character
  })

  const race = computed(() => {
    const value = characterValue.value

    if (!value?.raceId) {
      return null
    }

    return racesStore.getRaceById(
      value.raceId
    )
  })

  const subrace = computed(() => {
    const value = characterValue.value

    if (!race.value || !value?.subraceId) {
      return null
    }

    return (
      race.value.subraces?.find(
        item => item.id === value.subraceId
      ) ?? null
    )
  })

  const characterClass = computed(() => {
    const value = characterValue.value

    if (!value?.classId) {
      return null
    }

    return classesStore.getClassById(
      value.classId
    )
  })

  const subclass = computed(() => {
    const value = characterValue.value

    if (!characterClass.value || !value?.subclassId) {
      return null
    }

    return (
      characterClass.value.subclasses?.find(
        item => item.id === value.subclassId
      ) ?? null
    )
  })

  const armor = computed(() => {
    const armorId = characterValue.value?.armorId

    if (!armorId) {
      return null
    }

    return (
      armors.find(
        item => item.id === armorId
      ) ?? null
    )
  })

  const shield = computed(() => {
    const shieldId = characterValue.value?.shieldId

    if (!shieldId) {
      return null
    }

    return (
      shields.find(
        item => item.id === shieldId
      ) ?? null
    )
  })

  const armorClass = computed(() => {
    const value = characterValue.value

    if (!value) {
      return 10
    }

    return getCharacterArmorClass({
      classId: value.classId,
      subclassId: value.subclassId,
      level: value.level,
      abilityScores: value.abilityScores ?? {},
      armor: armor.value,
      shield: shield.value,
      classChoices: value.classChoices ?? {}
    })
  })

  return {
    race,
    subrace,
    characterClass,
    subclass,
    armor,
    shield,
    armorClass
  }
}