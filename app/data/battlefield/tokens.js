export const battlefieldTokenTypes = [
  {
    id: 'player',
    name: 'Игрок',
    icon: '⚔️',
    color: 0x355f72,
    rimColor: 0x8fd9ff,
    faction: 'friendly',
    defaultHp: 10,
    defaultAc: 10,
    defaultSpeed: 30,
    movementMode: 'walk',
    footprint: [{ q: 0, r: 0 }]
  },
  {
    id: 'npc',
    name: 'NPC',
    icon: '◈',
    color: 0x6c5330,
    rimColor: 0xe0b66d,
    faction: 'neutral',
    defaultHp: 10,
    defaultAc: 10,
    defaultSpeed: 30,
    movementMode: 'walk',
    footprint: [{ q: 0, r: 0 }]
  },
  {
    id: 'enemy',
    name: 'Враг',
    icon: '☠',
    color: 0x6f3735,
    rimColor: 0xff746e,
    faction: 'hostile',
    defaultHp: 10,
    defaultAc: 10,
    defaultSpeed: 30,
    movementMode: 'walk',
    footprint: [{ q: 0, r: 0 }]
  }
]

export const battlefieldTokenTypeById =
  battlefieldTokenTypes.reduce(
    (result, tokenType) => {
      result[tokenType.id] = tokenType
      return result
    },
    {}
  )

export const defaultTokenTypeId = 'player'
