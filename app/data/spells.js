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

    resolution: {
      type: 'effect',
      targetType: 'point-or-object'
    },

    effect: {
      type: 'mage-hand',

      maxWeight: 10,
      weightUnit: 'pounds',

      canManipulateObjects: true,
      canOpenUnlockedDoors: true,
      canRetrieveObjects: true,
      canPourContents: true,

      cannotAttack: true,
      cannotActivateMagicItems: true,

      movementPerAction: 30,
      movementUnit: 'feet'
    },

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

    resolution: {
      type: 'attack',
      attackType: 'ranged-spell',

      canCrit: true,

      critical: {
        type: 'double-damage-dice'
      }
    },

    damage: {
      dice: '1d10',
      type: 'fire',

      scaling: {
        characterLevels: {
          5: '2d10',
          11: '3d10',
          17: '4d10'
        }
      }
    },

    effects: [
      {
        type: 'ignite-flammable-object',

        requiresWornOrCarried: false
      }
    ],

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

    components: ['V', 'S'],

    duration: 'instantaneous',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'attack',
      attackType: 'ranged-spell',

      canCrit: true,

      critical: {
        type: 'double-damage-dice'
      }
    },

    damage: {
      dice: '1d8',
      type: 'cold',

      scaling: {
        characterLevels: {
          5: '2d8',
          11: '3d8',
          17: '4d8'
        }
      }
    },

    effects: [
      {
        type: 'speed-reduction',

        value: 10,
        unit: 'feet',

        duration: 'until-start-of-caster-next-turn'
      }
    ],

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

    resolution: {
      type: 'attack',
      attackType: 'melee-spell',

      canCrit: true,

      critical: {
        type: 'double-damage-dice'
      }
    },

    attackModifiers: [
      {
        type: 'advantage',
        condition: 'target-wearing-metal-armor'
      }
    ],

    damage: {
      dice: '1d8',
      type: 'lightning',

      scaling: {
        characterLevels: {
          5: '2d8',
          11: '3d8',
          17: '4d8'
        }
      }
    },

    effects: [
      {
        type: 'prevent-reaction',

        duration: 'until-start-of-target-next-turn'
      }
    ],

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

    components: [
      'V',
      'M'
    ],

    material: {
      description: 'светлячок или фосфоресцирующий мох',
      consumed: false,
      cost: 0
    },

    duration: '1-hour',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'effect',
      targetType: 'object'
    },

    effect: {
      type: 'light',

      brightLightRadius: 20,
      dimLightRadius: 20,

      radiusUnit: 'feet',

      objectSizeLimit: {
        dimension: 10,
        unit: 'feet'
      },

      canBeCovered: true,
      canBeDismissed: true
    },

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

    components: [
      'S',
      'M'
    ],

    material: {
      description: 'немного шерсти',
      consumed: false,
      cost: 0
    },

    duration: '1-minute',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'effect'
    },

    effect: {
      type: 'minor-illusion',

      modes: [
        'sound',
        'image'
      ],

      canCreateObjectImage: true,
      canCreateCreatureImage: false,

      imageSize: {
        maxDimension: 5,
        unit: 'feet'
      },

      soundVolume: 'normal',

      cannotCreateDamage: true,
      cannotCreateLight: true,
      cannotCreateHeat: true,
      cannotCreateSmell: true,

      physicalInteractionRevealsIllusion: true
    },

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

    resolution: {
      type: 'effect'
    },

    effect: {
      type: 'prestidigitation',

      durationLimit: 1,
      durationUnit: 'hour',

      possibleEffects: [
        'sensory-effect',
        'light-or-snuff-flame',
        'clean-or-soil-object',
        'chill-warm-flavor',
        'mark-object',
        'minor-nonmagical-trinket',
        'harmless-sensory-effect'
      ],

      simultaneousEffectsLimit: 3
    },

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

    components: [
      'V',
      'S',
      'M'
    ],

    material: {
      description: 'кусочек медной проволоки',
      consumed: false,
      cost: 0
    },

    duration: '1-round',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'effect',
      targetType: 'creature'
    },

    effect: {
      type: 'message',

      requiresPointingAtTarget: true,

      whisperOnly: true,

      recipientCanReply: true,

      replyRequiresReaction: true,

      blockedByTotalCover: true,

      targetCanReceiveMessageIfUnseen: true
    },

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

    reactionTrigger: [
      'hit-by-attack',
      'targeted-by-magic-missile'
    ],

    range: 'self',

    components: [
      'V',
      'S'
    ],

    duration: '1-round',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'reaction'
    },

    effect: {
      type: 'ac-bonus',

      value: 5,

      duration: 'until-start-of-caster-next-turn',

      appliesToTriggeringAttack: true,

      affectsCriticalHit: true,

      preventsDamageFromMagicMissile: true
    },

    secondaryEffects: [
      {
        type: 'negate-magic-missile-damage'
      }
    ],

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

    components: [
      'V',
      'S'
    ],

    duration: 'instantaneous',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'automatic-hit',

      canCrit: false,

      requiresAttackRoll: false,
      requiresSavingThrow: false
    },

    damage: {
      dice: '1d4',
      modifier: 1,
      type: 'force',

      instances: 3,

      simultaneous: true
    },

    targeting: {
      type: 'creature',

      visibleTargetRequired: true,

      maxTargetsPerCast: 3,

      canTargetSameCreatureMultipleTimes: true
    },

    scaling: {
      type: 'additional-instances',

      value: 1,

      perSlotLevelAbove: 1
    },

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

    components: [
      'V',
      'S'
    ],

    duration: '10-minutes',
    concentration: true,
    ritual: true,

    resolution: {
      type: 'effect'
    },

    effect: {
      type: 'detect-magic',

      detectionRange: 30,
      rangeUnit: 'feet',

      detectsMagicAuras: true,

      canDetectSchoolOfMagic: true,

      requiresLineOfSightForDetailedInformation: true
    },

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

    components: [
      'V',
      'S',
      'M'
    ],

    material: {
      description:
        '10 gp worth of charcoal, incense, and herbs that must be consumed by a brass brazier',
      consumed: true,
      cost: 10,
      currency: 'gp'
    },

    duration: 'instantaneous',
    concentration: false,
    ritual: true,

    resolution: {
      type: 'effect'
    },

    effect: {
      type: 'summon-familiar',

      duration: 'until-dismissed-or-dies',

      familiarTypes: [
        'bat',
        'cat',
        'crab',
        'frog',
        'hawk',
        'lizard',
        'octopus',
        'owl',
        'poisonous-snake',
        'fish',
        'rat',
        'raven',
        'sea-horse',
        'spider',
        'weasel'
      ],

      telepathicCommunication: true,

      telepathicRange: 100,
      telepathicRangeUnit: 'feet',

      canDeliverTouchSpells: true,

      touchSpellRange: true,

      familiarCannotAttack: true,

      familiarActsOnOwnInitiative: true,

      dismissAction: 'action',

      temporaryDismissal: true,

      pocketDimension: true
    },

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

    components: [
      'V',
      'S',
      'M'
    ],

    material: {
      description:
        'pearl worth at least 100 gp and an owl feather',
      consumed: false,
      cost: 100,
      currency: 'gp'
    },

    duration: 'instantaneous',
    concentration: false,
    ritual: true,

    resolution: {
      type: 'effect',
      targetType: 'object-or-magic-item'
    },

    effect: {
      type: 'identify-magic-item',

      identifiesMagicProperties: true,

      identifiesAttunementRequirements: true,

      identifiesCharges: true,

      identifiesCommandWords: true,

      identifiesSpellsAffectingItem: true,

      identifiesCurses: false,

      identifiesCreatureProperties: false
    },

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
    range: '60-feet',
    components: ['V', 'S', 'M'],
    material: 'щепотка песка или лепестков роз',
    duration: 'concentration-1-minute',
    concentration: true,
    ritual: false,
    target: {
      type: 'creatures-in-area'
    },
    area: {
      type: 'sphere',
      radius: 5,
      unit: 'feet'
    },
    resolution: {
      type: 'saving-throw',
      ability: 'wisdom'
    },
    special: {
      type: 'sleep-2024',
      firstSaveCondition: 'incapacitated',
      secondSaveCondition: 'unconscious',
      firstSaveDuration: 'until-end-of-next-turn',
      secondSaveDuration: 'until-spell-ends',
      endsOnDamage: true,
      endsOnActionWake: true,
      sleepImmuneAutoSuccess: true
    },
    classes: ['bard', 'sorcerer', 'wizard']
  },

  {
    id: 'thunderwave',
    name: 'Громовая волна',
    level: 1,
    school: 'evocation',

    castingTime: '1-action',

    range: 'self',

    area: {
      type: 'cube',
      size: 15,
      unit: 'feet',
      origin: 'caster'
    },

    target: {
      type: 'creatures-in-area'
    },

    components: [
      'V',
      'S'
    ],

    duration: 'instantaneous',
    concentration: false,
    ritual: false,

    resolution: {
      type: 'saving-throw',

      ability: 'constitution',

      canCrit: false,

      onSave: 'half',

      onFailedSave: 'full'
    },

    damage: {
      dice: '2d8',
      type: 'thunder',

      onSave: 'half'
    },

    effects: [
      {
        type: 'push',

        distance: 10,

        unit: 'feet',

        on: 'failed-save',

        direction: 'away-from-caster'
      }
    ],

    scaling: {
      type: 'additional-dice',

      dice: '1d8',

      perSlotLevelAbove: 1
    },

    secondaryEffects: [
      {
        type: 'push-unsecured-objects',

        distance: 10,

        unit: 'feet',

        onlyCompletelyInsideArea: true
      },

      {
        type: 'sound',

        audibleRange: 300,

        unit: 'feet'
      }
    ],

    classes: [
      'bard',
      'druid',
      'sorcerer',
      'wizard'
    ]
  }
]