import { computed } from 'vue'

export const useSavedCharacterStats = (character) => {
  const abilityModifiers = computed(() => {
    const abilityScores = character.value?.abilityScores

    if (!abilityScores) {
      return {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      }
    }

    const modifiers = {}

    for (const [ability, score] of Object.entries(abilityScores)) {
      modifiers[ability] = Math.floor((score - 10) / 2)
    }

    return modifiers
  })

  const proficiencyBonus = computed(() => {
    const level = character.value?.level ?? 1

    return Math.floor((level - 1) / 4) + 2
  })

  const getSkillModifier = (skill) => {
    if (!skill) return 0

    const abilityModifier =
      abilityModifiers.value[skill.ability] ?? 0

    const isProficient =
      character.value?.selectedSkills?.includes(skill.id) ?? false

    return abilityModifier +
      (isProficient ? proficiencyBonus.value : 0)
  }

  return {
    abilityModifiers,
    proficiencyBonus,
    getSkillModifier
  }
}