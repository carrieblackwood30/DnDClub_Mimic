import { computed } from 'vue'

export const useSavedCharacterAC = (character, armor, shield) => {
  const armorClass = computed(() => {
    if (!character.value) return 10

    const dexterityScore =
      character.value.abilityScores?.dexterity ?? 10

    const dexterityModifier =
      Math.floor((dexterityScore - 10) / 2)

    let ac = 10

    if (armor.value) {
      ac = armor.value.baseAC

      if (armor.value.dexBonus) {
        if (armor.value.maxDexBonus !== null) {
          ac += Math.min(
            dexterityModifier,
            armor.value.maxDexBonus
          )
        } else {
          ac += dexterityModifier
        }
      }
    } else {
      ac += dexterityModifier
    }

    if (shield.value) {
      ac += shield.value.armorBonus ?? 0
    }

    return ac
  })

  return {
    armorClass
  }
}