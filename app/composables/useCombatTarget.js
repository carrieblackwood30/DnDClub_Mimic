import { ref, computed } from 'vue'

export const useCombatTarget = (
  initialHP = 20,
  initialAC = 10
) => {
  const maxHP = ref(initialHP)
  const currentHP = ref(initialHP)
  const armorClass = ref(initialAC)

  const isAlive = computed(() => {
    return currentHP.value > 0
  })

  const isDefeated = computed(() => {
    return currentHP.value <= 0
  })

  const hpPercentage = computed(() => {
    if (maxHP.value <= 0) {
      return 0
    }

    return Math.max(
      0,
      Math.min(
        100,
        (currentHP.value / maxHP.value) * 100
      )
    )
  })

  const setHP = (value) => {
    const hp = Math.max(0, Number(value))

    maxHP.value = hp
    currentHP.value = hp
  }

  const setCurrentHP = (value) => {
    currentHP.value = Math.max(
      0,
      Math.min(
        maxHP.value,
        Number(value)
      )
    )
  }

  const setArmorClass = (value) => {
    armorClass.value = Math.max(
      0,
      Number(value)
    )
  }

  const takeDamage = (damage) => {
    const amount = Math.max(
      0,
      Number(damage)
    )

    currentHP.value = Math.max(
      0,
      currentHP.value - amount
    )

    return {
      damage: amount,
      currentHP: currentHP.value,
      maxHP: maxHP.value,
      defeated: isDefeated.value
    }
  }

  const heal = (amount) => {
    const value = Math.max(
      0,
      Number(amount)
    )

    currentHP.value = Math.min(
      maxHP.value,
      currentHP.value + value
    )

    return {
      healed: value,
      currentHP: currentHP.value,
      maxHP: maxHP.value
    }
  }

  const reset = () => {
    currentHP.value = maxHP.value
  }

  return {
    maxHP,
    currentHP,
    armorClass,
    isAlive,
    isDefeated,
    hpPercentage,
    setHP,
    setCurrentHP,
    setArmorClass,
    takeDamage,
    heal,
    reset
  }
}