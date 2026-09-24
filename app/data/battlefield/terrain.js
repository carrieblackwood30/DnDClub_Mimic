export const terrainTypes = [
  {
    id: 'grass',
    name: 'Трава',
    icon: '🌿',
    color: 0x547449,
    alpha: 0.18,
    movementCost: 1,
    difficult: false,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  },
  {
    id: 'dirt',
    name: 'Земля',
    icon: '🟤',
    color: 0x77573c,
    alpha: 0.24,
    movementCost: 1,
    difficult: false,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  },
  {
    id: 'stone',
    name: 'Камень',
    icon: '🪨',
    color: 0x77756a,
    alpha: 0.26,
    movementCost: 1,
    difficult: false,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  },
  {
    id: 'water',
    name: 'Вода',
    icon: '💧',
    color: 0x2c6a7b,
    alpha: 0.4,
    movementCost: 2,
    difficult: true,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['swim', 'fly']
  },
  {
    id: 'forest',
    name: 'Лес',
    icon: '🌲',
    color: 0x284b2d,
    alpha: 0.32,
    movementCost: 2,
    difficult: true,
    blocked: false,
    blocksLineOfSight: true,
    cover: 'half',
    movementModes: ['walk', 'fly']
  },
  {
    id: 'mud',
    name: 'Грязь',
    icon: '🟫',
    color: 0x55422c,
    alpha: 0.38,
    movementCost: 2,
    difficult: true,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  },
  {
    id: 'snow',
    name: 'Снег',
    icon: '❄️',
    color: 0xaec3c6,
    alpha: 0.34,
    movementCost: 2,
    difficult: true,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  },
  {
    id: 'sand',
    name: 'Песок',
    icon: '🟨',
    color: 0xb69555,
    alpha: 0.3,
    movementCost: 1,
    difficult: false,
    blocked: false,
    blocksLineOfSight: false,
    cover: null,
    movementModes: ['walk', 'fly']
  }
]

export const defaultTerrainId = 'grass'

export const terrainById = terrainTypes.reduce(
  (result, terrain) => {
    result[terrain.id] = terrain
    return result
  },
  {}
)
