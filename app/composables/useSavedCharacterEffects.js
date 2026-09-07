import { computed } from 'vue'

export const useSavedCharacterEffects = (
  character,
  characterClass
) => {
  const armorStore = useArmorsStore()

  /*
   * Проверка владения бронёй
   */
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

  /*
   * Проверка владения щитом
   */
  const shieldPenalty = computed(() => {
    const shieldId = character.value?.shieldId

    if (!shieldId || !characterClass.value) {
      return false
    }

    const hasShieldProficiency =
      characterClass.value.proficiencies?.shields ?? false

    return !hasShieldProficiency
  })

  /*
   * Есть ли вообще проблемы с экипировкой
   */
  const hasEquipmentPenalty = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  /*
   * Экипировка без владения
   * мешает физическим проверкам.
   */
  const strengthDisadvantage = computed(() => {
    return armorPenalty.value
  })

  const dexterityDisadvantage = computed(() => {
    return armorPenalty.value
  })

  /*
   * Атаки при проблемах с экипировкой
   */
  const attackDisadvantage = computed(() => {
    return armorPenalty.value
  })

  /*
   * Пока оставляем существующую
   * игровую логику блокировки.
   */
  const spellcastingBlocked = computed(() => {
    return (
      armorPenalty.value ||
      shieldPenalty.value
    )
  })

  /*
   * Универсальное определение режима броска.
   *
   * Advantage + Disadvantage
   * взаимно уничтожаются.
   */
  const getRollMode = ({
    advantage = false,
    disadvantage = false
  } = {}) => {
    if (
      advantage &&
      disadvantage
    ) {
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

  /*
   * Режим проверки характеристики
   */
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

  /*
   * Режим атаки
   */
  const getAttackMode = ({
    advantage = false
  } = {}) => {
    return getRollMode({
      advantage,
      disadvantage:
        attackDisadvantage.value
    })
  }

  /*
   * Универсальный режим для спасброска.
   *
   * Пока здесь нет специальных эффектов,
   * поэтому передаём advantage/disadvantage
   * напрямую.
   */
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