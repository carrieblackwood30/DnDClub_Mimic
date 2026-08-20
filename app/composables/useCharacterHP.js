import { computed } from 'vue'

export const useCharacterHP = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    hitDie
  } = useCharacterClass()

  const {
    abilityModifiers
  } = useCharacterStats()

  const constitutionModifier = computed(() => {
    return abilityModifiers.value.constitution
  })

  const maxHitPoints = computed(() => {
    if (!hitDie.value) {
      return 0
    }

    const level = characterCreator.level
    const constitution = constitutionModifier.value

    // Первый уровень получает максимальное значение Hit Die
    const firstLevelHP = hitDie.value + constitution

    if (level === 1) {
      return Math.max(1, firstLevelHP)
    }

    // Среднее фиксированное значение Hit Die
    const hitDieAverage = Math.floor(hitDie.value / 2) + 1

    // HP за каждый следующий уровень
    const hpPerLevel = Math.max(
      1,
      hitDieAverage + constitution
    )

    return firstLevelHP + hpPerLevel * (level - 1)
  })

  return {
    maxHitPoints
  }
}