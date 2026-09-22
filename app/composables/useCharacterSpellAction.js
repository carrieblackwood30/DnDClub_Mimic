import { useCharacterSpellcasting } from '~/composables/useCharacterSpellcasting'
import { useCharacterSpellSlots } from '~/composables/useCharacterSpellSlots'

export const useCharacterSpellAction = () => {
  const {
    canCastSpell
  } = useCharacterSpellcasting()

  const {
    useSlot
  } = useCharacterSpellSlots()

  const castSpell = (spell) => {
    if (!canCastSpell(spell)) {
      return false
    }

    if (spell.level === 0) {
      return true
    }

    return useSlot(spell.level)
  }

  return {
    castSpell
  }
}