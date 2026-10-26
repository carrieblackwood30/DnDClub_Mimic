const createEmptyProficiencies = () => ({
  skills: [],
  tools: [],
  weapons: [],
  armor: []
})

const dragonbornAncestries = [
  ['black', 'Чёрный', 'acid'],
  ['blue', 'Синий', 'lightning'],
  ['brass', 'Латунный', 'fire'],
  ['bronze', 'Бронзовый', 'lightning'],
  ['copper', 'Медный', 'acid'],
  ['gold', 'Золотой', 'fire'],
  ['green', 'Зелёный', 'poison'],
  ['red', 'Красный', 'fire'],
  ['silver', 'Серебряный', 'cold'],
  ['white', 'Белый', 'cold']
].map(([id, name, damageType]) => ({
  id,
  name,
  damageType
}))

const dragonbornSubraces = dragonbornAncestries.map(ancestry => ({
  id: ancestry.id,
  name: ancestry.name,
  abilityScoreIncrease: {},
  proficiencies: createEmptyProficiencies(),
  traits: [
    {
      id: 'draconic-ancestry',
      name: 'Драконье наследие',
      type: 'draconic-ancestry',
      damageType: ancestry.damageType
    }
  ]
}))

const tieflingLineages = [
  {
    id: 'abyssal',
    name: 'Бездонное наследие',
    damageResistance: 'poison',
    cantrip: 'poison-spray',
    spells: [
      ['ray-of-sickness', 1, 3],
      ['hold-person', 2, 5]
    ]
  },
  {
    id: 'chthonic',
    name: 'Хтоническое наследие',
    damageResistance: 'necrotic',
    cantrip: 'chill-touch',
    spells: [
      ['false-life', 1, 3],
      ['ray-of-enfeeblement', 2, 5]
    ]
  },
  {
    id: 'infernal',
    name: 'Инфернальное наследие',
    damageResistance: 'fire',
    cantrip: 'fire-bolt',
    spells: [
      ['hellish-rebuke', 1, 3],
      ['darkness', 2, 5]
    ]
  }
].map(lineage => ({
  id: lineage.id,
  name: lineage.name,
  damageResistance: lineage.damageResistance,
  cantrip: {
    id: lineage.cantrip,
    level: 0,
    uses: 'at-will'
  },
  spells: lineage.spells.map(([id, level, characterLevel]) => ({
    id,
    level,
    characterLevel,
    freeCasts: 1,
    recharge: 'long-rest'
  }))
}))

const tieflingSubraces = tieflingLineages.map(lineage => ({
  id: lineage.id,
  name: lineage.name,
  abilityScoreIncrease: {},
  proficiencies: createEmptyProficiencies(),
  traits: [
    {
      id: 'fiendish-legacy',
      name: 'Инфернальное наследие',
      type: 'fiendish-legacy',
      abilityChoice: ['intelligence', 'wisdom', 'charisma'],
      alwaysPrepared: true,
      canCastWithSpellSlots: true,
      damageResistance: lineage.damageResistance,
      cantrip: { ...lineage.cantrip },
      spells: lineage.spells.map(spell => ({ ...spell }))
    }
  ]
}))


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
    subraces: [],
    variants: [
      {
        id: 'variant-human',
        name: 'Вариантный человек',
        optional: true,
        replaces: ['abilityScoreIncrease'],
        abilityScoreIncrease: {},
        abilityScoreChoice: {
          count: 2,
          amount: 1,
          distinct: true
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'variant-human-skill',
            name: 'Навык',
            type: 'skill-choice',
            count: 1,
            options: 'all-skills'
          },
          {
            id: 'variant-human-feat',
            name: 'Черта',
            type: 'feat-choice',
            count: 1
          }
        ]
      }
    ]
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
        type: 'trance',
        durationHours: 4
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
            spellList: 'wizard',
            count: 1,
            ability: 'intelligence'
          },
          {
            id: 'extra-language',
            name: 'Дополнительный язык',
            type: 'language-choice',
            count: 1
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
            id: 'fleet-of-foot',
            name: 'Быстрые ноги',
            type: 'speed-increase',
            value: 5
          },
          {
            id: 'mask-of-the-wild',
            name: 'Маска дикой природы',
            type: 'mask-of-the-wild'
          }
        ]
      },
      {
        id: 'drow',
        name: 'Тёмный эльф (дроу)',
        abilityScoreIncrease: {
          charisma: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [
            'rapier',
            'shortsword',
            'hand-crossbow'
          ],
          armor: []
        },
        traits: [
          {
            id: 'darkvision',
            name: 'Превосходное тёмное зрение',
            type: 'darkvision',
            range: 120
          },
          {
            id: 'sunlight-sensitivity',
            name: 'Чувствительность к солнечному свету',
            type: 'sunlight-sensitivity'
          },
          {
            id: 'drow-magic',
            name: 'Магия дроу',
            type: 'racial-spellcasting',
            ability: 'charisma',
            spells: [
              {
                id: 'dancing-lights',
                level: 0,
                characterLevel: 1,
                uses: 'at-will'
              },
              {
                id: 'faerie-fire',
                level: 1,
                characterLevel: 3,
                uses: 'once-per-long-rest'
              },
              {
                id: 'darkness',
                level: 2,
                characterLevel: 5,
                uses: 'once-per-long-rest'
              }
            ]
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
        id: 'tool-proficiency',
        name: 'Владение ремесленными инструментами',
        type: 'tool-choice',
        count: 1,
        options: [
          'smith-tools',
          'brewer-supplies',
          'mason-tools'
        ]
      },
      {
        id: 'stonecunning',
        name: 'Каменная смекалка',
        type: 'stonecunning',
        ability: 'intelligence',
        skill: 'history',
        proficiencyMultiplier: 2,
        appliesTo: 'stonework-origin'
      },
      {
        id: 'dwarven-speed',
        name: 'Скорость дварфа',
        type: 'speed-not-reduced-by-heavy-armor'
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
            'light',
            'medium'
          ]
        },
        traits: [
          {
            id: 'dwarven-armor-training',
            name: 'Дварфийское обучение владению бронёй',
            type: 'armor-proficiency',
            armor: [
              'light',
              'medium'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'halfling',
    name: 'Полурослик',
    abilityScoreIncrease: {
      dexterity: 2
    },
    speed: 25,
    size: 'small',
    languages: ['common', 'halfling'],
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [],
      armor: []
    },
    traits: [
      {
        id: 'lucky',
        name: 'Удачливость',
        type: 'reroll-natural-1',
        rollTypes: [
          'attack',
          'ability-check',
          'saving-throw'
        ],
        mustUseNewRoll: true
      },
      {
        id: 'brave',
        name: 'Храбрость',
        type: 'saving-throw-advantage',
        savingThrow: 'frightened'
      },
      {
        id: 'halfling-nimbleness',
        name: 'Проворство полурослика',
        type: 'move-through-larger-creatures'
      }
    ],
    subraces: [
      {
        id: 'lightfoot',
        name: 'Легконогий полурослик',
        abilityScoreIncrease: {
          charisma: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'naturally-stealthy',
            name: 'Природная скрытность',
            type: 'naturally-stealthy',
            hideBehindCreatureSize: 'larger'
          }
        ]
      },
      {
        id: 'stout',
        name: 'Коренастый полурослик',
        abilityScoreIncrease: {
          constitution: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'stout-resilience',
            name: 'Коренастая устойчивость',
            type: 'poison-resilience',
            savingThrowAdvantage: true,
            damageResistance: 'poison'
          }
        ]
      }
    ]
  },
  {
    id: 'dragonborn',
    name: 'Драконорождённый',
    abilityScoreIncrease: {},
    speed: 30,
    size: 'medium',
    sizeChoice: ['medium'],
    languages: [],
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [],
      armor: []
    },
    traits: [
      {
        id: 'draconic-ancestry',
        name: 'Драконье наследие',
        type: 'draconic-ancestry-choice',
        count: 1,
        options: dragonbornAncestries
      },
      {
        id: 'breath-weapon',
        name: 'Дыхание дракона',
        type: 'breath-weapon',
        action: 'replace-one-attack',
        areaChoice: [
          {
            shape: 'cone',
            length: 15
          },
          {
            shape: 'line',
            length: 30,
            width: 5
          }
        ],
        saveAbility: 'dexterity',
        saveDc: {
          base: 8,
          ability: 'constitution',
          addProficiencyBonus: true
        },
        damageTypeFromTrait: 'draconic-ancestry',
        damageProgression: [
          { level: 1, dice: '1d10' },
          { level: 5, dice: '2d10' },
          { level: 11, dice: '3d10' },
          { level: 17, dice: '4d10' }
        ],
        successfulSaveDamage: 'half',
        uses: {
          type: 'proficiency-bonus',
          recharge: 'long-rest'
        }
      },
      {
        id: 'draconic-damage-resistance',
        name: 'Сопротивление драконьему урону',
        type: 'damage-resistance-from-ancestry',
        damageTypeFromTrait: 'draconic-ancestry'
      },
      {
        id: 'darkvision',
        name: 'Тёмное зрение',
        type: 'darkvision',
        range: 60
      },
      {
        id: 'draconic-flight',
        name: 'Драконьи крылья',
        type: 'temporary-flight',
        unlockLevel: 5,
        action: 'bonus-action',
        durationMinutes: 10,
        flightSpeed: 'walking-speed',
        manifestation: 'spectral-wings',
        endsWhenIncapacitated: true,
        uses: 1,
        recharge: 'long-rest'
      }
    ],
    subraces: dragonbornSubraces
  },
  {
    id: 'gnome',
    name: 'Гном',
    abilityScoreIncrease: {
      intelligence: 2
    },
    speed: 25,
    size: 'small',
    languages: ['common', 'gnomish'],
    proficiencies: {
      skills: [],
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
        id: 'gnome-cunning',
        name: 'Гномья хитрость',
        type: 'saving-throw-advantage',
        savingThrows: [
          'intelligence',
          'wisdom',
          'charisma'
        ],
        against: 'magic'
      }
    ],
    subraces: [
      {
        id: 'forest-gnome',
        name: 'Лесной гном',
        abilityScoreIncrease: {
          dexterity: 1
        },
        proficiencies: {
          skills: [],
          tools: [],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'natural-illusionist',
            name: 'Природный иллюзионист',
            type: 'cantrip',
            spell: 'minor-illusion',
            ability: 'intelligence'
          },
          {
            id: 'speak-with-small-beasts',
            name: 'Разговор с маленькими зверями',
            type: 'speak-with-small-beasts',
            maximumSize: 'small',
            communication: 'simple-ideas'
          }
        ]
      },
      {
        id: 'rock-gnome',
        name: 'Скальный гном',
        abilityScoreIncrease: {
          constitution: 1
        },
        proficiencies: {
          skills: [],
          tools: [
            'tinkers-tools'
          ],
          weapons: [],
          armor: []
        },
        traits: [
          {
            id: 'artificers-lore',
            name: 'Знания изобретателя',
            type: 'skill-check-bonus',
            ability: 'intelligence',
            skill: 'history',
            proficiencyMultiplier: 2,
            appliesTo: [
              'magic-items',
              'alchemical-objects',
              'technological-devices'
            ]
          },
          {
            id: 'tinker',
            name: 'Мастер на все руки',
            type: 'tinker-devices',
            tool: 'tinkers-tools',
            craftingTimeHours: 1,
            materialCostGp: 10,
            deviceSize: 'tiny',
            deviceAc: 5,
            deviceHitPoints: 1,
            durationHours: 24,
            maximumActiveDevices: 3,
            canRepair: true,
            canDismantle: true,
            options: [
              'clockwork-toy',
              'fire-starter',
              'music-box'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'half-elf',
    name: 'Полуэльф',
    abilityScoreIncrease: {
      charisma: 2
    },
    abilityScoreChoice: {
      count: 2,
      amount: 1,
      distinct: true,
      exclude: ['charisma']
    },
    speed: 30,
    size: 'medium',
    languages: ['common', 'elvish', 'one-extra'],
    proficiencies: {
      skills: [],
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
        id: 'skill-versatility',
        name: 'Универсальность навыков',
        type: 'skill-choice',
        count: 2,
        options: 'all-skills'
      }
    ],
    subraces: []
  },
  {
    id: 'half-orc',
    name: 'Полуорк',
    abilityScoreIncrease: {
      strength: 2,
      constitution: 1
    },
    speed: 30,
    size: 'medium',
    languages: ['common', 'orc'],
    proficiencies: {
      skills: ['intimidation'],
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
        id: 'menacing',
        name: 'Устрашающий вид',
        type: 'skill-proficiency',
        skill: 'intimidation'
      },
      {
        id: 'relentless-endurance',
        name: 'Неукротимая выносливость',
        type: 'relentless-endurance',
        minimumHitPoints: 1,
        triggerHitPoints: 0,
        recharge: 'long-rest'
      },
      {
        id: 'savage-attacks',
        name: 'Дикость атак',
        type: 'savage-attacks',
        trigger: 'melee-weapon-critical-hit',
        additionalWeaponDamageDice: 1
      }
    ],
    subraces: []
  },
  {
    id: 'tiefling',
    name: 'Тифлинг',
    abilityScoreIncrease: {},
    speed: 30,
    size: 'medium',
    sizeChoice: ['medium', 'small'],
    languages: [],
    proficiencies: {
      skills: [],
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
        id: 'fiendish-legacy',
        name: 'Инфернальное наследие',
        type: 'fiendish-legacy-choice',
        count: 1,
        abilityChoice: [
          'intelligence',
          'wisdom',
          'charisma'
        ],
        alwaysPrepared: true,
        canCastWithSpellSlots: true,
        options: tieflingLineages
      },
      {
        id: 'otherworldly-presence',
        name: 'Потустороннее присутствие',
        type: 'cantrip',
        spell: 'thaumaturgy',
        abilityFromTrait: 'fiendish-legacy',
        uses: 'at-will'
      }
    ],
    subraces: tieflingSubraces
  }
]