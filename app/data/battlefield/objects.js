export const battlefieldObjectTypes = [
  {
    id: 'tree',
    name: 'Дерево',
    icon: '🌳',
    texture: '/battlefield/objects/tree.png',
    color: 0x315b31,
    size: 'medium',
    footprint: [{ q: 0, r: 0 }],
    blocksMovement: true,
    blocksLineOfSight: true,
    cover: 'half',
    height: 15,
    destructible: true,
    hp: 20
  },
  {
    id: 'rock',
    name: 'Валун',
    icon: '🪨',
    texture: '/battlefield/objects/rock.png',
    color: 0x77766d,
    size: 'medium',
    footprint: [{ q: 0, r: 0 }],
    blocksMovement: true,
    blocksLineOfSight: true,
    cover: 'three-quarters',
    height: 5,
    destructible: true,
    hp: 30
  },
  {
    id: 'wall',
    name: 'Стена',
    icon: '🧱',
    texture: '/battlefield/objects/wall.png',
    color: 0x68655e,
    size: 'medium',
    footprint: [{ q: 0, r: 0 }],
    blocksMovement: true,
    blocksLineOfSight: true,
    cover: 'total',
    height: 10,
    destructible: true,
    hp: 50
  },
  {
    id: 'door',
    name: 'Дверь',
    icon: '🚪',
    texture: '/battlefield/objects/door.png',
    color: 0x70452d,
    size: 'medium',
    footprint: [{ q: 0, r: 0 }],
    blocksMovement: true,
    blocksLineOfSight: true,
    cover: 'three-quarters',
    height: 8,
    destructible: true,
    hp: 20,
    state: 'closed'
  },
  {
    id: 'crate',
    name: 'Ящик',
    icon: '📦',
    texture: '/battlefield/objects/crate.png',
    color: 0x8b6338,
    size: 'small',
    footprint: [{ q: 0, r: 0 }],
    blocksMovement: true,
    blocksLineOfSight: false,
    cover: 'half',
    height: 4,
    destructible: true,
    hp: 10
  }
]

export const battlefieldObjectById = battlefieldObjectTypes.reduce(
  (result, objectType) => {
    result[objectType.id] = objectType
    return result
  },
  {}
)

export const defaultObjectTypeId = 'tree'
