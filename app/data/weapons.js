export const weapons = [
  {
    id: 'club',
    name: 'Дубинка',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d4',
    damageType: 'bludgeoning',
    properties: ['light']
  },

  {
    id: 'dagger',
    name: 'Кинжал',
    category: 'simple',
    type: 'melee',
    ability: 'dexterity',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light']
  },

  {
    id: 'greatsword',
    name: 'Двуручный меч',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '2d6',
    damageType: 'slashing',
    properties: ['heavy', 'twoHanded']
  },

  {
    id: 'longsword',
    name: 'Длинный меч',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile']
  },

  {
    id: 'rapier',
    name: 'Рапира',
    category: 'martial',
    type: 'melee',
    ability: 'dexterity',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['finesse']
  },

  {
    id: 'shortsword',
    name: 'Короткий меч',
    category: 'martial',
    type: 'melee',
    ability: 'dexterity',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['finesse', 'light']
  },

  {
    id: 'handaxe',
    name: 'Ручной топор',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'slashing',
    properties: ['light']
  },

  {
    id: 'mace',
    name: 'Булава',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'bludgeoning',
    properties: []
  },

  {
    id: 'quarterstaff',
    name: 'Боевой посох',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'bludgeoning',
    properties: ['versatile']
  },

  {
    id: 'spear',
    name: 'Копьё',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['thrown', 'versatile']
  },

  {
    id: 'shortbow',
    name: 'Короткий лук',
    category: 'simple',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['ranged', 'twoHanded'],
    range: {
      normal: 80,
      long: 320
    }
  },
  {
    id: 'longbow',
    name: 'Длинный лук',
    category: 'martial',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['heavy', 'ranged', 'twoHanded'],
    range: {
      normal: 150,
      long: 600
    }
  },
{
    id: 'lightCrossbow',
    name: 'Лёгкий арбалет',
    category: 'simple',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition', 'loading', 'ranged', 'twoHanded'],
    range: {
      normal: 80,
      long: 320
    }
  },
{
  id: 'handCrossbow',
  name: 'Ручной арбалет',
  category: 'martial',
  type: 'ranged',
  ability: 'dexterity',
  damage: '1d6',
  damageType: 'piercing',
  properties: ['ammunition', 'light', 'loading', 'ranged'],
  range: {
    normal: 30,
    long: 120
  }
}
]