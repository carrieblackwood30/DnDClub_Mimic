const FULL_CASTER_SLOTS = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
}

const HALF_CASTER_SLOTS = {
  1: [],
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 2, 2],
  8: [4, 2, 2],
  9: [4, 2, 2, 2],
  10: [4, 2, 2, 2],
  11: [4, 3, 3, 2],
  12: [4, 3, 3, 2],
  13: [4, 3, 3, 2, 1],
  14: [4, 3, 3, 2, 1],
  15: [4, 3, 3, 2, 1, 1],
  16: [4, 3, 3, 2, 1, 1],
  17: [4, 3, 3, 2, 1, 1, 1],
  18: [4, 3, 3, 2, 1, 1, 1],
  19: [4, 3, 3, 2, 1, 1, 1, 1],
  20: [4, 3, 3, 2, 1, 1, 1, 1]
}

const KNOWN_SPELLS = {
  bard: [
    4, 5, 6, 7, 8,
    9, 10, 11, 12, 14,
    15, 15, 16, 18, 19,
    19, 20, 20, 21, 22
  ],

  ranger: [
    0, 0, 0, 0, 2,
    2, 3, 3, 4, 4,
    5, 5, 6, 6, 7,
    7, 8, 8, 9, 11
  ],

  sorcerer: [
    2, 3, 4, 5, 6,
    7, 8, 9, 10, 11,
    12, 12, 13, 13, 14,
    14, 15, 15, 15, 15
  ],

  warlock: [
    2, 3, 4, 5, 6,
    7, 8, 9, 10, 10,
    11, 11, 12, 12, 13,
    13, 14, 14, 15, 15
  ]
}

const CANTRIPS = {
  bard: {
    1: 2,
    4: 3,
    10: 4
  },

  cleric: {
    1: 3,
    4: 4,
    10: 5
  },

  druid: {
    1: 2,
    4: 3,
    10: 4
  },

  sorcerer: {
    1: 4,
    4: 5,
    10: 6
  },

  warlock: {
    1: 2,
    4: 3,
    10: 4
  },

  wizard: {
    1: 3,
    4: 4,
    10: 5
  }
}

const PACT_MAGIC = {
  1: { slots: 1, level: 1 },
  2: { slots: 2, level: 1 },
  3: { slots: 2, level: 2 },
  4: { slots: 2, level: 2 },
  5: { slots: 2, level: 3 },
  6: { slots: 2, level: 3 },
  7: { slots: 2, level: 4 },
  8: { slots: 2, level: 4 },
  9: { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 }
}

const SPELLBOOK = {
  wizard: {
    initialSpells: 6,
    spellsPerLevel: 2
  }
}

const normalizeLevel = level => {
  return Math.min(
    20,
    Math.max(1, Number(level ?? 1))
  )
}

const getProgressionValue = (
  table,
  level
) => {
  const normalizedLevel = Number(level ?? 1)

  const entries = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b)

  let value = 0

  for (const entryLevel of entries) {
    if (normalizedLevel >= entryLevel) {
      value = table[entryLevel]
    }
  }

  return value
}

export const getSpellSlots = (
  slotProgression,
  level
) => {
  const normalizedLevel =
    normalizeLevel(level)

  if (slotProgression === 'full-caster') {
    return FULL_CASTER_SLOTS[
      normalizedLevel
    ] ?? []
  }

  if (slotProgression === 'half-caster') {
    return HALF_CASTER_SLOTS[
      normalizedLevel
    ] ?? []
  }

  if (slotProgression === 'pact-magic') {
    const pact =
      PACT_MAGIC[normalizedLevel]

    if (!pact) {
      return []
    }

    return Array.from(
      {
        length: pact.level
      },
      (_, index) =>
        index === pact.level - 1
          ? pact.slots
          : 0
    )
  }

  return []
}

export const getKnownSpellCount = (
  classId,
  level
) => {
  const progression =
    KNOWN_SPELLS[classId]

  if (!progression) {
    return null
  }

  return progression[
    normalizeLevel(level) - 1
  ] ?? 0
}

export const getCantripCount = (
  classId,
  level
) => {
  const progression =
    CANTRIPS[classId]

  if (!progression) {
    return null
  }

  return getProgressionValue(
    progression,
    normalizeLevel(level)
  )
}

export const getPreparedSpellCount = (
  classId,
  level,
  abilityModifier
) => {
  const normalizedLevel =
    normalizeLevel(level)

  const modifier =
    Number(abilityModifier ?? 0)

  if (
    classId === 'cleric' ||
    classId === 'druid'
  ) {
    return Math.max(
      1,
      modifier + normalizedLevel
    )
  }

  if (classId === 'paladin') {
    if (normalizedLevel < 2) {
      return 0
    }

    return Math.max(
      1,
      modifier +
      Math.floor(
        normalizedLevel / 2
      )
    )
  }

  if (classId === 'wizard') {
    return Math.max(
      1,
      modifier + normalizedLevel
    )
  }

  return null
}

export const getSpellbookLimit = (
  classId,
  level
) => {
  const spellbook =
    SPELLBOOK[classId]

  if (!spellbook) {
    return null
  }

  return (
    spellbook.initialSpells +
    Math.max(
      0,
      normalizeLevel(level) - 1
    ) *
      spellbook.spellsPerLevel
  )
}

export const getMaxSpellLevel = (
  slotProgression,
  level
) => {
  return getSpellSlots(
    slotProgression,
    level
  ).length
}

export const getPactMagicSlotLevel = level => {
  return PACT_MAGIC[
    normalizeLevel(level)
  ]?.level ?? 0
}

export const getPactMagicSlotCount = level => {
  return PACT_MAGIC[
    normalizeLevel(level)
  ]?.slots ?? 0
}