export const battlefieldDefaults = {
  id: 'battlefield-preview',
  width: 30,
  height: 20,
  cellSizeFeet: 5,
  hexOrientation: 'pointy',
  background: {
    base: 0x14120f,
    border: 0x5b4630,
    grid: 0xb89a67
  }
}

export const previewParticipants = [
  {
    id: 'character-sadd',
    name: 'sadd',
    type: 'player',
    position: { q: 5, r: 5 },
    size: 'medium',
    elevation: 0,
    hp: 18,
    maxHp: 18
  },
  {
    id: 'goblin-1',
    name: 'Гоблин',
    type: 'monster',
    position: { q: 14, r: 4 },
    size: 'small',
    elevation: 0,
    hp: 7,
    maxHp: 7
  },
  {
    id: 'skeleton-1',
    name: 'Скелет',
    type: 'monster',
    position: { q: 12, r: 8 },
    size: 'medium',
    elevation: 0,
    hp: 13,
    maxHp: 13
  }
]
