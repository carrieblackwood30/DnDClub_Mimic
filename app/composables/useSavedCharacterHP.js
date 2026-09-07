import { computed } from 'vue'

export const useSavedCharacterHP = (character, characterClass) => {
  const maxHitPoints = computed(() => {
    if (!character.value || !characterClass.value) {
      return 0
    }

    const level = character.value.level ?? 1
    const hitDie = characterClass.value.hitDie ?? 0

    const constitutionScore =
      character.value.abilityScores?.constitution ?? 10

    const constitutionModifier =
      Math.floor((constitutionScore - 10) / 2)

    const hitPoints =
      level * (hitDie + constitutionModifier)

    return Math.max(hitPoints, level)
  })

  return {
    maxHitPoints
  }
}