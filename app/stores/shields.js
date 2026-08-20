import { defineStore } from 'pinia'
import { ref } from 'vue'
import { shields } from '~/data/shields'

export const useShieldsStore = defineStore('shields', () => {
  const allShields = ref(shields)

  const getShieldById = (id) => {
    return allShields.value.find(
      shield => shield.id === id
    ) ?? null
  }

  return {
    allShields,
    getShieldById
  }
})