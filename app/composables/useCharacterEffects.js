import { computed } from 'vue'

export const useCharacterEffects = () => {
  const {
    armorNonProficiency,
    shieldNonProficiency,
    armorStrengthRequirementFailed
  } = useCharacterEquipment()

  const strengthDisadvantage = computed(() => {
    return (
      armorNonProficiency.value ||
      shieldNonProficiency.value
    )
  })

  const dexterityDisadvantage = computed(() => {
    return (
      armorNonProficiency.value ||
      shieldNonProficiency.value
    )
  })

  const attackDisadvantage = computed(() => {
    return (
      armorNonProficiency.value ||
      shieldNonProficiency.value
    )
  })

  const spellcastingBlocked = computed(() => {
    return (
      armorNonProficiency.value ||
      shieldNonProficiency.value
    )
  })

  return {
    armorNonProficiency,
    shieldNonProficiency,
    armorStrengthRequirementFailed,
    strengthDisadvantage,
    dexterityDisadvantage,
    attackDisadvantage,
    spellcastingBlocked
  }
}