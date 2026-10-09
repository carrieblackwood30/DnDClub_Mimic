import { computed } from 'vue'
import {
  getAbilityModifier,
  getProficiencyBonus
} from '~/domain/character/statRules'

export const useSavedCharacterSaves = (character, characterClass) => {
  const savingThrows = computed(() => {
    const abilityScores = character.value?.abilityScores ?? {}
    const proficientAbilities =
      characterClass.value?.savingThrowProficiencies ?? []

    const proficiencyBonus =
      getProficiencyBonus(
        character.value?.level
      )

    const abilities = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma'
    ]

    return abilities.map(ability => {
      const score = abilityScores[ability] ?? 10
      const modifier =
      getAbilityModifier(
        score
      )
      const isProficient = proficientAbilities.includes(ability)

      return {
        ability,
        modifier: modifier + (isProficient ? proficiencyBonus : 0),
        isProficient
      }
    })
  })

  return {
    savingThrows
  }
}