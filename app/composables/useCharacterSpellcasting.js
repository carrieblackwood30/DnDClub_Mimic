import { computed } from 'vue'

export const useCharacterSpellcasting = () => {
  const {
    spellcasting: classSpellcasting
  } = useCharacterClass()

  const {
    abilityModifiers
  } = useCharacterStats()

  const {
    proficiencyBonus
  } = useCharacterProficiency()

  const spellcasting = computed(() => {
    return classSpellcasting.value
  })

  const spellcastingAbility = computed(() => {
    return spellcasting.value?.ability ?? null
  })

  const spellcastingAbilityModifier = computed(() => {
    if (!spellcastingAbility.value) {
      return 0
    }

    return (
      abilityModifiers.value[
        spellcastingAbility.value
      ] ?? 0
    )
  })

  const spellAttackBonus = computed(() => {
    return (
      spellcastingAbilityModifier.value +
      proficiencyBonus.value
    )
  })

  const spellSaveDC = computed(() => {
    return (
      8 +
      proficiencyBonus.value +
      spellcastingAbilityModifier.value
    )
  })

  return {
    spellcasting,
    spellcastingAbility,
    spellcastingAbilityModifier,
    spellAttackBonus,
    spellSaveDC
  }
}