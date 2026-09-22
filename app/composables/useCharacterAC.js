import { computed } from 'vue'

export const useCharacterAC = () => {
  const characterCreator = useCharacterCreatorStore()

  const armorsStore = useArmorsStore()
  const shieldsStore = useShieldsStore()

  const { abilityScores } = useCharacterStats()

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

  const shield = computed(() => {
    if (!characterCreator.shieldId) {
      return null
    }

    return shieldsStore.getShieldById(
      characterCreator.shieldId
    )
  })

  const dexterityModifier = computed(() => {
    const dexterity =
      abilityScores.value.dexterity ?? 10

    return Math.floor((dexterity - 10) / 2)
  })

  const armorClass = computed(() => {
    let ac = 10 + dexterityModifier.value

    if (armor.value) {
      ac = armor.value.baseAC

      if (armor.value.dexBonus) {
        let dexBonus = dexterityModifier.value

        if (
          armor.value.maxDexBonus !== null &&
          dexBonus > armor.value.maxDexBonus
        ) {
          dexBonus = armor.value.maxDexBonus
        }

        ac += dexBonus
      }
    }

    if (shield.value) {
      ac += shield.value.armorBonus
    }

    return ac
  })

  const meetsStrengthRequirement = computed(() => {
    if (!armor.value) {
      return true
    }

    const requirement =
      armor.value.strengthRequirement ?? 0

    const strength =
      abilityScores.value.strength ?? 10

    return strength >= requirement
  })

  return {
    armor,
    shield,
    dexterityModifier,
    armorClass,
    meetsStrengthRequirement
  }
}