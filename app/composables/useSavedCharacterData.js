import { computed } from 'vue'
import { skills } from '~/data/skills'
import { weapons } from '~/data/weapons'
import { armors } from '~/data/armors'
import { shields } from '~/data/shields'

export const useSavedCharacterData = (character) => {
  const racesStore = useRacesStore()
  const classesStore = useClassesStore()

  const race = computed(() => {
    if (!character.value?.raceId) {
      return null
    }

    return racesStore.getRaceById(
      character.value.raceId
    )
  })

  const subrace = computed(() => {
    if (
      !character.value?.subraceId ||
      !race.value
    ) {
      return null
    }

    return race.value.subraces?.find(
      item => item.id === character.value.subraceId
    ) ?? null
  })

  const characterClass = computed(() => {
    if (!character.value?.classId) {
      return null
    }

    return classesStore.getClassById(
      character.value.classId
    )
  })

  const subclass = computed(() => {
    if (
      !character.value?.subclassId ||
      !characterClass.value
    ) {
      return null
    }

    return characterClass.value.subclasses?.find(
      item => item.id === character.value.subclassId
    ) ?? null
  })

  const armor = computed(() => {
    if (!character.value?.armorId) return null

    return armors.find(
      item => item.id === character.value.armorId
    ) ?? null
  })

  const shield = computed(() => {
    if (!character.value?.shieldId) return null

    return shields.find(
      item => item.id === character.value.shieldId
    ) ?? null
  })

  const weapon = computed(() => {
    if (!character.value?.weaponId) {
      return null
    }

    return weapons.find(
      item => item.id === character.value.weaponId
    ) ?? null
  })

  const selectedSkills = computed(() => {
    if (!character.value?.selectedSkills) {
      return []
    }

    return character.value.selectedSkills
      .map(skillId =>
        skills.find(skill => skill.id === skillId)
      )
      .filter(Boolean)
  })

  return {
    race,
    subrace,

    characterClass,
    subclass,

    armor,
    shield,
    weapon,

    selectedSkills
  }
}