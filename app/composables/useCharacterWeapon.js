import { computed } from 'vue'
import { weapons } from '~/data/weapons'

export const useCharacterWeapon = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    abilityModifiers
  } = useCharacterStats()

  const {
    proficiencyBonus
  } = useCharacterProficiency()

  const {
    proficiencies
  } = useCharacterClass()

  const weapon = computed(() => {
    if (!characterCreator.weaponId) {
      return null
    }

    return weapons.find(
      item => item.id === characterCreator.weaponId
    ) ?? null
  })

  const hasWeapon = computed(() => {
    return weapon.value !== null
  })

  const hasWeaponProficiency = computed(() => {
    if (!weapon.value || !proficiencies.value) {
      return false
    }

    const weaponProficiencies =
      proficiencies.value.weapons ?? []

    return (
      weaponProficiencies.includes(weapon.value.category) ||
      weaponProficiencies.includes(weapon.value.id)
    )
  })

  const attackAbility = computed(() => {
    if (!weapon.value) {
      return null
    }

    if (weapon.value.properties?.includes('finesse')) {
      return (
        characterCreator.weaponAbility ||
        weapon.value.ability
      )
    }

    return weapon.value.ability
  })

  const attackAbilityModifier = computed(() => {
    if (!attackAbility.value) {
      return 0
    }

    return abilityModifiers.value[
      attackAbility.value
    ] ?? 0
  })

  const attackModifier = computed(() => {
    return (
      attackAbilityModifier.value +
      (hasWeaponProficiency.value
        ? proficiencyBonus.value
        : 0)
    )
  })

  const damageModifier = computed(() => {
    return attackAbilityModifier.value
  })

  return {
    weapon,
    hasWeapon,

    hasWeaponProficiency,

    attackAbility,
    attackAbilityModifier,

    attackModifier,
    damageModifier
  }
}