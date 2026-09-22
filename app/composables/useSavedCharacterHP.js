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

    const firstLevelHP =
      Math.max(1, hitDie + constitutionModifier)

    if (level === 1) {
      return firstLevelHP
    }

    const hitDieAverage =
      Math.floor(hitDie / 2) + 1

    const hpPerLevel =
      Math.max(
        1,
        hitDieAverage + constitutionModifier
      )

    return (
      firstLevelHP +
      hpPerLevel * (level - 1)
    )
  })

  return {
    maxHitPoints
  }
}