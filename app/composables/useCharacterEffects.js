import { computed } from 'vue'

export const useCharacterEffects = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    hasArmorProficiency
  } = useCharacterArmor()

  const {
    hasShieldProficiency
  } = useCharacterShield()

  // Нет владения надетой бронёй
  const armorPenalty = computed(() => {
    if (!characterCreator.armorId) {
      return false
    }

    return !hasArmorProficiency.value
  })

  // Нет владения надетым щитом
  const shieldPenalty = computed(() => {
    if (!characterCreator.shieldId) {
      return false
    }

    return !hasShieldProficiency.value
  })

  // Общий штраф от экипировки
  const hasEquipmentPenalty = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  const strengthDisadvantage = computed(() => {
    return hasEquipmentPenalty.value
  })

  const dexterityDisadvantage = computed(() => {
    return hasEquipmentPenalty.value
  })

  const attackDisadvantage = computed(() => {
    return hasEquipmentPenalty.value
  })

  // Блокировка заклинаний
  const spellcastingBlocked = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  return {
    armorPenalty,
    shieldPenalty,

    hasEquipmentPenalty,

    strengthDisadvantage,
    dexterityDisadvantage,

    attackDisadvantage,
    spellcastingBlocked
  }
}