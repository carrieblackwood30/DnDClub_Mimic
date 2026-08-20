import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useCharacterCreatorStore = defineStore('characterCreator', () => {
  const name = ref('')
  const level = ref(1)

  const raceId = ref(null)
  const subraceId = ref(null)

  const classId = ref(null)
  const subclassId = ref(null)

  const armorId = ref(null)
  const shieldId = ref(null)

  const weaponId = ref(null)
  const weaponAbility = ref(null)

  const backgroundId = ref(null)

  const selectedSkills = ref([])

  const abilityScores = reactive({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  })

  const setAbilityScore = (ability, value) => {
    abilityScores[ability] = value
  }

  const setLevel = (value) => {
    level.value = value
  }

  const setArmor = (id) => {
    armorId.value = id
  }

  const setShield = (id) => {
    shieldId.value = id
  }

  const setWeapon = (id) => {
    weaponId.value = id
  }

  const setWeaponAbility = (ability) => {
    weaponAbility.value = ability
  }

  const toggleSkill = (skillId) => {
    const index = selectedSkills.value.indexOf(skillId)

    if (index !== -1) {
      selectedSkills.value.splice(index, 1)
      return
    }

    selectedSkills.value.push(skillId)
  }

  return {
    name,
    level,

    raceId,
    subraceId,

    classId,
    subclassId,

    armorId,
    shieldId,

    backgroundId,

    abilityScores,

    setAbilityScore,
    setLevel,
    setArmor,
    setShield,
    setWeapon,
    weaponId,
    selectedSkills,
    toggleSkill,
    weaponAbility,
    setWeaponAbility
  }
})