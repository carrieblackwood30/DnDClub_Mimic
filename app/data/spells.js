export const spells = [
  {
    id: 'mage-hand',
    name: 'Волшебная рука',
    level: 0,
    school: 'conjuration',
    castingTime: '1-action',
    range: '30-feet',
    components: ['V', 'S'],
    duration: '1-minute',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'sorcerer',
      'warlock',
      'wizard'
    ]
  },
  {
    id: 'fire-bolt',
    name: 'Огненный снаряд',
    level: 0,
    school: 'evocation',
    castingTime: '1-action',
    range: '120-feet',
    components: ['V', 'S'],
    duration: 'instantaneous',
    concentration: false,
    ritual: false,
    classes: [
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'ray-of-frost',
    name: 'Луч холода',
    level: 0,
    school: 'evocation',
    castingTime: '1-action',
    range: '60-feet',
    components: ['V', 'S',
    ],
    duration: 'instantaneous',
    concentration: false,
    ritual: false,
    classes: [
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'shocking-grasp',
    name: 'Электрошок',
    level: 0,
    school: 'evocation',
    castingTime: '1-action',
    range: 'touch',
    components: ['V', 'S'],
    duration: 'instantaneous',
    concentration: false,
    ritual: false,
    classes: [
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'light',
    name: 'Свет',
    level: 0,
    school: 'evocation',
    castingTime: '1-action',
    range: 'touch',
    components: ['V', 'M'],
    duration: '1-hour',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'cleric',
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'minor-illusion',
    name: 'Малая иллюзия',
    level: 0,
    school: 'illusion',
    castingTime: '1-action',
    range: '30-feet',
    components: ['S', 'M'],
    duration: '1-minute',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'sorcerer',
      'warlock',
      'wizard'
    ]
  },
  {
    id: 'prestidigitation',
    name: 'Фокусы',
    level: 0,
    school: 'transmutation',
    castingTime: '1-action',
    range: '10-feet',
    components: ['V', 'S'],
    duration: 'up-to-1-hour',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'sorcerer',
      'warlock',
      'wizard'
    ]
  },
  {
    id: 'message',
    name: 'Сообщение',
    level: 0,
    school: 'transmutation',
    castingTime: '1-action',
    range: '120-feet',
    components: ['V', 'S', 'M'],
    duration: '1-round',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'shield',
    name: 'Щит',
    level: 1,
    school: 'abjuration',
    castingTime: 'reaction',
    reactionTrigger: 'hit-by-attack',
    range: 'self',
    components: ['V', 'S'],
    duration: '1-round',
    concentration: false,
    ritual: false,
    effect: {
      type: 'ac-bonus',
      value: 5,
      appliesToTriggeringAttack: true,
      affectsCriticalHit: false
    },
    classes: [
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'magic-missile',
    name: 'Волшебная стрела',
    level: 1,
    school: 'evocation',
    castingTime: '1-action',
    range: '120-feet',
    components: ['V', 'S'],
    duration: 'instantaneous',
    concentration: false,
    ritual: false,
    classes: [
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'detect-magic',
    name: 'Обнаружение магии',
    level: 1,
    school: 'divination',
    castingTime: '1-action',
    range: 'self',
    components: ['V', 'S'],
    duration: '10-minutes',
    concentration: true,
    ritual: true,
    classes: [
      'bard',
      'cleric',
      'druid',
      'paladin',
      'ranger',
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'find-familiar',
    name: 'Поиск фамильяра',
    level: 1,
    school: 'conjuration',
    castingTime: '1-hour',
    range: '10-feet',
    components: ['V', 'S', 'M'],
    duration: 'instantaneous',
    concentration: false,
    ritual: true,
    classes: [
      'wizard'
    ]
  },
  {
    id: 'identify',
    name: 'Опознание',
    level: 1,
    school: 'divination',
    castingTime: '1-minute',
    range: 'touch',
    components: ['V', 'S', 'M'],
    duration: 'instantaneous',
    concentration: false,
    ritual: true,
    classes: [
      'bard',
      'wizard'
    ]
  },
  {
    id: 'sleep',
    name: 'Сон',
    level: 1,
    school: 'enchantment',
    castingTime: '1-action',
    range: '90-feet',
    components: ['V', 'S', 'M'],
    duration: '1-minute',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'sorcerer',
      'wizard'
    ]
  },
  {
    id: 'thunderwave',
    name: 'Громовая волна',
    level: 1,
    school: 'evocation',
    castingTime: '1-action',
    range: 'self',
    components: ['V', 'S'],
    duration: 'instantaneous',
    concentration: false,
    ritual: false,
    classes: [
      'bard',
      'druid',
      'sorcerer',
      'wizard'
    ]
  }
]