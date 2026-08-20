import { computed } from 'vue'

export const useCharacterEquipment = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    armor,
    hasArmorProficiency
  } = useCharacterArmor()

  const {
    shield,
    hasShieldProficiency
  } = useCharacterShield()

  // Экипирована ли броня
  const hasArmor = computed(() => {
    return (
      characterCreator.armorId !== null &&
      characterCreator.armorId !== undefined &&
      characterCreator.armorId !== ''
    )
  })

  // Экипирован ли щит
  const hasShield = computed(() => {
    return (
      characterCreator.shieldId !== null &&
      characterCreator.shieldId !== undefined &&
      characterCreator.shieldId !== ''
    )
  })

  // Есть ли штраф из-за отсутствия владения бронёй
  const armorPenalty = computed(() => {
    if (!hasArmor.value) {
      return false
    }

    return !hasArmorProficiency.value
  })

  // Есть ли штраф из-за отсутствия владения щитом
  const shieldPenalty = computed(() => {
    if (!hasShield.value) {
      return false
    }

    return !hasShieldProficiency.value
  })

  // Есть ли вообще проблемы с экипировкой
  const hasEquipmentPenalty = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  return {
    armor,
    shield,

    hasArmor,
    hasShield,

    hasArmorProficiency,
    hasShieldProficiency,

    armorPenalty,
    shieldPenalty,

    hasEquipmentPenalty
  }
}