import { computed } from 'vue'

export const useSavedCharacter = (character) => {
  const racesStore = useRacesStore()
  const classesStore = useClassesStore()

  const race = computed(() => {
    if (!character?.raceId) {
      return null
    }

    return racesStore.getRaceById(character.raceId)
  })

  const subrace = computed(() => {
    if (!race.value || !character?.subraceId) {
      return null
    }

    return (
      race.value.subraces?.find(
        item => item.id === character.subraceId
      ) ?? null
    )
  })

  const characterClass = computed(() => {
    if (!character?.classId) {
      return null
    }

    return classesStore.getClassById(character.classId)
  })

  const subclass = computed(() => {
    if (!characterClass.value || !character?.subclassId) {
      return null
    }

    return (
      characterClass.value.subclasses?.find(
        item => item.id === character.subclassId
      ) ?? null
    )
  })

  return {
    race,
    subrace,
    characterClass,
    subclass
  }
}