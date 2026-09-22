import { computed } from 'vue'

export const useSpellSlots = (currentSlots, maxSlots) => {
  const slots = computed(() => {
    return currentSlots.value ?? []
  })

  const getCurrentSlotCount = (level) => {
    if (level < 1) {
      return 0
    }

    return slots.value[level - 1] ?? 0
  }

  const getMaxSlotCount = (level) => {
    if (level < 1) {
      return 0
    }

    return maxSlots.value?.[level - 1] ?? 0
  }

  const canUseSlot = (level) => {
    return getCurrentSlotCount(level) > 0
  }

  const useSlot = (level) => {
    if (!canUseSlot(level)) {
      return false
    }

    const index = level - 1
    const nextSlots = [...slots.value]

    nextSlots[index] = Math.max(
      0,
      (nextSlots[index] ?? 0) - 1
    )

    currentSlots.value = nextSlots

    return true
  }

  const restoreSlot = (level) => {
    const max = getMaxSlotCount(level)

    if (max <= 0) {
      return false
    }

    const current = getCurrentSlotCount(level)

    if (current >= max) {
      return false
    }

    const index = level - 1
    const nextSlots = [...slots.value]

    nextSlots[index] = current + 1

    currentSlots.value = nextSlots

    return true
  }

  const restoreAllSlots = () => {
    currentSlots.value = [
      ...(maxSlots.value ?? [])
    ]

    return true
  }

  const hasAnySlot = computed(() => {
    return slots.value.some(
      count => count > 0
    )
  })

  return {
    slots,
    getCurrentSlotCount,
    getMaxSlotCount,
    canUseSlot,
    useSlot,
    restoreSlot,
    restoreAllSlots,
    hasAnySlot
  }
}