import { computed } from 'vue'

export const useCharacterAttacks = () => {
  const {
    weapon,
    hasWeapon,
    hasWeaponProficiency,
    attackAbility,
    attackModifier,
    damageModifier
  } = useCharacterWeapon()

  const attack = computed(() => {
    if (!hasWeapon.value) {
      return null
    }

    return {
      weapon: weapon.value,

      attackAbility: attackAbility.value,

      attackModifier: attackModifier.value,

      damageModifier: damageModifier.value,

      hasProficiency: hasWeaponProficiency.value
    }
  })

  return {
    attack,
    hasWeapon
  }
}