import { computed } from 'vue'

export const useSavedCharacterSaves = (character, characterClass) => {
  const savingThrows = computed(() => {
    const abilityScores = character.value?.abilityScores ?? {}
    const proficientAbilities =
      characterClass.value?.savingThrowProficiencies ?? []

    const level = character.value?.level ?? 1
    const proficiencyBonus =
      Math.floor((level - 1) / 4) + 2

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
      const modifier = Math.floor((score - 10) / 2)
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