import { computed } from 'vue'
import {
  getAbilityModifiers,
  getProficiencyBonus
} from '~/domain/character/statRules'

export const useSavedCharacterStats = (character) => {
  const abilityModifiers = computed(() => {
    return getAbilityModifiers(
      character.value?.abilityScores ?? {}
    )
  })

  const proficiencyBonus = computed(() => {
    return getProficiencyBonus(
      character.value?.level
    )
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