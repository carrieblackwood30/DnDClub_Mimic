import { computed } from 'vue'

import { useCharacterCreatorStore } from '~/stores/characterCreator'
import { useCharacterSpellcasting } from '~/composables/useCharacterSpellcasting'
import { useSpellSlots } from '~/composables/useSpellSlots'

export const useCharacterSpellSlots = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    spellSlots: maxSpellSlots
  } = useCharacterSpellcasting()

  const currentSlots = computed({
    get: () => characterCreator.spellSlots,
    set: value => characterCreator.setSpellSlots(value)
  })

  const useSlots = useSpellSlots(
    currentSlots,
    maxSpellSlots
  )

  const initializeSpellSlots = () => {
    const maxSlots = maxSpellSlots.value

    if (!maxSlots?.length) {
      characterCreator.setSpellSlots([])
      return false
    }

    characterCreator.setSpellSlots([
      ...maxSlots
    ])

    return true
  }

  const hasInitializedSlots = computed(() => {
    return currentSlots.value.length > 0
  })

  return {
    currentSlots,
    maxSpellSlots,
    hasInitializedSlots,
    initializeSpellSlots,
    getCurrentSlotCount: useSlots.getCurrentSlotCount,
    getMaxSlotCount: useSlots.getMaxSlotCount,
    canUseSlot: useSlots.canUseSlot,
    useSlot: useSlots.useSlot,
    restoreSlot: useSlots.restoreSlot,
    restoreAllSlots: useSlots.restoreAllSlots,
    hasAnySlot: useSlots.hasAnySlot
  }
}