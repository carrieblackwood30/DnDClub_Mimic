import { defineStore } from 'pinia'
import { ref } from 'vue'

import { classes } from '~/data/classes'

export const useClassesStore = defineStore('classes', () => {
  const allClasses = ref(classes)

  const getClassById = (id) => {
    return allClasses.value.find(
      characterClass => characterClass.id === id
    ) ?? null
  }

  return {
    allClasses,
    getClassById
  }
})