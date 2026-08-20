import { computed } from 'vue'

export const useCharacterRace = () => {
  const characterCreator = useCharacterCreatorStore()
  const racesStore = useRacesStore()

  const race = computed(() => {
    if (!characterCreator.raceId) {
      return null
    }

    return racesStore.getRaceById(characterCreator.raceId)
  })

  const subraces = computed(() => {
    return race.value?.subraces ?? []
  })

  const subrace = computed(() => {
    if (!characterCreator.subraceId) {
      return null
    }

    return subraces.value.find(
      item => item.id === characterCreator.subraceId
    ) ?? null
  })

  return {
    race,
    subraces,
    subrace
  }
}