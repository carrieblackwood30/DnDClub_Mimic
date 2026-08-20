import { defineStore } from 'pinia'
import { ref } from 'vue'
import { skills } from '~/data/skills'

export const useSkillsStore = defineStore('skills', () => {
  const allSkills = ref(skills)

  const getSkillById = (id) => {
    return allSkills.value.find(
      skill => skill.id === id
    ) ?? null
  }

  return {
    allSkills,
    getSkillById
  }
})