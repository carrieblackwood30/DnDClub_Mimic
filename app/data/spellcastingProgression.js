export const spellcastingProgression = {
  bard: {
    cantripsKnown: [
      2, 2, 2,
      3, 3, 3, 3, 3, 3,
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4
    ],
    spellsKnown: [
      4, 5, 6, 7, 8,
      9, 10, 11, 12, 14,
      15, 15, 16, 18, 19,
      19, 20, 22, 22, 22
    ]
  },

  cleric: {
    cantripsKnown: [
      3, 3, 3, 3, 4,
      4, 4, 4, 4, 5,
      5, 5, 5, 5, 5,
      5, 5, 5, 5, 5
    ],
    spellsKnown: null
  },

  druid: {
    cantripsKnown: [
      2, 2, 2, 2, 3,
      3, 3, 3, 3, 4,
      4, 4, 4, 4, 4,
      4, 4, 4, 4, 4
    ],
    spellsKnown: null
  },

  fighter: {
    cantripsKnown: null,
    spellsKnown: null
  },

  monk: {
    cantripsKnown: null,
    spellsKnown: null
  },

  paladin: {
    cantripsKnown: null,
    spellsKnown: null
  },

  ranger: {
    cantripsKnown: null,
    spellsKnown: [
      0, 2, 3, 3, 4,
      4, 5, 5, 6, 6,
      7, 7, 8, 8, 9,
      9, 10, 10, 11, 11
    ]
  },

  rogue: {
    cantripsKnown: null,
    spellsKnown: null
  },

  sorcerer: {
    cantripsKnown: [
      4, 4, 4, 4, 5,
      5, 5, 5, 5, 6,
      6, 6, 6, 6, 6,
      6, 6, 6, 6, 6
    ],
    spellsKnown: [
      2, 3, 4, 5, 6,
      7, 8, 9, 10, 11,
      12, 12, 13, 13, 14,
      14, 15, 15, 15, 15
    ]
  },

  warlock: {
    cantripsKnown: [
      2, 2, 2, 2, 3,
      3, 3, 3, 3, 4,
      4, 4, 4, 4, 4,
      4, 4, 4, 4, 4
    ],
    spellsKnown: [
      2, 3, 4, 5, 6,
      7, 8, 9, 10, 10,
      11, 11, 12, 12, 13,
      13, 14, 14, 15, 15
    ]
  },

  wizard: {
    cantripsKnown: [
      3, 3, 3, 3, 4,
      4, 4, 4, 4, 5,
      5, 5, 5, 5, 5,
      5, 5, 5, 5, 5
    ],
    spellsKnown: null,
    spellbook: {
      initialSpells: 6,
      spellsPerLevel: 2
    }
  }
}