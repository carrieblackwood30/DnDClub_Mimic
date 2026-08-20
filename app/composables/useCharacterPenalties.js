import { computed } from 'vue'

export const useCharacterPenalties = () => {
  const {
    armorPenalty
  } = useCharacterEquipment()

  const hasArmorPenalty = computed(() => {
    return armorPenalty.value
  })

  return {
    hasArmorPenalty
  }
}