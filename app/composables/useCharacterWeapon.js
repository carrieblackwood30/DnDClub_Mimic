import { computed } from 'vue'
import { weapons } from '~/data/weapons'

export const useCharacterWeapon = () => {
  const characterCreator = useCharacterCreatorStore()

  const { abilityModifiers } = useCharacterStats()
  const { proficiencyBonus } = useCharacterProficiency()
  const { proficiencies } = useCharacterClass()

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

  const isFinesse = computed(() => {
    return weapon.value?.properties?.includes('finesse') ?? false
  })

  const isRanged = computed(() => {
    return weapon.value?.type === 'ranged'
  })

  const isThrown = computed(() => {
    return weapon.value?.properties?.includes('thrown') ?? false
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

    if (isFinesse.value) {
      const selectedAbility = characterCreator.weaponAbility

      if (
        selectedAbility === 'strength' ||
        selectedAbility === 'dexterity'
      ) {
        return selectedAbility
      }
    }

    return weapon.value.ability
  })

  const attackAbilityModifier = computed(() => {
    if (!attackAbility.value) {
      return 0
    }

    return abilityModifiers.value[attackAbility.value] ?? 0
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
    isFinesse,
    isRanged,
    isThrown,
    hasWeaponProficiency,
    attackAbility,
    attackAbilityModifier,
    attackModifier,
    damageModifier
  }
}