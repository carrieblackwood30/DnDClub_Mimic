import { defineStore } from 'pinia'
import { ref } from 'vue'

import { races } from '~/data/races'

export const useRacesStore = defineStore('races', () => {
  const allRaces = ref(races)

  const getRaceById = (id) => {
    return allRaces.value.find(race => race.id === id) ?? null
  }

  return {
    allRaces,
    getRaceById
  }
})