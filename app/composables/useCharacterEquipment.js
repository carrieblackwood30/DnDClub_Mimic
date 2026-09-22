import { computed } from 'vue'

export const useCharacterEquipment = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    armor,
    hasArmorProficiency,
    meetsStrengthRequirement
  } = useCharacterArmor()

  const {
    shield,
    hasShieldProficiency
  } = useCharacterShield()

  const hasArmor = computed(() => {
    return Boolean(characterCreator.armorId)
  })

  const hasShield = computed(() => {
    return Boolean(characterCreator.shieldId)
  })

  const armorNonProficiency = computed(() => {
    return hasArmor.value &&
      !hasArmorProficiency.value
  })

  const shieldNonProficiency = computed(() => {
    return hasShield.value &&
      !hasShieldProficiency.value
  })

  const armorStrengthRequirementFailed = computed(() => {
    return hasArmor.value &&
      !meetsStrengthRequirement.value
  })

  return {
    armor,
    shield,
    hasArmor,
    hasShield,
    hasArmorProficiency,
    hasShieldProficiency,
    meetsStrengthRequirement,
    armorNonProficiency,
    shieldNonProficiency,
    armorStrengthRequirementFailed
  }
}