export const races = [
  {
    id: 'human',
    name: 'Человек',
    abilityScoreIncrease: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1
    },
    speed: 30,
    size: 'medium',
    languages: ['common', 'one-extra'],
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [],
      armor: []
    },
    traits: [],
    subraces: []
  },
  {
    id: 'elf',
    name: 'Эльф',
    abilityScoreIncrease: {
      dexterity: 2
    },
    speed: 30,
    size: 'medium',
    languages: ['common', 'elvish'],
    proficiencies: {
      skills: ['perception'],
      tools: [],
      weapons: [],
      armor: []
    },
    traits: [
      {
        id: 'darkvision',
        name: 'Тёмное зрение',
        type: 'darkvision',
        range: 60
      },
      {
        id: 'fey-ancestry',
        name: 'Наследие фей',
        type: 'fey-ancestry'
      },
      {
        id: 'trance',
        name: 'Транс',
        type: 'trance'
      }
    ],
    subraces: [
      {
        id: 'high-elf',
        name: 'Высший эльф',
        abilityScoreIncrease: {
          intelligence: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [
            'longsword',
            'shortsword',
            'shortbow',
            'longbow'
          ],
          armor: []
        },
        traits: [
          {
            id: 'high-elf-cantrip',
            name: 'Заговор',
            type: 'cantrip',
            ability: 'intelligence'
          },
          {
            id: 'extra-language',
            name: 'Дополнительный язык',
            type: 'language-choice'
          }
        ]
      },
      {
        id: 'wood-elf',
        name: 'Лесной эльф',
        abilityScoreIncrease: {
          wisdom: 1
        },
        speed: 35,
        proficiencies: {
          skills: [],
          tools: [
            'herbalism-kit'
          ],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'mask-of-the-wild',
            name: 'Маска дикой природы',
            type: 'mask-of-the-wild'
          }
        ]
      }
    ]
  },
  {
    id: 'dwarf',
    name: 'Дварф',
    abilityScoreIncrease: {
      constitution: 2
    },
    speed: 25,
    size: 'medium',
    languages: ['common', 'dwarvish'],
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [
        'battleaxe',
        'handaxe',
        'light-hammer',
        'warhammer'
      ],
      armor: []
    },
    traits: [
      {
        id: 'darkvision',
        name: 'Тёмное зрение',
        type: 'darkvision',
        range: 60
      },
      {
        id: 'dwarven-resilience',
        name: 'Дварфийская устойчивость',
        type: 'dwarven-resilience'
      },
      {
        id: 'dwarven-combat-training',
        name: 'Дварфийская боевая подготовка',
        type: 'weapon-proficiency'
      },
      {
        id: 'stonecunning',
        name: 'Каменная смекалка',
        type: 'stonecunning'
      }
    ],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Холмовой дварф',
        abilityScoreIncrease: {
          wisdom: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'dwarven-toughness',
            name: 'Дварфийская стойкость',
            type: 'hit-point-increase',
            value: 1,
            perLevel: true
          }
        ]
      },
      {
        id: 'mountain-dwarf',
        name: 'Горный дварф',
        abilityScoreIncrease: {
          strength: 2
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: [
            'light'
          ]
        },
        traits: []
      }
    ]
  }
]