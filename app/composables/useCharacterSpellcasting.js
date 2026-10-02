import { computed } from 'vue'

import { spells } from '~/data/spells'
import {
  getCantripCount,
  getKnownSpellCount,
  getPreparedSpellCount,
  getSpellbookLimit,
  getSpellSlots
} from '~/domain/spells/spellcastingProgression'
import { isSpellAvailableToClass } from '~/domain/spells/spellAvailability'
import { useCharacterCreatorStore } from '~/stores/characterCreator'
import { useCharacterStats } from '~/composables/useCharacterStats'
import { useClassesStore } from '~/stores/classes'

export const useCharacterSpellcasting = () => {
  const characterCreator =
    useCharacterCreatorStore()

  const classesStore =
    useClassesStore()

  const { abilityScores } =
    useCharacterStats()

  const characterClass = computed(() => {
    return characterCreator.classId
      ? classesStore.getClassById(
          characterCreator.classId
        )
      : null
  })

  const spellcasting = computed(() => {
    return characterClass.value?.spellcasting ?? null
  })

  const canCastSpells = computed(() => {
    if (!spellcasting.value) {
      return false
    }

    return (
      characterCreator.level >=
      (
        spellcasting.value.startsAtLevel ?? 1
      )
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

  const spellcastingAbilityModifier =
    computed(() => {
      return Math.floor(
        (
          spellcastingAbilityScore.value -
          10
        ) / 2
      )
    })

  const proficiencyBonus = computed(() => {
    return (
      Math.floor(
        (
          characterCreator.level - 1
        ) / 4
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

    return getSpellSlots(
      spellcasting.value?.slotProgression,
      characterCreator.level
    )
  })

  const highestSpellSlotLevel =
    computed(() => {
      for (
        let index =
          spellSlots.value.length - 1;
        index >= 0;
        index -= 1
      ) {
        if (
          spellSlots.value[index] > 0
        ) {
          return index + 1
        }
      }

      return 0
    })

  const cantripsKnownLimit =
    computed(() => {
      if (!canCastSpells.value) {
        return 0
      }

      return (
        getCantripCount(
          characterCreator.classId,
          characterCreator.level
        ) ?? 0
      )
    })

  const spellsKnownLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    return getKnownSpellCount(
      characterCreator.classId,
      characterCreator.level
    )
  })

  const preparedSpellLimit = computed(() => {
    if (
      !canCastSpells.value ||
      spellcasting.value?.type !== 'prepared'
    ) {
      return null
    }

    return getPreparedSpellCount(
      characterCreator.classId,
      characterCreator.level,
      spellcastingAbilityModifier.value
    )
  })

  const spellbookLimit = computed(() => {
    if (!canCastSpells.value) {
      return 0
    }

    return getSpellbookLimit(
      characterCreator.classId,
      characterCreator.level
    )
  })

  const availableSpells = computed(() => {
    if (!canCastSpells.value) {
      return []
    }

    return spells.filter(spell => {
      if (
        !isSpellAvailableToClass(
          spell,
          characterCreator.classId
        )
      ) {
        return false
      }

      return (
        spell.level === 0 ||
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

  const availableLevelledSpells =
    computed(() => {
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

  const preparedLevelledSpells =
    computed(() => {
      return preparedSpells.value.filter(
        spell => spell.level > 0
      )
    })

  const isCantripKnown = spellId => {
    return characterCreator.knowsCantrip(
      spellId
    )
  }

  const isSpellKnown = spellId => {
    return characterCreator.knowsSpell(
      spellId
    )
  }

  const isSpellInSpellbook = spellId => {
    return characterCreator.hasSpell(
      spellId
    )
  }

  const isSpellPrepared = spellId => {
    return characterCreator.isSpellPrepared(
      spellId
    )
  }

  const isSpellAvailable = spell => {
    return availableSpells.value.some(
      availableSpell =>
        availableSpell.id ===
        spell?.id
    )
  }

  const canLearnCantrip = spell => {
    if (
      !isSpellAvailable(spell) ||
      spell.level !== 0
    ) {
      return false
    }

    return (
      isCantripKnown(spell.id) ||
      knownCantrips.value.length <
        cantripsKnownLimit.value
    )
  }

  const canLearnSpell = spell => {
    if (
      !isSpellAvailable(spell) ||
      spell.level === 0
    ) {
      return false
    }

    if (
      spellcasting.value?.type ===
        'known' ||
      spellcasting.value?.type ===
        'pact'
    ) {
      return (
        isSpellKnown(spell.id) ||
        knownSpells.value.length <
          (
            spellsKnownLimit.value ?? 0
          )
      )
    }

    if (
      spellcasting.value?.spellbook
        ?.enabled === true
    ) {
      return (
        isSpellInSpellbook(spell.id) ||
        spellbookSpells.value.length <
          (
            spellbookLimit.value ?? 0
          )
      )
    }

    return false
  }

  const canPrepareSpell = spell => {
    if (
      !isSpellAvailable(spell) ||
      spell.level === 0 ||
      spellcasting.value?.type !==
        'prepared'
    ) {
      return false
    }

    if (
      spellcasting.value?.spellbook
        ?.enabled === true &&
      !isSpellInSpellbook(spell.id)
    ) {
      return false
    }

    return (
      isSpellPrepared(spell.id) ||
      preparedLevelledSpells.value.length <
        (
          preparedSpellLimit.value ?? 0
        )
    )
  }

  const learnCantrip = spell => {
    if (!canLearnCantrip(spell)) {
      return false
    }

    return characterCreator.learnCantrip(
      spell.id,
      cantripsKnownLimit.value
    )
  }

  const forgetCantrip = spell => {
    if (!isCantripKnown(spell.id)) {
      return false
    }

    characterCreator.forgetCantrip(
      spell.id
    )

    return true
  }

  const learnSpell = spell => {
    if (!canLearnSpell(spell)) {
      return false
    }

    if (
      spellcasting.value?.type ===
        'known' ||
      spellcasting.value?.type ===
        'pact'
    ) {
      characterCreator.learnKnownSpell(
        spell.id
      )

      return true
    }

    if (
      spellcasting.value?.spellbook
        ?.enabled === true
    ) {
      characterCreator.learnSpell(
        spell.id
      )

      return true
    }

    return false
  }

  const forgetSpell = spell => {
    if (
      spellcasting.value?.type ===
        'known' ||
      spellcasting.value?.type ===
        'pact'
    ) {
      if (!isSpellKnown(spell.id)) {
        return false
      }

      characterCreator.forgetKnownSpell(
        spell.id
      )

      return true
    }

    if (
      spellcasting.value?.spellbook
        ?.enabled === true
    ) {
      if (
        !isSpellInSpellbook(spell.id)
      ) {
        return false
      }

      characterCreator.forgetSpell(
        spell.id
      )

      return true
    }

    return false
  }

  const prepareSpell = spell => {
    if (!canPrepareSpell(spell)) {
      return false
    }

    characterCreator.prepareSpell(
      spell.id
    )

    return true
  }

  const unprepareSpell = spell => {
    if (!isSpellPrepared(spell.id)) {
      return false
    }

    characterCreator.unprepareSpell(
      spell.id
    )

    return true
  }

  const canCastSpell = spell => {
    if (
      !canCastSpells.value ||
      !spell
    ) {
      return false
    }

    if (spell.level === 0) {
      return isCantripKnown(
        spell.id
      )
    }

    if (
      (
        spellSlots.value[
          spell.level - 1
        ] ?? 0
      ) <= 0
    ) {
      return false
    }

    if (
      spellcasting.value?.type ===
        'known' ||
      spellcasting.value?.type ===
        'pact'
    ) {
      return isSpellKnown(spell.id)
    }

    if (
      spellcasting.value?.type ===
      'prepared'
    ) {
      return isSpellPrepared(spell.id)
    }

    return false
  }

  const canCastPreparedSpell = spell => {
    return canCastSpell(spell)
  }

  const initializeSpellbook = () => {
    if (
      !canCastSpells.value ||
      spellcasting.value?.spellbook
        ?.enabled !== true
    ) {
      return false
    }

    const cantrips =
      availableCantrips.value.slice(
        0,
        cantripsKnownLimit.value
      )

    for (const spell of cantrips) {
      if (!isCantripKnown(spell.id)) {
        characterCreator.learnCantrip(
          spell.id,
          cantripsKnownLimit.value
        )
      }
    }

    const initialSpells =
      availableLevelledSpells.value
        .filter(
          spell => spell.level === 1
        )
        .slice(
          0,
          spellbookLimit.value ?? 0
        )

    for (const spell of initialSpells) {
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