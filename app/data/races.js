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

    abilities: [],

    subraces: []
  },

  {
    id: 'elf',
    name: 'Эльф',

    abilityScoreIncrease: {
      dexterity: 2
    },

    abilities: [
      {
        id: 'darkvision',
        name: 'Тёмное зрение'
      }
    ],

    subraces: [
      {
        id: 'high-elf',
        name: 'Высший эльф',

        abilityScoreIncrease: {
          intelligence: 1
        },

        abilities: [
          {
            id: 'cantrip',
            name: 'Знание заклинаний'
          }
        ]
      },

      {
        id: 'wood-elf',
        name: 'Лесной эльф',

        abilityScoreIncrease: {
          wisdom: 1
        },

        abilities: [
          {
            id: 'mask-of-the-wild',
            name: 'Маска дикой природы'
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

    abilities: [
      {
        id: 'darkvision',
        name: 'Тёмное зрение'
      }
    ],

    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Холмовой дварф',

        abilityScoreIncrease: {
          wisdom: 1
        },

        abilities: []
      },

      {
        id: 'mountain-dwarf',
        name: 'Горный дварф',

        abilityScoreIncrease: {
          strength: 2
        },

        abilities: []
      }
    ]
  }
]