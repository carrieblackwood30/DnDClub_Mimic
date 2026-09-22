import { computed } from 'vue'

export const useSavedCharacterEffects = (
  character,
  characterClass
) => {
  const armorStore = useArmorsStore()

  const armorPenalty = computed(() => {
    const armorId = character.value?.armorId

    if (!armorId || !characterClass.value) {
      return false
    }

    const armor = armorStore.getArmorById?.(armorId)

    if (!armor) {
      return false
    }

    const armorProficiencies =
      characterClass.value.proficiencies?.armor ?? []

    return !armorProficiencies.includes(armor.type)
  })

  const shieldPenalty = computed(() => {
    const shieldId = character.value?.shieldId

    if (!shieldId || !characterClass.value) {
      return false
    }

    const hasShieldProficiency =
      characterClass.value.proficiencies?.shields ?? false

    return !hasShieldProficiency
  })

  const hasEquipmentPenalty = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  const strengthDisadvantage = computed(() => {
    return armorPenalty.value
  })

  const dexterityDisadvantage = computed(() => {
    return armorPenalty.value
  })

  const attackDisadvantage = computed(() => {
    return armorPenalty.value
  })

  const spellcastingBlocked = computed(() => {
    return armorPenalty.value
  })

  const getRollMode = ({
    advantage = false,
    disadvantage = false
  } = {}) => {
    if (advantage && disadvantage) {
      return 'normal'
    }

    if (advantage) {
      return 'advantage'
    }

    if (disadvantage) {
      return 'disadvantage'
    }

    return 'normal'
  }

  const getAbilityCheckMode = (
    ability,
    {
      advantage = false
    } = {}
  ) => {
    const equipmentDisadvantage =
      ability === 'strength' &&
      strengthDisadvantage.value

    const dexterityEquipmentDisadvantage =
      ability === 'dexterity' &&
      dexterityDisadvantage.value

    const disadvantage =
      equipmentDisadvantage ||
      dexterityEquipmentDisadvantage

    return getRollMode({
      advantage,
      disadvantage
    })
  }

  const getAttackMode = ({
    advantage = false
  } = {}) => {
    return getRollMode({
      advantage,
      disadvantage:
        attackDisadvantage.value
    })
  }

  const getSavingThrowMode = ({
    advantage = false,
    disadvantage = false
  } = {}) => {
    return getRollMode({
      advantage,
      disadvantage
    })
  }

  return {
    armorPenalty,
    shieldPenalty,
    hasEquipmentPenalty,
    strengthDisadvantage,
    dexterityDisadvantage,
    attackDisadvantage,
    spellcastingBlocked,
    getRollMode,
    getAbilityCheckMode,
    getAttackMode,
    getSavingThrowMode
  }
}