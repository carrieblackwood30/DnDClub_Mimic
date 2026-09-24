import { computed } from 'vue'

import { spells } from '~/data/spells'
import {
  fullCasterSpellSlots,
  halfCasterSpellSlots,
  pactMagicSlots
} from '~/data/spellSlots'
import { spellcastingProgression } from '~/data/spellcastingProgression'
import { useCharacterCreatorStore } from '~/stores/characterCreator'
import { useCharacterStats } from '~/composables/useCharacterStats'
import { useClassesStore } from '~/stores/classes'

export const useCharacterSpellcasting = () => {
  const characterCreator = useCharacterCreatorStore()
  const classesStore = useClassesStore()
  const { abilityScores } = useCharacterStats()

  const characterClass = computed(() => {
    if (!characterCreator.classId) {
      return null
    }

    return classesStore.getClassById(
      characterCreator.classId
    )
  })

  const spellcasting = computed(() => {
    return characterClass.value?.spellcasting ?? null
  })

  const progression = computed(() => {
    return spellcastingProgression[
      characterCreator.classId
    ] ?? null
  })

  const canCastSpells = computed(() => {
    if (!spellcasting.value) {
      return false
    }

    return characterCreator.level >= (
      spellcasting.value.startsAtLevel ?? 1
    )
  })

  const spellcastingAbility = computed(() => {
    return spellcasting.value?.ability ?? null
  })

  const spellcastingAbilityScore = computed(() => {
    if (!spellcastingAbility.value) {
      return 0
    }

    return (
      abilityScores.value[
        spellcastingAbility.value
      ] ?? 0
    )
  })

  const spellcastingAbilityModifier = computed(() => {
    return Math.floor(
      (spellcastingAbilityScore.value - 10) / 2
    )
  })

  const proficiencyBonus = computed(() => {
    return (
      Math.floor(
        (characterCreator.level - 1) / 4
      ) + 2
    )
  })

  const spellSaveDC = computed(() => {
    if (!canCastSpells.value) {
      return null
    }

    return (
      8 +
      proficiencyBonus.value +
      spellcastingAbilityModifier.value
    )
  })

  const spellAttackBonus = computed(() => {
    if (!canCastSpells.value) {
      return null
    }

    return (
      proficiencyBonus.value +
      spellcastingAbilityModifier.value
    )
  })

  const spellSlots = computed(() => {
    if (!canCastSpells.value) {
      return []
    }

    const level = Math.min(
      Math.max(characterCreator.level, 1),
      20
    )

    const slotProgression =
      spellcasting.value?.slotProgression

    if (slotProgression === 'full-caster') {
      return fullCasterSpellSlots[level] ?? []
    }

    if (slotProgression === 'half-caster') {
      return halfCasterSpellSlots[level] ?? []
    }

    if (slotProgression === 'pact-magic') {
      const pact = pactMagicSlots[level]

      if (!pact || pact.slots === 0) {
        return []
      }

      return Array.from(
        { length: 9 },
        (_, index) =>
          index + 1 === pact.level
            ? pact.slots
            : 0
      )
    }

    return []
  })

  const highestSpellSlotLevel = computed(() => {
    const slots = spellSlots.value

    for (
      let index = slots.length - 1;
      index >= 0;
      index--
    ) {
      if (slots[index] > 0) {
        return index + 1
      }
    }

    return 0
  })

  const cantripsKnownLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    const cantripsKnown =
      progression.value?.cantripsKnown

    if (!cantripsKnown) {
      return 0
    }

    const index = Math.min(
      Math.max(characterCreator.level, 1),
      cantripsKnown.length
    ) - 1

    return cantripsKnown[index] ?? 0
  })

  const spellsKnownLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    const spellsKnown =
      progression.value?.spellsKnown

    if (!spellsKnown) {
      return null
    }

    const index = Math.min(
      Math.max(characterCreator.level, 1),
      spellsKnown.length
    ) - 1

    return spellsKnown[index] ?? 0
  })

  const preparedSpellLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    if (spellcasting.value?.type !== 'prepared') {
      return null
    }

    const formula =
      spellcasting.value?.preparation?.formula

    if (formula === 'ability-modifier-plus-level') {
      return Math.max(
        spellcasting.value.preparation.minimum ?? 1,
        spellcastingAbilityModifier.value +
        characterCreator.level
      )
    }

    if (
      formula ===
      'ability-modifier-plus-half-level'
    ) {
      return Math.max(
        spellcasting.value.preparation.minimum ?? 1,
        spellcastingAbilityModifier.value +
        Math.floor(characterCreator.level / 2)
      )
    }

    return null
  })

  const spellbookLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    const spellbook =
      progression.value?.spellbook

    if (!spellbook) {
      return null
    }

    return (
      spellbook.initialSpells +
      Math.max(
        0,
        characterCreator.level - 1
      ) * spellbook.spellsPerLevel
    )
  })

  const availableSpells = computed(() => {
    if (!canCastSpells.value) {
      return []
    }

    return spells.filter(spell => {
      if (
        !spell.classes.includes(
          characterCreator.classId
        )
      ) {
        return false
      }

      if (spell.level === 0) {
        return true
      }

      return (
        spell.level <=
        highestSpellSlotLevel.value
      )
    })
  })

  const availableCantrips = computed(() => {
    return availableSpells.value.filter(
      spell => spell.level === 0
    )
  })

  const availableLevelledSpells = computed(() => {
    return availableSpells.value.filter(
      spell => spell.level > 0
    )
  })

  const knownCantrips = computed(() => {
    return spells.filter(spell =>
      characterCreator.knownCantripIds.includes(
        spell.id
      )
    )
  })

  const knownSpells = computed(() => {
    return spells.filter(spell =>
      characterCreator.knownSpellIds.includes(
        spell.id
      )
    )
  })

  const spellbookSpells = computed(() => {
    return spells.filter(spell =>
      characterCreator.spellbookSpellIds.includes(
        spell.id
      )
    )
  })

  const preparedSpells = computed(() => {
    return spells.filter(spell =>
      characterCreator.preparedSpellIds.includes(
        spell.id
      )
    )
  })

  const preparedCantrips = computed(() => {
    return preparedSpells.value.filter(
      spell => spell.level === 0
    )
  })

  const preparedLevelledSpells = computed(() => {
    return preparedSpells.value.filter(
      spell => spell.level > 0
    )
  })

  const isCantripKnown = (spellId) => {
    return characterCreator.knowsCantrip(spellId)
  }

  const isSpellKnown = (spellId) => {
    return characterCreator.knowsSpell(spellId)
  }

  const isSpellInSpellbook = (spellId) => {
    return characterCreator.spellbookSpellIds.includes(
      spellId
    )
  }

  const isSpellPrepared = (spellId) => {
    return characterCreator.preparedSpellIds.includes(
      spellId
    )
  }

  const isSpellAvailable = (spell) => {
    return availableSpells.value.some(
      availableSpell =>
        availableSpell.id === spell.id
    )
  }

  const canLearnCantrip = (spell) => {
    if (!isSpellAvailable(spell)) {
      return false
    }

    if (spell.level !== 0) {
      return false
    }

    if (isCantripKnown(spell.id)) {
      return true
    }

    return (
      knownCantrips.value.length <
      cantripsKnownLimit.value
    )
  }

  const canLearnSpell = (spell) => {
    if (!isSpellAvailable(spell)) {
      return false
    }

    if (spell.level === 0) {
      return false
    }

    if (spellcasting.value?.type === 'known') {
      if (isSpellKnown(spell.id)) {
        return true
      }

      return (
        knownSpells.value.length <
        spellsKnownLimit.value
      )
    }

    if (
      spellcasting.value?.spellbook?.enabled === true
    ) {
      if (isSpellInSpellbook(spell.id)) {
        return true
      }

      return (
        spellbookSpells.value.length <
        spellbookLimit.value
      )
    }

    return false
  }

  const canPrepareSpell = (spell) => {
    if (!isSpellAvailable(spell)) {
      return false
    }

    if (spell.level === 0) {
      return false
    }

    if (spellcasting.value?.type !== 'prepared') {
      return false
    }

    if (
      spellcasting.value?.spellbook?.enabled === true &&
      !isSpellInSpellbook(spell.id)
    ) {
      return false
    }

    if (isSpellPrepared(spell.id)) {
      return true
    }

    if (preparedSpellLimit.value === null) {
      return true
    }

    return (
      preparedLevelledSpells.value.length <
      preparedSpellLimit.value
    )
  }

  const learnCantrip = (spell) => {
    if (!canLearnCantrip(spell)) {
      return false
    }

    characterCreator.learnCantrip(
      spell.id,
      cantripsKnownLimit.value
    )

    return true
  }

  const forgetCantrip = (spell) => {
    if (!isCantripKnown(spell.id)) {
      return false
    }

    characterCreator.forgetCantrip(spell.id)

    return true
  }

  const learnSpell = (spell) => {
    if (!canLearnSpell(spell)) {
      return false
    }

    if (spellcasting.value?.type === 'known') {
      characterCreator.learnKnownSpell(
        spell.id
      )

      return true
    }

    if (
      spellcasting.value?.spellbook?.enabled === true
    ) {
      characterCreator.learnSpell(
        spell.id
      )

      return true
    }

    return false
  }

  const forgetSpell = (spell) => {
    if (spellcasting.value?.type === 'known') {
      if (!isSpellKnown(spell.id)) {
        return false
      }

      characterCreator.forgetKnownSpell(
        spell.id
      )

      return true
    }

    if (
      spellcasting.value?.spellbook?.enabled === true
    ) {
      if (!isSpellInSpellbook(spell.id)) {
        return false
      }

      characterCreator.forgetSpell(
        spell.id
      )

      return true
    }

    return false
  }

  const prepareSpell = (spell) => {
    if (!canPrepareSpell(spell)) {
      return false
    }

    characterCreator.prepareSpell(
      spell.id
    )

    return true
  }

  const unprepareSpell = (spell) => {
    if (!isSpellPrepared(spell.id)) {
      return false
    }

    characterCreator.unprepareSpell(
      spell.id
    )

    return true
  }

const canCastSpell = (spell) => {
    if (!canCastSpells.value) {
      return false
    }

    if (spell.level === 0) {
      return isCantripKnown(spell.id)
    }

    const hasAvailableSlot =
      spellSlots.value[spell.level - 1] > 0

    if (!hasAvailableSlot) {
      return false
    }

    if (spellcasting.value?.type === 'known') {
      return isSpellKnown(spell.id)
    }

    if (spellcasting.value?.type === 'prepared') {
      return isSpellPrepared(spell.id)
    }

    if (spellcasting.value?.type === 'pact') {
      return isSpellKnown(spell.id)
    }

    return false
  }

  const canCastPreparedSpell = (spell) => {
    return canCastSpell(spell)
  }

  const initializeSpellbook = () => {
    if (!canCastSpells.value) {
      return false
    }

    if (
      spellcasting.value?.spellbook?.enabled !== true
    ) {
      return false
    }

    const cantripsToLearn =
      availableCantrips.value.slice(
        0,
        cantripsKnownLimit.value
      )

    const initialSpellbookLimit =
      progression.value?.spellbook?.initialSpells ?? 0

    const spellsToLearn =
      availableLevelledSpells.value
        .filter(spell => spell.level === 1)
        .slice(
          0,
          initialSpellbookLimit
        )

    for (const spell of cantripsToLearn) {
      if (!isCantripKnown(spell.id)) {
        characterCreator.learnCantrip(
          spell.id,
          cantripsKnownLimit.value
        )
      }
    }

    for (const spell of spellsToLearn) {
      if (!isSpellInSpellbook(spell.id)) {
        characterCreator.learnSpell(
          spell.id
        )
      }
    }

    return true
  }

  return {
    characterClass,
    spellcasting,
    progression,
    canCastSpells,
    spellcastingAbility,
    spellcastingAbilityScore,
    spellcastingAbilityModifier,
    proficiencyBonus,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    highestSpellSlotLevel,
    cantripsKnownLimit,
    spellsKnownLimit,
    preparedSpellLimit,
    spellbookLimit,
    availableSpells,
    availableCantrips,
    availableLevelledSpells,
    knownCantrips,
    knownSpells,
    spellbookSpells,
    preparedSpells,
    preparedCantrips,
    preparedLevelledSpells,
    isCantripKnown,
    isSpellKnown,
    isSpellInSpellbook,
    isSpellPrepared,
    isSpellAvailable,
    canLearnCantrip,
    canLearnSpell,
    canPrepareSpell,
    canCastSpell,
    canCastPreparedSpell,
    learnCantrip,
    forgetCantrip,
    learnSpell,
    forgetSpell,
    prepareSpell,
    unprepareSpell,
    initializeSpellbook
  }
}