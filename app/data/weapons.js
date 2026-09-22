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
    ability: 'strength',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    range: {
      normal: 20,
      long: 60
    }
  },
  {
    id: 'greatclub',
    name: 'Дубина',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'bludgeoning',
    properties: ['twoHanded']
  },
  {
    id: 'handaxe',
    name: 'Ручной топор',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'slashing',
    properties: ['light', 'thrown'],
    range: {
      normal: 20,
      long: 60
    }
  },
  {
    id: 'javelin',
    name: 'Дротик',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['thrown'],
    range: {
      normal: 30,
      long: 120
    }
  },
  {
    id: 'lightHammer',
    name: 'Лёгкий молот',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d4',
    damageType: 'bludgeoning',
    properties: ['light', 'thrown'],
    range: {
      normal: 20,
      long: 60
    }
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
    properties: ['versatile'],
    versatileDamage: '1d8'
  },
  {
    id: 'sickle',
    name: 'Серп',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d4',
    damageType: 'slashing',
    properties: ['light']
  },
  {
    id: 'spear',
    name: 'Копьё',
    category: 'simple',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['thrown', 'versatile'],
    range: {
      normal: 20,
      long: 60
    },
    versatileDamage: '1d8'
  },
  {
    id: 'lightCrossbow',
    name: 'Лёгкий арбалет',
    category: 'simple',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition', 'loading', 'twoHanded'],
    range: {
      normal: 80,
      long: 320
    }
  },
  {
    id: 'dart',
    name: 'Дротик',
    category: 'simple',
    type: 'ranged',
    ability: 'strength',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'thrown'],
    range: {
      normal: 20,
      long: 60
    }
  },
  {
    id: 'shortbow',
    name: 'Короткий лук',
    category: 'simple',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['ammunition', 'twoHanded'],
    range: {
      normal: 80,
      long: 320
    }
  },
  {
    id: 'sling',
    name: 'Праща',
    category: 'simple',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d4',
    damageType: 'bludgeoning',
    properties: ['ammunition'],
    range: {
      normal: 30,
      long: 120
    }
  },
  {
    id: 'battleaxe',
    name: 'Боевой топор',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile'],
    versatileDamage: '1d10'
  },
  {
    id: 'flail',
    name: 'Цеп',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'bludgeoning',
    properties: []
  },
  {
    id: 'glaive',
    name: 'Глефа',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d10',
    damageType: 'slashing',
    properties: ['heavy', 'reach', 'twoHanded']
  },
  {
    id: 'greataxe',
    name: 'Двуручный топор',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d12',
    damageType: 'slashing',
    properties: ['heavy', 'twoHanded']
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
    id: 'halberd',
    name: 'Алебарда',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d10',
    damageType: 'slashing',
    properties: ['heavy', 'reach', 'twoHanded']
  },
  {
    id: 'lance',
    name: 'Копьё-рыцарское',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d12',
    damageType: 'piercing',
    properties: ['reach', 'special'],
    special: 'lance'
  },
  {
    id: 'longsword',
    name: 'Длинный меч',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile'],
    versatileDamage: '1d10'
  },
  {
    id: 'maul',
    name: 'Молот',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '2d6',
    damageType: 'bludgeoning',
    properties: ['heavy', 'twoHanded']
  },
  {
    id: 'morningstar',
    name: 'Моргенштерн',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'piercing',
    properties: []
  },
  {
    id: 'pike',
    name: 'Пика',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d10',
    damageType: 'piercing',
    properties: ['heavy', 'reach', 'twoHanded']
  },
  {
    id: 'rapier',
    name: 'Рапира',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['finesse']
  },
  {
    id: 'scimitar',
    name: 'Сабля',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'slashing',
    properties: ['finesse', 'light']
  },
  {
    id: 'shortsword',
    name: 'Короткий меч',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['finesse', 'light']
  },
  {
    id: 'trident',
    name: 'Трезубец',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['thrown', 'versatile'],
    range: {
      normal: 20,
      long: 60
    },
    versatileDamage: '1d8'
  },
  {
    id: 'warPick',
    name: 'Боевой кирк',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'piercing',
    properties: []
  },
  {
    id: 'warhammer',
    name: 'Боевой молот',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d8',
    damageType: 'bludgeoning',
    properties: ['versatile'],
    versatileDamage: '1d10'
  },
  {
    id: 'whip',
    name: 'Кнут',
    category: 'martial',
    type: 'melee',
    ability: 'strength',
    damage: '1d4',
    damageType: 'slashing',
    properties: ['finesse', 'reach']
  },
  {
    id: 'blowgun',
    name: 'Духовая трубка',
    category: 'martial',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1',
    damageType: 'piercing',
    properties: ['ammunition', 'loading'],
    range: {
      normal: 25,
      long: 100
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
    properties: ['ammunition', 'light', 'loading'],
    range: {
      normal: 30,
      long: 120
    }
  },
  {
    id: 'heavyCrossbow',
    name: 'Тяжёлый арбалет',
    category: 'martial',
    type: 'ranged',
    ability: 'dexterity',
    damage: '1d10',
    damageType: 'piercing',
    properties: ['ammunition', 'heavy', 'loading', 'twoHanded'],
    range: {
      normal: 100,
      long: 400
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
    properties: ['ammunition', 'heavy', 'twoHanded'],
    range: {
      normal: 150,
      long: 600
    }
  },
  {
    id: 'net',
    name: 'Сеть',
    category: 'martial',
    type: 'ranged',
    ability: 'dexterity',
    damage: null,
    damageType: null,
    properties: ['special', 'thrown'],
    range: {
      normal: 5,
      long: 15
    },
    special: 'net'
  }
]