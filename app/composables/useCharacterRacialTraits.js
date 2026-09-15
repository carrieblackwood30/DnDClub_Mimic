import { computed } from 'vue'

export const useCharacterRacialTraits = () => {
  const { race, subrace } = useCharacterRace()

  const racialTraits = computed(() => {
    const traits = []

    if (race.value?.traits) {
      traits.push(...race.value.traits)
    }

    if (subrace.value?.traits) {
      traits.push(...subrace.value.traits)
    }

    return traits
  })

  const hasTrait = (type) => {
    return racialTraits.value.some(
      trait => trait.type === type
    )
  }

  const getTraitsByType = (type) => {
    return racialTraits.value.filter(
      trait => trait.type === type
    )
  }

  const getTrait = (id) => {
    return racialTraits.value.find(
      trait => trait.id === id
    ) ?? null
  }

  return {
    racialTraits,
    hasTrait,
    getTraitsByType,
    getTrait
  }
}