import { defineStore } from 'pinia'
import { ref } from 'vue'
import { armors } from '~/data/armors'

export const useArmorsStore = defineStore('armors', () => {
  const allArmors = ref(armors)

  const getArmorById = (id) => {
    return allArmors.value.find(
      armor => armor.id === id
    ) ?? null
  }

  return {
    allArmors,
    getArmorById
  }
})