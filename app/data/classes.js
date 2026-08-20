export const classes = [
  {
    id: 'barbarian',
    name: 'Варвар',

    hitDie: 12,

    savingThrowProficiencies: [
      'strength',
      'constitution'
    ],

    skillChoices: {
      count: 2,
      options: [
        'animalHandling',
        'athletics',
        'intimidation',
        'nature',
        'perception',
        'survival'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium'
      ],

      shields: true,

      weapons: [
        'simple',
        'martial'
      ]
    },

    spellcasting: null,

    subclasses: [
      {
        id: 'berserker',
        name: 'Берсерк'
      },
      {
        id: 'totem-warrior',
        name: 'Воин тотема'
      }
    ]
  },

  {
    id: 'bard',
    name: 'Бард',

    hitDie: 8,

    savingThrowProficiencies: [
      'dexterity',
      'charisma'
    ],

    skillChoices: {
      count: 3,
      options: [
        'acrobatics',
        'animalHandling',
        'arcana',
        'athletics',
        'deception',
        'history',
        'insight',
        'intimidation',
        'investigation',
        'medicine',
        'nature',
        'perception',
        'performance',
        'persuasion',
        'religion',
        'sleightOfHand',
        'stealth',
        'survival'
      ]
    },

    proficiencies: {
      armor: [
        'light'
      ],

      shields: false,

      weapons: [
        'simple',
        'handCrossbow',
        'longsword',
        'rapier',
        'shortsword'
      ]
    },

    spellcasting: {
      ability: 'charisma'
    },

    subclasses: [
      {
        id: 'college-of-lore',
        name: 'Коллегия знаний'
      },
      {
        id: 'college-of-valor',
        name: 'Коллегия доблести'
      }
    ]
  },

  {
    id: 'cleric',
    name: 'Клирик',

    hitDie: 8,

    savingThrowProficiencies: [
      'wisdom',
      'charisma'
    ],

    skillChoices: {
      count: 2,
      options: [
        'history',
        'insight',
        'medicine',
        'persuasion',
        'religion'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium'
      ],

      shields: true,

      weapons: [
        'simple'
      ]
    },

    spellcasting: {
      ability: 'wisdom'
    },

    subclasses: [
      {
        id: 'life-domain',
        name: 'Домен жизни'
      },
      {
        id: 'light-domain',
        name: 'Домен света'
      }
    ]
  },

  {
    id: 'druid',
    name: 'Друид',

    hitDie: 8,

    savingThrowProficiencies: [
      'intelligence',
      'wisdom'
    ],

    skillChoices: {
      count: 2,
      options: [
        'arcana',
        'animalHandling',
        'insight',
        'medicine',
        'nature',
        'perception',
        'religion',
        'survival'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium'
      ],

      shields: true,

      weapons: [
        'club',
        'dagger',
        'dart',
        'javelin',
        'mace',
        'quarterstaff',
        'scimitar',
        'sickle',
        'sling',
        'spear'
      ]
    },

    spellcasting: {
      ability: 'wisdom'
    },

    subclasses: [
      {
        id: 'circle-of-the-land',
        name: 'Круг земли'
      },
      {
        id: 'circle-of-the-moon',
        name: 'Круг луны'
      }
    ]
  },

  {
    id: 'fighter',
    name: 'Воин',

    hitDie: 10,

    savingThrowProficiencies: [
      'strength',
      'constitution'
    ],

    skillChoices: {
      count: 2,
      options: [
        'acrobatics',
        'animalHandling',
        'athletics',
        'history',
        'insight',
        'intimidation',
        'perception',
        'survival'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium',
        'heavy'
      ],

      shields: true,

      weapons: [
        'simple',
        'martial'
      ]
    },

    spellcasting: null,

    subclasses: [
      {
        id: 'champion',
        name: 'Чемпион'
      },
      {
        id: 'battle-master',
        name: 'Мастер боевых искусств'
      }
    ]
  },

  {
    id: 'monk',
    name: 'Монах',

    hitDie: 8,

    savingThrowProficiencies: [
      'strength',
      'dexterity'
    ],

    skillChoices: {
      count: 2,
      options: [
        'acrobatics',
        'athletics',
        'history',
        'insight',
        'religion',
        'stealth'
      ]
    },

    proficiencies: {
      armor: [],

      shields: false,

      weapons: [
        'simple',
        'shortsword'
      ]
    },

    spellcasting: null,

    subclasses: [
      {
        id: 'way-of-the-open-hand',
        name: 'Путь открытой ладони'
      },
      {
        id: 'way-of-shadow',
        name: 'Путь тени'
      }
    ]
  },

  {
    id: 'paladin',
    name: 'Паладин',

    hitDie: 10,

    savingThrowProficiencies: [
      'wisdom',
      'charisma'
    ],

    skillChoices: {
      count: 2,
      options: [
        'athletics',
        'insight',
        'intimidation',
        'medicine',
        'persuasion',
        'religion'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium',
        'heavy'
      ],

      shields: true,

      weapons: [
        'simple',
        'martial'
      ]
    },

    spellcasting: {
      ability: 'charisma'
    },

    subclasses: [
      {
        id: 'oath-of-devotion',
        name: 'Клятва преданности'
      },
      {
        id: 'oath-of-vengeance',
        name: 'Клятва мести'
      }
    ]
  },

  {
    id: 'ranger',
    name: 'Следопыт',

    hitDie: 10,

    savingThrowProficiencies: [
      'strength',
      'dexterity'
    ],

    skillChoices: {
      count: 3,
      options: [
        'animalHandling',
        'athletics',
        'insight',
        'investigation',
        'nature',
        'perception',
        'stealth',
        'survival'
      ]
    },

    proficiencies: {
      armor: [
        'light',
        'medium'
      ],

      shields: true,

      weapons: [
        'simple',
        'martial'
      ]
    },

    spellcasting: {
      ability: 'wisdom'
    },

    subclasses: [
      {
        id: 'hunter',
        name: 'Охотник'
      },
      {
        id: 'beast-master',
        name: 'Повелитель зверей'
      }
    ]
  },

  {
    id: 'rogue',
    name: 'Плут',

    hitDie: 8,

    savingThrowProficiencies: [
      'dexterity',
      'intelligence'
    ],

    skillChoices: {
      count: 4,
      options: [
        'acrobatics',
        'athletics',
        'deception',
        'insight',
        'intimidation',
        'investigation',
        'perception',
        'performance',
        'persuasion',
        'sleightOfHand',
        'stealth'
      ]
    },

    proficiencies: {
      armor: [
        'light'
      ],

      shields: false,

      weapons: [
        'simple',
        'handCrossbow',
        'longsword',
        'rapier',
        'shortsword'
      ]
    },

    spellcasting: null,

    subclasses: [
      {
        id: 'thief',
        name: 'Вор'
      },
      {
        id: 'assassin',
        name: 'Убийца'
      }
    ]
  },

  {
    id: 'sorcerer',
    name: 'Чародей',

    hitDie: 6,

    savingThrowProficiencies: [
      'constitution',
      'charisma'
    ],

    skillChoices: {
      count: 2,
      options: [
        'arcana',
        'deception',
        'insight',
        'intimidation',
        'persuasion',
        'religion'
      ]
    },

    proficiencies: {
      armor: [],

      shields: false,

      weapons: [
        'dagger',
        'dart',
        'sling',
        'quarterstaff',
        'lightCrossbow'
      ]
    },

    spellcasting: {
      ability: 'charisma'
    },

    subclasses: [
      {
        id: 'draconic-bloodline',
        name: 'Драконья кровь'
      },
      {
        id: 'wild-magic',
        name: 'Дикая магия'
      }
    ]
  },

  {
    id: 'warlock',
    name: 'Колдун',

    hitDie: 8,

    savingThrowProficiencies: [
      'wisdom',
      'charisma'
    ],

    skillChoices: {
      count: 2,
      options: [
        'arcana',
        'deception',
        'history',
        'intimidation',
        'investigation',
        'nature',
        'religion'
      ]
    },

    proficiencies: {
      armor: [
        'light'
      ],

      shields: false,

      weapons: [
        'simple'
      ]
    },

    spellcasting: {
      ability: 'charisma'
    },

    subclasses: [
      {
        id: 'fiend',
        name: 'Исчадие'
      },
      {
        id: 'great-old-one',
        name: 'Великий Древний'
      }
    ]
  },

  {
    id: 'wizard',
    name: 'Волшебник',

    hitDie: 6,

    savingThrowProficiencies: [
      'intelligence',
      'wisdom'
    ],

    skillChoices: {
      count: 2,
      options: [
        'arcana',
        'history',
        'insight',
        'investigation',
        'medicine',
        'religion'
      ]
    },

    proficiencies: {
      armor: [],

      shields: false,

      weapons: [
        'dagger',
        'dart',
        'sling',
        'quarterstaff',
        'lightCrossbow'
      ]
    },

    spellcasting: {
      ability: 'intelligence'
    },

    subclasses: [
      {
        id: 'school-of-evocation',
        name: 'Школа воплощения'
      },
      {
        id: 'school-of-abjuration',
        name: 'Школа ограждения'
      }
    ]
  }
]