import { computed } from 'vue'

export const useCharacterArmor = () => {
  const characterCreator = useCharacterCreatorStore()
  const armorsStore = useArmorsStore()

  const {
    characterClass
  } = useCharacterClass()

  const armor = computed(() => {
    if (!characterCreator.armorId) {
      return null
    }

    return (
      armorsStore.allArmors.find(
        item => item.id === characterCreator.armorId
      ) ?? null
    )
  })

  const armorType = computed(() => {
    return armor.value?.type ?? null
  })

  const hasArmorProficiency = computed(() => {
    if (!armorType.value) {
      return true
    }

    return (
      characterClass.value?.proficiencies?.armor
        ?.includes(armorType.value) ?? false
    )
  })

  return {
    armor,
    armorType,
    hasArmorProficiency
  }
}