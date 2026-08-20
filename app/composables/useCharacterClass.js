import { computed } from 'vue'

export const useCharacterClass = () => {
  const characterCreator = useCharacterCreatorStore()
  const classesStore = useClassesStore()

  const characterClass = computed(() => {
    if (!characterCreator.classId) {
      return null
    }

    return classesStore.getClassById(
      characterCreator.classId
    )
  })

  const subclasses = computed(() => {
    return characterClass.value?.subclasses ?? []
  })

  const subclass = computed(() => {
    if (!characterCreator.subclassId) {
      return null
    }

    return subclasses.value.find(
      item => item.id === characterCreator.subclassId
    ) ?? null
  })

  const hitDie = computed(() => {
    return characterClass.value?.hitDie ?? null
  })

  const savingThrowProficiencies = computed(() => {
    return characterClass.value?.savingThrowProficiencies ?? []
  })

  const skillChoices = computed(() => {
    return characterClass.value?.skillChoices ?? null
  })

  const proficiencies = computed(() => {
    return characterClass.value?.proficiencies ?? null
  })

  const spellcasting = computed(() => {
    return characterClass.value?.spellcasting ?? null
  })

  return {
    characterClass,
    subclasses,
    subclass,

    hitDie,
    savingThrowProficiencies,
    skillChoices,
    proficiencies,
    spellcasting
  }
}