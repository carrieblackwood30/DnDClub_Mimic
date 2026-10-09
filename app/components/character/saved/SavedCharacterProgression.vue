<script setup>
import {
  computed,
  ref
} from 'vue'

import {
  spells
} from '~/data/spells'

import {
  getCantripCount,
  getKnownSpellCount,
  getSpellbookLimit,
  getMaxSpellLevel,
  getSpellSlots
} from '~/domain/spells/spellcastingProgression'

import {
  isSpellAvailableToClass
} from '~/domain/spells/spellAvailability'

import {
  getAbilityModifier
} from '~/domain/character/statRules'

import {
  getExperienceProgress,
  getExperienceRequiredForLevel,
  canGainLevel,
  getLevelFeatures,
  getAbilityScoreImprovementLevels,
  getSubclassChoiceLevel,
  applyAbilityScoreImprovement,
  getSpellLevelUpRules
} from '~/domain/character/levelUpRules'

import {
  FEAT_OPTIONS
} from '~/data/levelProgression'

import {
  rollDie
} from '~/domain/combat/diceEngine'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },

  characterClass: {
    type: Object,
    default: null
  }
})

const charactersStore =
  useCharactersStore()

const {
  abilityModifiers
} = useSavedCharacterStats(
  computed(() =>
    props.character
  )
)

const experienceInput =
  ref('')

const modalOpen =
  ref(false)

const targetLevel =
  ref(null)

const hpMethod =
  ref('average')

const rolledHP =
  ref(null)

const choiceMode =
  ref('asi')

const firstAbility =
  ref('')

const secondAbility =
  ref('')

const featId =
  ref('')

const subclassId =
  ref('')

const selectedSpellIds =
  ref([])

const selectedCantripIds =
  ref([])

const selectedSpellbookIds =
  ref([])

const replaceSpellId =
  ref('')

const replacementSpellId =
  ref('')

const abilities = [
  {
    id: 'strength',
    name: 'Сила'
  },
  {
    id: 'dexterity',
    name: 'Ловкость'
  },
  {
    id: 'constitution',
    name: 'Телосложение'
  },
  {
    id: 'intelligence',
    name: 'Интеллект'
  },
  {
    id: 'wisdom',
    name: 'Мудрость'
  },
  {
    id: 'charisma',
    name: 'Харизма'
  }
]

const progress = computed(() => {
  return getExperienceProgress(
    props.character
      .experiencePoints
  )
})

const currentLevel =
  computed(() =>
    Number(
      props.character.level ?? 1
    )
  )

const canLevelUp =
  computed(() =>
    canGainLevel({
      experiencePoints:
        props.character
          .experiencePoints ?? 0,
      level:
        currentLevel.value
    })
  )

const nextLevel =
  computed(() => {
    if (
      currentLevel.value >= 20
    ) {
      return 20
    }

    return (
      currentLevel.value + 1
    )
  })

const nextLevelXP =
  computed(() =>
    getExperienceRequiredForLevel(
      nextLevel.value
    )
  )

const nextFeatures =
  computed(() => {
    if (
      !props.characterClass
    ) {
      return null
    }

    return getLevelFeatures({
      classId:
        props.characterClass.id,
      level:
        nextLevel.value
    })
  })

const needsASI =
  computed(() => {
    if (
      !props.characterClass
    ) {
      return false
    }

    return getAbilityScoreImprovementLevels(
      props.characterClass.id
    ).includes(
      nextLevel.value
    )
  })

const subclassLevel =
  computed(() =>
    props.characterClass
      ? getSubclassChoiceLevel(
          props.characterClass.id
        )
      : null
  )

const needsSubclass =
  computed(() => {
    return Boolean(
      props.characterClass &&
      subclassLevel.value ===
        nextLevel.value &&
      !props.character.subclassId
    )
  })

const spellcasting =
  computed(() =>
    props.characterClass
      ?.spellcasting ?? null
  )

const spellRules =
  computed(() =>
    props.characterClass
      ? getSpellLevelUpRules(
          props.characterClass.id
        )
      : {
          known: null,
          prepared: null
        }
  )

const hasSpellcasting =
  computed(() => {
    return Boolean(
      spellcasting.value
    )
  })

const updatedSpellSlots =
  spellcasting.value
    ? [
        ...getSpellSlots(
          spellcasting.value.slotProgression,
          nextLevel.value
        )
      ]
    : [
        ...(props.character
          .spellSlots ?? [])
      ]

const nextMaxSpellLevel =
  computed(() => {
    if (
      !spellcasting.value
    ) {
      return 0
    }

    return getMaxSpellLevel(
      spellcasting.value
        .slotProgression,
      nextLevel.value
    )
  })

const knownSpellNeed =
  computed(() => {
    if (
      spellcasting.value?.type !==
      'known'
    ) {
      return 0
    }

    const nextLimit =
      getKnownSpellCount(
        props.characterClass.id,
        nextLevel.value
      )

    if (
      nextLimit === null
    ) {
      return 0
    }

    const currentCount =
      props.character
        .knownSpellIds
        ?.length ?? 0

    return Math.max(
      0,
      nextLimit -
        currentCount
    )
  })

const cantripNeed =
  computed(() => {
    if (
      !spellcasting.value
    ) {
      return 0
    }

    const nextLimit =
      getCantripCount(
        props.characterClass.id,
        nextLevel.value
      )

    if (
      nextLimit === null
    ) {
      return 0
    }

    const currentCount =
      props.character
        .knownCantripIds
        ?.length ?? 0

    return Math.max(
      0,
      nextLimit -
        currentCount
    )
  })

const spellbookNeed =
  computed(() => {
    if (
      props.characterClass
        ?.spellcasting
        ?.spellbook
        ?.enabled === true
    ) {
      const nextLimit =
        getSpellbookLimit(
          props.characterClass.id,
          nextLevel.value
        )

      const currentCount =
        props.character
          .spellbookSpellIds
          ?.length ?? 0

      return Math.max(
        0,
        Number(
          nextLimit ?? 0
        ) -
          currentCount
      )
    }

    if (
      props.characterClass?.id ===
      'wizard'
    ) {
      const nextLimit =
        getSpellbookLimit(
          'wizard',
          nextLevel.value
        )

      const currentCount =
        props.character
          .spellbookSpellIds
          ?.length ?? 0

      return Math.max(
        0,
        Number(
          nextLimit ?? 0
        ) -
          currentCount
      )
    }

    return 0
  })

const availableLevelledSpells =
  computed(() => {
    if (
      !hasSpellcasting.value
    ) {
      return []
    }

    return spells.filter(
      spell => {
        if (
          spell.level <= 0
        ) {
          return false
        }

        if (
          spell.level >
          nextMaxSpellLevel.value
        ) {
          return false
        }

        if (
          !isSpellAvailableToClass(
            spell,
            props.characterClass.id
          )
        ) {
          return false
        }

        return true
      }
    )
  })

const availableCantrips =
  computed(() => {
    if (
      !hasSpellcasting.value
    ) {
      return []
    }

    return spells.filter(
      spell =>
        spell.level === 0 &&
        isSpellAvailableToClass(
          spell,
          props.characterClass.id
        )
    )
  })

const availableWizardSpells =
  computed(() => {
    return availableLevelledSpells.value
      .filter(
        spell =>
          !props.character
            .spellbookSpellIds
            ?.includes(
              spell.id
            )
      )
  })

const availableKnownSpells =
  computed(() => {
    return availableLevelledSpells.value
      .filter(
        spell =>
          !props.character
            .knownSpellIds
            ?.includes(
              spell.id
            )
      )
  })

const availableReplacementSpells =
  computed(() => {
    return availableLevelledSpells.value
      .filter(
        spell =>
          spell.id !==
            replaceSpellId.value &&
          !props.character
            .knownSpellIds
            ?.includes(
              spell.id
            )
      )
  })

const subclassOptions =
  computed(() =>
    props.characterClass
      ?.subclasses ?? []
  )

const formattedXP =
  computed(() =>
    new Intl.NumberFormat(
      'ru-RU'
    ).format(
      Number(
        props.character
          .experiencePoints ?? 0
      )
    )
  )

const hpAverage =
  computed(() => {
    const hitDie =
      Number(
        props.characterClass
          ?.hitDie ?? 0
      )

    return Math.floor(
      hitDie / 2
    ) + 1
  })

const constitutionModifier =
  computed(() => {
    return getAbilityModifier(
      props.character
        .abilityScores
        ?.constitution ?? 10
    )
  })

const chosenHPDie =
  computed(() => {
    if (
      hpMethod.value ===
      'roll'
    ) {
      return rolledHP.value
    }

    return hpAverage.value
  })

const hpGain =
  computed(() => {
    const dieResult =
      Number(
        chosenHPDie.value ?? 0
      )

    return Math.max(
      1,
      dieResult +
        constitutionModifier.value
    )
  })

const asiValid =
  computed(() => {
    if (
      !needsASI.value
    ) {
      return true
    }

    if (
      choiceMode.value ===
      'feat'
    ) {
      return Boolean(
        featId.value
      )
    }

    if (
      choiceMode.value ===
      'split'
    ) {
      if (
        !firstAbility.value ||
        !secondAbility.value
      ) {
        return false
      }

      if (
        firstAbility.value ===
        secondAbility.value
      ) {
        return false
      }

      return true
    }

    return Boolean(
      firstAbility.value
    )
  })

const spellChoicesValid =
  computed(() => {
    if (
      spellRules.value.known
    ) {
      if (
        selectedSpellIds.value
          .length !==
        knownSpellNeed.value
      ) {
        return false
      }

      if (
        selectedCantripIds.value
          .length !==
        cantripNeed.value
      ) {
        return false
      }

      if (
        replaceSpellId.value ||
        replacementSpellId.value
      ) {
        return Boolean(
          replaceSpellId.value &&
          replacementSpellId.value
        )
      }
    }

    if (
      props.characterClass?.id ===
      'wizard'
    ) {
      return (
        selectedSpellbookIds.value
          .length ===
        spellbookNeed.value
      )
    }

    return true
  })

const readyToApply =
  computed(() => {
    if (
      !modalOpen.value
    ) {
      return false
    }

    if (
      !hpMethod.value
    ) {
      return false
    }

    if (
      hpMethod.value ===
        'roll' &&
      !rolledHP.value
    ) {
      return false
    }

    if (
      !asiValid.value
    ) {
      return false
    }

    if (
      needsSubclass.value &&
      !subclassId.value
    ) {
      return false
    }

    if (
      !spellChoicesValid.value
    ) {
      return false
    }

    return true
  })

const addExperience = amount => {
  const current =
    Number(
      props.character
        .experiencePoints ?? 0
    )

  charactersStore.updateCharacter(
    props.character.id,
    {
      experiencePoints:
        Math.max(
          0,
          current +
            Number(amount)
        )
    }
  )
}

const addCustomExperience = () => {
  const amount =
    Number(
      experienceInput.value
    )

  if (
    !Number.isFinite(amount) ||
    amount === 0
  ) {
    return
  }

  addExperience(
    amount
  )

  experienceInput.value = ''
}

const openLevelUp = () => {
  if (
    !canLevelUp.value
  ) {
    return
  }

  targetLevel.value =
    nextLevel.value

  hpMethod.value =
    'average'

  rolledHP.value =
    null

  choiceMode.value =
    needsASI.value
      ? 'asi'
      : 'asi'

  firstAbility.value =
    ''

  secondAbility.value =
    ''

  featId.value =
    ''

  subclassId.value =
    props.character.subclassId ??
    ''

  selectedSpellIds.value =
    []

  selectedCantripIds.value =
    []

  selectedSpellbookIds.value =
    []

  replaceSpellId.value =
    ''

  replacementSpellId.value =
    ''

  modalOpen.value =
    true
}

const rollHP = () => {
  if (
    rolledHP.value
  ) {
    return
  }

  const hitDie =
    Number(
      props.characterClass
        ?.hitDie ?? 0
    )

  if (
    hitDie <= 0
  ) {
    return
  }

  rolledHP.value =
    rollDie(
      hitDie
    )
}

const toggleSpell = (
  spellId
) => {
  const index =
    selectedSpellIds.value
      .indexOf(
        spellId
      )

  if (
    index !== -1
  ) {
    selectedSpellIds.value =
      selectedSpellIds.value
        .filter(
          id =>
            id !== spellId
        )

    return
  }

  if (
    selectedSpellIds.value
      .length >=
    knownSpellNeed.value
  ) {
    return
  }

  selectedSpellIds.value =
    [
      ...selectedSpellIds.value,
      spellId
    ]
}

const toggleCantrip = (
  spellId
) => {
  const index =
    selectedCantripIds.value
      .indexOf(
        spellId
      )

  if (
    index !== -1
  ) {
    selectedCantripIds.value =
      selectedCantripIds.value
        .filter(
          id =>
            id !== spellId
        )

    return
  }

  if (
    selectedCantripIds.value
      .length >=
    cantripNeed.value
  ) {
    return
  }

  selectedCantripIds.value =
    [
      ...selectedCantripIds.value,
      spellId
    ]
}

const toggleSpellbookSpell = (
  spellId
) => {
  const index =
    selectedSpellbookIds.value
      .indexOf(
        spellId
      )

  if (
    index !== -1
  ) {
    selectedSpellbookIds.value =
      selectedSpellbookIds.value
        .filter(
          id =>
            id !== spellId
        )

    return
  }

  if (
    selectedSpellbookIds.value
      .length >=
    spellbookNeed.value
  ) {
    return
  }

  selectedSpellbookIds.value =
    [
      ...selectedSpellbookIds.value,
      spellId
    ]
}

const applyLevelUp = () => {
  if (
    !readyToApply.value
  ) {
    return
  }

  const abilityResult =
    needsASI.value &&
    choiceMode.value !==
      'feat'
      ? applyAbilityScoreImprovement({
          abilityScores:
            props.character
              .abilityScores ?? {},

          firstAbility:
            firstAbility.value,

          firstAmount:
            choiceMode.value ===
              'split'
              ? 1
              : 2,

          secondAbility:
            choiceMode.value ===
              'split'
              ? secondAbility.value
              : null,

          secondAmount:
            choiceMode.value ===
              'split'
              ? 1
              : 0
        })
      : {
          success: true,
          abilityScores:
            props.character
              .abilityScores ?? {}
        }

  if (
    !abilityResult.success
  ) {
    return
  }

  const nextKnownSpells = [
    ...(props.character
      .knownSpellIds ?? [])
  ]

  for (
    const spellId of
      selectedSpellIds.value
  ) {
    if (
      !nextKnownSpells
        .includes(
          spellId
        )
    ) {
      nextKnownSpells.push(
        spellId
      )
    }
  }

  if (
    replaceSpellId.value &&
    replacementSpellId.value
  ) {
    const replaceIndex =
      nextKnownSpells
        .indexOf(
          replaceSpellId.value
        )

    if (
      replaceIndex !== -1
    ) {
      nextKnownSpells[
        replaceIndex
      ] =
        replacementSpellId.value
    }
  }

  const nextCantrips = [
    ...(props.character
      .knownCantripIds ?? [])
  ]

  for (
    const spellId of
      selectedCantripIds.value
  ) {
    if (
      !nextCantrips.includes(
        spellId
      )
    ) {
      nextCantrips.push(
        spellId
      )
    }
  }

  const nextSpellbook = [
    ...(props.character
      .spellbookSpellIds ?? [])
  ]

  for (
    const spellId of
      selectedSpellbookIds.value
  ) {
    if (
      !nextSpellbook.includes(
        spellId
      )
    ) {
      nextSpellbook.push(
        spellId
      )
    }
  }

  const nextFeats = [
    ...(props.character
      .feats ?? [])
  ]

  if (
    choiceMode.value ===
      'feat' &&
    featId.value
  ) {
    if (
      !nextFeats.includes(
        featId.value
      )
    ) {
      nextFeats.push(
        featId.value
      )
    }
  }

  const nextHitPointRolls = {
    ...(props.character
      .hitPointRolls ?? {})
  }

  nextHitPointRolls[
    nextLevel.value
  ] =
    Number(
      chosenHPDie.value
    )

  const updatedSpellSlots =
    spellcasting.value
      ? [
          ...getSpellSlots(
            spellcasting.value.slotProgression,
            nextLevel.value
          )
        ]
      : [
          ...(props.character
            .spellSlots ?? [])
        ]

  const historyEntry = {
    level:
      nextLevel.value,

    hitPointMethod:
      hpMethod.value,

    hitPointDie:
      Number(
        chosenHPDie.value
      ),

    hitPointGain:
      hpGain.value,

    abilityScoreImprovement:
      needsASI.value
        ? choiceMode.value ===
          'feat'
          ? {
              type: 'feat',
              featId:
                featId.value
            }
          : {
              type: 'ability',
              firstAbility:
                firstAbility.value,
              firstAmount:
                choiceMode.value ===
                  'split'
                  ? 1
                  : 2,
              secondAbility:
                choiceMode.value ===
                  'split'
                  ? secondAbility.value
                  : null,
              secondAmount:
                choiceMode.value ===
                  'split'
                  ? 1
                  : 0
            }
        : null,

    subclassId:
      needsSubclass.value
        ? subclassId.value
        : props.character
            .subclassId ?? null,

    learnedSpellIds: [
      ...selectedSpellIds.value
    ],

    learnedCantripIds: [
      ...selectedCantripIds.value
    ],

    learnedSpellbookIds: [
      ...selectedSpellbookIds.value
    ],

    replacedSpellId:
      replaceSpellId.value ||
      null,

    replacementSpellId:
      replacementSpellId.value ||
      null
  }

  const nextHistory = [
    ...(props.character
      .levelHistory ?? []),
    historyEntry
  ]

  charactersStore.updateCharacter(
    props.character.id,
    {
      level:
        nextLevel.value,

      abilityScores:
        abilityResult.abilityScores,

      subclassId:
        needsSubclass.value
          ? subclassId.value
          : props.character
              .subclassId,

      feats:
        nextFeats,

      hitPointRolls:
        nextHitPointRolls,

      levelHistory:
        nextHistory,

      knownSpellIds:
        nextKnownSpells,

      knownCantripIds:
        nextCantrips,

      spellbookSpellIds:
        nextSpellbook,

      spellSlots:
        updatedSpellSlots
    }
  )

  modalOpen.value =
    false
}

const abilityCurrentValue = id => {
  return Number(
    props.character
      .abilityScores?.[id] ?? 10
  )
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] shadow-[0_16px_45px_rgba(0,0,0,0.25)]"
  >
    <div
      class="border-b border-[#392819] bg-[#170e08]/80 px-5 py-5 sm:px-7"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div
            class="text-[9px] font-black uppercase tracking-[0.22em] text-[#a07743]"
          >
            Прогресс героя
          </div>

          <h2
            class="mt-1 text-2xl font-black text-[#decfb2]"
          >
            Опыт и развитие
          </h2>
        </div>

        <div
          class="rounded-xl border border-[#6b4b28] bg-[#211408] px-4 py-3 text-right"
        >
          <div
            class="text-[9px] font-black uppercase tracking-[0.18em] text-[#8d6b42]"
          >
            Уровень
          </div>

          <div
            class="mt-1 text-3xl font-black text-[#dcb76f]"
          >
            {{ character.level }}
          </div>
        </div>
      </div>

      <div
        class="mt-5 grid gap-3 sm:grid-cols-3"
      >
        <div
          class="rounded-xl border border-[#3d2c1b] bg-[#0f0906]/70 p-4"
        >
          <div
            class="text-xs text-[#8d7a60]"
          >
            Опыт
          </div>

          <div
            class="mt-1 text-xl font-black text-[#e1cfaa]"
          >
            {{ formattedXP }} XP
          </div>
        </div>

        <div
          class="rounded-xl border border-[#3d2c1b] bg-[#0f0906]/70 p-4"
        >
          <div
            class="text-xs text-[#8d7a60]"
          >
            Следующий уровень
          </div>

          <div
            class="mt-1 text-xl font-black text-[#e1cfaa]"
          >
            {{
              progress.maxLevel
                ? 'Максимум'
                : `${nextLevelXP.toLocaleString('ru-RU')} XP`
            }}
          </div>
        </div>

        <div
          class="rounded-xl border border-[#3d2c1b] bg-[#0f0906]/70 p-4"
        >
          <div
            class="text-xs text-[#8d7a60]"
          >
            До уровня
          </div>

          <div
            class="mt-1 text-xl font-black text-[#dcb76f]"
          >
            {{
              progress.maxLevel
                ? '20'
                : `${progress.nextLevelXP - progress.currentXP} XP`
            }}
          </div>
        </div>
      </div>

      <div
        class="mt-5 h-3 overflow-hidden rounded-full border border-[#4e3621] bg-[#0b0805]"
      >
        <div
          class="h-full rounded-full bg-[linear-gradient(90deg,#76502a,#d0a45e)] transition-all"
          :style="{
            width: `${progress.progressPercent}%`
          }"
        />
      </div>

      <div
        class="mt-2 flex justify-between text-[11px] text-[#867257]"
      >
        <span>
          {{ progress.previousLevelXP.toLocaleString('ru-RU') }} XP
        </span>

        <span>
          {{
            progress.maxLevel
              ? '20 уровень'
              : progress.nextLevelXP.toLocaleString('ru-RU') + ' XP'
          }}
        </span>
      </div>
    </div>

    <div
      class="grid gap-4 p-5 sm:p-7"
    >
      <div
        class="grid gap-2 sm:grid-cols-4"
      >
        <button
          type="button"
          class="rounded-xl border border-[#604527] bg-[#211408] px-4 py-3 text-sm font-bold text-[#d9bf91] transition hover:border-[#a67b43] hover:bg-[#2c1a0d]"
          @click="addExperience(100)"
        >
          +100 XP
        </button>

        <button
          type="button"
          class="rounded-xl border border-[#604527] bg-[#211408] px-4 py-3 text-sm font-bold text-[#d9bf91] transition hover:border-[#a67b43] hover:bg-[#2c1a0d]"
          @click="addExperience(500)"
        >
          +500 XP
        </button>

        <button
          type="button"
          class="rounded-xl border border-[#604527] bg-[#211408] px-4 py-3 text-sm font-bold text-[#d9bf91] transition hover:border-[#a67b43] hover:bg-[#2c1a0d]"
          @click="addExperience(1000)"
        >
          +1000 XP
        </button>

        <button
          type="button"
          class="rounded-xl border border-[#604527] bg-[#211408] px-4 py-3 text-sm font-bold text-[#d9bf91] transition hover:border-[#a67b43] hover:bg-[#2c1a0d]"
          @click="addExperience(5000)"
        >
          +5000 XP
        </button>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row"
      >
        <input
          v-model="experienceInput"
          type="number"
          class="min-w-0 flex-1 rounded-xl border border-[#604527] bg-[#100a06] px-4 py-3 text-sm text-[#e5d5b5] outline-none placeholder:text-[#675641] focus:border-[#b7894e]"
          placeholder="Сколько XP добавить или снять"
        />

        <button
          type="button"
          class="rounded-xl border border-[#76532e] bg-[#39230f] px-5 py-3 text-sm font-black text-[#e8c987] transition hover:bg-[#4b2d13]"
          @click="addCustomExperience"
        >
          Добавить XP
        </button>
      </div>

      <div
        v-if="canLevelUp"
        class="rounded-2xl border border-[#806238] bg-[linear-gradient(135deg,#2a1b0d,#171006)] p-5"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div
              class="text-[9px] font-black uppercase tracking-[0.2em] text-[#b78b4e]"
            >
              Новый уровень доступен
            </div>

            <div
              class="mt-1 text-xl font-black text-[#ead5ad]"
            >
              Уровень {{ nextLevel }}
            </div>

            <div
              class="mt-1 text-sm text-[#99856a]"
            >
              Нужно пройти все выборы повышения уровня.
            </div>
          </div>

          <button
            type="button"
            class="rounded-xl border border-[#b68b50] bg-[#74502a] px-6 py-3 text-sm font-black text-[#f6dfac] transition hover:bg-[#8b612f]"
            @click="openLevelUp"
          >
            Повысить уровень
          </button>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-[#332519] bg-[#100a06]/60 px-4 py-3 text-sm text-[#81715c]"
      >
        До следующего уровня накопите
        {{
          Math.max(
            0,
            nextLevelXP -
              Number(character.experiencePoints ?? 0)
          )
        }}
        XP.
      </div>

      <div
        v-if="character.feats?.length"
        class="rounded-xl border border-[#3d2c1b] bg-[#100a06]/60 p-4"
      >
        <div
          class="text-xs font-black uppercase tracking-[0.16em] text-[#8e6a3e]"
        >
          Полученные черты
        </div>

        <div
          class="mt-3 flex flex-wrap gap-2"
        >
          <span
            v-for="feat in character.feats"
            :key="feat"
            class="rounded-lg border border-[#604527] bg-[#211408] px-3 py-2 text-sm text-[#d9c39c]"
          >
            {{
              FEAT_OPTIONS.find(
                item => item.id === feat
              )?.name ?? feat
            }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#72552f] bg-[linear-gradient(145deg,#21160d,#0e0906)] shadow-[0_25px_100px_rgba(0,0,0,0.7)]"
      >
        <div
          class="flex items-center justify-between border-b border-[#46301c] px-5 py-4 sm:px-7"
        >
          <div>
            <div
              class="text-[9px] font-black uppercase tracking-[0.22em] text-[#a07743]"
            >
              Возвышение героя
            </div>

            <h3
              class="mt-1 text-2xl font-black text-[#e2d0ae]"
            >
              Уровень {{ targetLevel }}
            </h3>
          </div>

          <button
            type="button"
            class="rounded-lg border border-[#513a24] px-3 py-2 text-[#aa9678] hover:bg-[#21150b]"
            @click="modalOpen = false"
          >
            ✕
          </button>
        </div>

        <div
          class="overflow-y-auto p-5 sm:p-7"
        >
          <div
            class="grid gap-5"
          >
            <section
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a7343]"
              >
                Что получает класс
              </div>

              <div
                class="mt-3 grid gap-2"
              >
                <div
                  v-if="nextFeatures?.classFeatures?.length"
                  class="grid gap-2"
                >
                  <div
                    v-for="feature in nextFeatures.classFeatures"
                    :key="feature"
                    class="rounded-xl border border-[#362619] bg-[#1a1009] px-4 py-3 text-sm font-bold text-[#d7c39e]"
                  >
                    {{ feature }}
                  </div>
                </div>

                <div
                  v-else
                  class="text-sm text-[#89755d]"
                >
                  На этом уровне отдельных классовых особенностей нет.
                </div>
              </div>
            </section>

            <section
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a7343]"
              >
                Хиты
              </div>

              <div
                class="mt-3 grid gap-3 sm:grid-cols-3"
              >
                <button
                  type="button"
                  class="rounded-xl border px-4 py-3 text-left"
                  :class="
                    hpMethod === 'average'
                      ? 'border-[#b48a4e] bg-[#382310] text-[#e9cb91]'
                      : 'border-[#423020] bg-[#190f08] text-[#9a856a]'
                  "
                  @click="hpMethod = 'average'"
                >
                  <div
                    class="font-black"
                  >
                    Среднее
                  </div>

                  <div
                    class="mt-1 text-sm"
                  >
                    {{ hpAverage }} + CON
                  </div>
                </button>

                <button
                  type="button"
                  class="rounded-xl border px-4 py-3 text-left"
                  :class="
                    hpMethod === 'roll'
                      ? 'border-[#b48a4e] bg-[#382310] text-[#e9cb91]'
                      : 'border-[#423020] bg-[#190f08] text-[#9a856a]'
                  "
                  @click="hpMethod = 'roll'"
                >
                  <div
                    class="font-black"
                  >
                    Бросок
                  </div>

                  <div
                    class="mt-1 text-sm"
                  >
                    1d{{ characterClass?.hitDie }}
                    + CON
                  </div>
                </button>

                <div
                  class="rounded-xl border border-[#3b2a1c] bg-[#190f08] px-4 py-3"
                >
                  <div
                    class="text-xs text-[#8e7960]"
                  >
                    Прирост HP
                  </div>

                  <div
                    class="mt-1 text-2xl font-black text-[#d7b46d]"
                  >
                    +{{ hpGain }}
                  </div>
                </div>
              </div>

              <div
                v-if="hpMethod === 'roll'"
                class="mt-3"
              >
                <button
                  type="button"
                  class="rounded-xl border border-[#74522d] bg-[#2b190b] px-5 py-3 text-sm font-black text-[#e5c68d]"
                  :disabled="Boolean(rolledHP)"
                  @click="rollHP"
                >
                  {{
                    rolledHP
                      ? `Выпало: ${rolledHP}`
                      : `Бросить d${characterClass?.hitDie}`
                  }}
                </button>
              </div>
            </section>

            <section
              v-if="needsASI"
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a7343]"
              >
                Улучшение характеристик
              </div>

              <div
                class="mt-3 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  class="rounded-lg border px-4 py-2 text-sm font-bold"
                  :class="
                    choiceMode === 'asi'
                      ? 'border-[#a77b42] bg-[#34200e] text-[#e5c488]'
                      : 'border-[#423020] text-[#927e62]'
                  "
                  @click="choiceMode = 'asi'"
                >
                  +2 к одной
                </button>

                <button
                  type="button"
                  class="rounded-lg border px-4 py-2 text-sm font-bold"
                  :class="
                    choiceMode === 'split'
                      ? 'border-[#a77b42] bg-[#34200e] text-[#e5c488]'
                      : 'border-[#423020] text-[#927e62]'
                  "
                  @click="choiceMode = 'split'"
                >
                  +1 и +1
                </button>

                <button
                  type="button"
                  class="rounded-lg border px-4 py-2 text-sm font-bold"
                  :class="
                    choiceMode === 'feat'
                      ? 'border-[#a77b42] bg-[#34200e] text-[#e5c488]'
                      : 'border-[#423020] text-[#927e62]'
                  "
                  @click="choiceMode = 'feat'"
                >
                  Взять черту
                </button>
              </div>

              <div
                v-if="choiceMode !== 'feat'"
                class="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <label class="block">
                  <span
                    class="mb-1 block text-xs text-[#8d785f]"
                  >
                    Первая характеристика
                  </span>

                  <select
                    v-model="firstAbility"
                    class="w-full rounded-xl border border-[#584025] bg-[#140c07] px-3 py-3 text-sm text-[#dfcda9]"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Выбрать
                    </option>

                    <option
                      v-for="ability in abilities"
                      :key="ability.id"
                      :value="ability.id"
                      :disabled="
                        abilityCurrentValue(ability.id) >= 20
                      "
                    >
                      {{ ability.name }}
                      ·
                      {{ abilityCurrentValue(ability.id) }}
                    </option>
                  </select>
                </label>

                <label
                  v-if="choiceMode === 'split'"
                  class="block"
                >
                  <span
                    class="mb-1 block text-xs text-[#8d785f]"
                  >
                    Вторая характеристика
                  </span>

                  <select
                    v-model="secondAbility"
                    class="w-full rounded-xl border border-[#584025] bg-[#140c07] px-3 py-3 text-sm text-[#dfcda9]"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Выбрать
                    </option>

                    <option
                      v-for="ability in abilities"
                      :key="ability.id"
                      :value="ability.id"
                      :disabled="
                        ability.id === firstAbility ||
                        abilityCurrentValue(ability.id) >= 20
                      "
                    >
                      {{ ability.name }}
                      ·
                      {{ abilityCurrentValue(ability.id) }}
                    </option>
                  </select>
                </label>
              </div>

              <div
                v-else
                class="mt-4 grid gap-3"
              >
                <button
                  v-for="feat in FEAT_OPTIONS"
                  :key="feat.id"
                  type="button"
                  class="rounded-xl border p-4 text-left transition"
                  :class="
                    featId === feat.id
                      ? 'border-[#a77b42] bg-[#34200e]'
                      : 'border-[#3e2b1d] bg-[#160d08] hover:border-[#72512f]'
                  "
                  @click="featId = feat.id"
                >
                  <div
                    class="font-black text-[#dec79d]"
                  >
                    {{ feat.name }}
                  </div>

                  <div
                    class="mt-1 text-sm text-[#89775f]"
                  >
                    {{ feat.description }}
                  </div>
                </button>
              </div>
            </section>

            <section
              v-if="needsSubclass"
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a7343]"
              >
                Подкласс
              </div>

              <select
                v-model="subclassId"
                class="mt-3 w-full rounded-xl border border-[#584025] bg-[#140c07] px-3 py-3 text-sm text-[#dfcda9]"
              >
                <option
                  value=""
                  disabled
                >
                  Выбрать подкласс
                </option>

                <option
                  v-for="subclass in subclassOptions"
                  :key="subclass.id"
                  :value="subclass.id"
                >
                  {{ subclass.name }}
                </option>
              </select>
            </section>

            <section
              v-if="hasSpellcasting"
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#9a7343]"
              >
                Заклинания
              </div>

              <div
                v-if="spellRules.known"
                class="mt-3 grid gap-4"
              >
                <div
                  v-if="knownSpellNeed > 0"
                >
                  <div
                    class="mb-2 text-sm font-black text-[#d7c29b]"
                  >
                    Новые заклинания:
                    {{ selectedSpellIds.length }}/{{ knownSpellNeed }}
                  </div>

                  <div
                    class="grid max-h-72 gap-2 overflow-y-auto pr-1"
                  >
                    <button
                      v-for="spell in availableKnownSpells"
                      :key="spell.id"
                      type="button"
                      class="rounded-xl border px-3 py-3 text-left text-sm"
                      :class="
                        selectedSpellIds.includes(spell.id)
                          ? 'border-[#9d7440] bg-[#34200e] text-[#e0c58f]'
                          : 'border-[#3c2a1b] bg-[#160d08] text-[#9b8569]'
                      "
                      @click="toggleSpell(spell.id)"
                    >
                      <div class="font-black">
                        {{ spell.name }}
                      </div>

                      <div
                        class="mt-1 text-xs opacity-70"
                      >
                        {{ spell.level === 0 ? 'Заговор' : `${spell.level} круг` }}
                      </div>
                    </button>
                  </div>
                </div>

                <div
                  v-if="cantripNeed > 0"
                >
                  <div
                    class="mb-2 text-sm font-black text-[#d7c29b]"
                  >
                    Новые заговоры:
                    {{ selectedCantripIds.length }}/{{ cantripNeed }}
                  </div>

                  <div
                    class="grid max-h-60 gap-2 overflow-y-auto pr-1"
                  >
                    <button
                      v-for="spell in availableCantrips"
                      :key="spell.id"
                      type="button"
                      class="rounded-xl border px-3 py-3 text-left text-sm"
                      :class="
                        selectedCantripIds.includes(spell.id)
                          ? 'border-[#9d7440] bg-[#34200e] text-[#e0c58f]'
                          : 'border-[#3c2a1b] bg-[#160d08] text-[#9b8569]'
                      "
                      @click="toggleCantrip(spell.id)"
                    >
                      {{ spell.name }}
                    </button>
                  </div>
                </div>

                <div
                  v-if="spellRules.known.replacementAtLevelUp"
                  class="rounded-xl border border-[#3b291b] bg-[#160d08] p-4"
                >
                  <div
                    class="text-sm font-black text-[#d7c29b]"
                  >
                    Можно заменить одно известное заклинание
                  </div>

                  <div
                    class="mt-3 grid gap-3 sm:grid-cols-2"
                  >
                    <select
                      v-model="replaceSpellId"
                      class="rounded-xl border border-[#584025] bg-[#140c07] px-3 py-3 text-sm text-[#dfcda9]"
                    >
                      <option value="">
                        Не заменять
                      </option>

                      <option
                        v-for="spellId in character.knownSpellIds ?? []"
                        :key="spellId"
                        :value="spellId"
                      >
                        {{
                          spells.find(
                            spell => spell.id === spellId
                          )?.name ?? spellId
                        }}
                      </option>
                    </select>

                    <select
                      v-model="replacementSpellId"
                      class="rounded-xl border border-[#584025] bg-[#140c07] px-3 py-3 text-sm text-[#dfcda9]"
                      :disabled="!replaceSpellId"
                    >
                      <option value="">
                        Новое заклинание
                      </option>

                      <option
                        v-for="spell in availableReplacementSpells"
                        :key="spell.id"
                        :value="spell.id"
                      >
                        {{ spell.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                v-else-if="characterClass?.id === 'wizard'"
                class="mt-3"
              >
                <div
                  class="mb-2 text-sm font-black text-[#d7c29b]"
                >
                  Заклинания в книгу:
                  {{ selectedSpellbookIds.length }}/{{ spellbookNeed }}
                </div>

                <div
                  class="grid max-h-72 gap-2 overflow-y-auto pr-1"
                >
                  <button
                    v-for="spell in availableWizardSpells"
                    :key="spell.id"
                    type="button"
                    class="rounded-xl border px-3 py-3 text-left text-sm"
                    :class="
                      selectedSpellbookIds.includes(spell.id)
                        ? 'border-[#9d7440] bg-[#34200e] text-[#e0c58f]'
                        : 'border-[#3c2a1b] bg-[#160d08] text-[#9b8569]'
                    "
                    @click="toggleSpellbookSpell(spell.id)"
                  >
                    <div class="font-black">
                      {{ spell.name }}
                    </div>

                    <div
                      class="mt-1 text-xs opacity-70"
                    >
                      {{ spell.level }} круг
                    </div>
                  </button>
                </div>
              </div>

              <div
                v-if="spellRules.prepared"
                class="mt-4 rounded-xl border border-[#3b291b] bg-[#160d08] p-4 text-sm text-[#a18c70]"
              >
                Подготовленные заклинания можно изменить после
                продолжительного отдыха. На уровне {{ targetLevel }}
                количество доступных ячеек обновлено автоматически.
              </div>

              <div
                v-if="spellRules.prepared"
                class="mt-3 flex flex-wrap gap-2 text-xs text-[#87735a]"
              >
                <span
                  v-for="(slots, index) in nextSpellSlots"
                  :key="index"
                  class="rounded-lg border border-[#3c2a1b] bg-[#180f09] px-3 py-2"
                >
                  {{ index + 1 }} круг:
                  {{ slots }}
                </span>
              </div>
            </section>

            <section
              class="rounded-2xl border border-[#46301d] bg-[#110a06]/70 p-5"
            >
              <div
                class="grid gap-3 sm:grid-cols-3"
              >
                <div>
                  <div
                    class="text-xs text-[#88735b]"
                  >
                    Новый уровень
                  </div>

                  <div
                    class="mt-1 text-xl font-black text-[#d9ba78]"
                  >
                    {{ targetLevel }}
                  </div>
                </div>

                <div>
                  <div
                    class="text-xs text-[#88735b]"
                  >
                    Куб хитов
                  </div>

                  <div
                    class="mt-1 text-xl font-black text-[#d9ba78]"
                  >
                    d{{ characterClass?.hitDie }}
                  </div>
                </div>

                <div>
                  <div
                    class="text-xs text-[#88735b]"
                  >
                    Прирост HP
                  </div>

                  <div
                    class="mt-1 text-xl font-black text-[#d9ba78]"
                  >
                    +{{ hpGain }}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div
          class="flex flex-col gap-3 border-t border-[#46301c] bg-[#120b07] px-5 py-4 sm:flex-row sm:justify-end sm:px-7"
        >
          <button
            type="button"
            class="rounded-xl border border-[#493422] px-5 py-3 text-sm font-bold text-[#927e63] hover:bg-[#1f130b]"
            @click="modalOpen = false"
          >
            Отмена
          </button>

          <button
            type="button"
            class="rounded-xl border border-[#a67b43] bg-[#76502a] px-6 py-3 text-sm font-black text-[#f0d39a] transition hover:bg-[#8b612f] disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!readyToApply"
            @click="applyLevelUp"
          >
            Применить уровень
          </button>
        </div>
      </div>
    </div>
  </section>
</template> 