import { computed } from 'vue'

export const useCharacterShield = () => {
  const characterCreator = useCharacterCreatorStore()
  const shieldsStore = useShieldsStore()

  const {
    characterClass
  } = useCharacterClass()

  const shield = computed(() => {
    if (!characterCreator.shieldId) {
      return null
    }

    return shieldsStore.getShieldById(
      characterCreator.shieldId
    )
  })

  const hasShieldProficiency = computed(() => {
    if (!shield.value) {
      return true
    }

    return characterClass.value?.proficiencies?.shields ?? false
  })

  return {
    shield,
    hasShieldProficiency
  }
}