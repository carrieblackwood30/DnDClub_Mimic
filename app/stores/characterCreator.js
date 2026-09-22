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
  const spellbookSpellIds = ref([])
  const preparedSpellIds = ref([])
  const knownSpellIds = ref([])
  const spellSlots = ref([])
  const knownCantripIds = ref([])

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

  const canLearnCantrip = (limit, spellId) => {
    if (knownCantripIds.value.includes(spellId)) {
      return false
    }

    return knownCantripIds.value.length < limit
  }

  const learnCantrip = (spellId, limit) => {
    if (!canLearnCantrip(limit, spellId)) {
      return false
    }

    knownCantripIds.value.push(spellId)

    return true
  }

  const forgetCantrip = (spellId) => {
    knownCantripIds.value =
      knownCantripIds.value.filter(
        id => id !== spellId
      )
  }

  const knowsCantrip = (spellId) => {
    return knownCantripIds.value.includes(spellId)
  }

  const learnSpell = (spellId) => {
    if (spellbookSpellIds.value.includes(spellId)) {
      return
    }

    spellbookSpellIds.value.push(spellId)
  }

  const forgetSpell = (spellId) => {
    spellbookSpellIds.value =
      spellbookSpellIds.value.filter(
        id => id !== spellId
      )

    preparedSpellIds.value =
      preparedSpellIds.value.filter(
        id => id !== spellId
      )
  }

  const learnKnownSpell = (spellId) => {
    if (knownSpellIds.value.includes(spellId)) {
      return
    }

    knownSpellIds.value.push(spellId)
  }

  const forgetKnownSpell = (spellId) => {
    knownSpellIds.value =
      knownSpellIds.value.filter(
        id => id !== spellId
      )
  }

  const knowsSpell = (spellId) => {
    return knownSpellIds.value.includes(spellId)
  }

  const prepareSpell = (spellId) => {
    if (preparedSpellIds.value.includes(spellId)) {
      return
    }

    preparedSpellIds.value.push(spellId)
  }

  const unprepareSpell = (spellId) => {
    preparedSpellIds.value =
      preparedSpellIds.value.filter(
        id => id !== spellId
      )
  }

  const hasSpell = (spellId) => {
    return spellbookSpellIds.value.includes(spellId)
  }

  const isSpellPrepared = (spellId) => {
    return preparedSpellIds.value.includes(spellId)
  }

  const setSpellSlots = (value) => {
    spellSlots.value = value
  }

  const createCharacter = (finalAbilityScores = null) => {
     return {
      name: name.value,
      level: level.value,
      raceId: raceId.value,
      subraceId: subraceId.value,
      classId: classId.value,
      subclassId: subclassId.value,
      armorId: armorId.value,
      shieldId: shieldId.value,
      weaponId: weaponId.value,
      weaponAbility: weaponAbility.value,
      backgroundId: backgroundId.value,
      baseAbilityScores: {
        ...abilityScores
      },
      abilityScores: {
        ...(finalAbilityScores ?? abilityScores)
      },
      selectedSkills: [
        ...selectedSkills.value
      ],
      spellbookSpellIds: [
        ...spellbookSpellIds.value
      ],
      knownSpellIds: [
        ...knownSpellIds.value
      ],
      preparedSpellIds: [
        ...preparedSpellIds.value
      ],
      spellSlots: [
        ...spellSlots.value
      ],
      knownCantripIds: [
        ...knownCantripIds.value
      ]
    }
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
    weaponId,
    weaponAbility,
    backgroundId,
    selectedSkills,
    spellbookSpellIds,
    preparedSpellIds,
    spellSlots,
    knownCantripIds,
    abilityScores,
    setAbilityScore,
    setLevel,
    setArmor,
    setShield,
    setWeapon,
    setWeaponAbility,
    toggleSkill,
    canLearnCantrip,
    learnCantrip,
    forgetCantrip,
    knowsCantrip,
    learnSpell,
    forgetSpell,
    prepareSpell,
    unprepareSpell,
    hasSpell,
    isSpellPrepared,
    setSpellSlots,
    createCharacter,
    knownSpellIds,
    learnKnownSpell,
    forgetKnownSpell,
    knowsSpell,
  }
})