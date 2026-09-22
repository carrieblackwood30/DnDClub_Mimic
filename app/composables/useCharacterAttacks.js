import { computed } from 'vue'

export const useCharacterAttacks = () => {
  const {
    weapon,
    hasWeapon,
    isFinesse,
    isRanged,
    isThrown,
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
      ability: attackAbility.value,
      attackModifier: attackModifier.value,
      damageModifier: damageModifier.value,
      hasProficiency: hasWeaponProficiency.value,
      isFinesse: isFinesse.value,
      isRanged: isRanged.value,
      isThrown: isThrown.value
    }
  })

  return {
    attack,
    hasWeapon
  }
}