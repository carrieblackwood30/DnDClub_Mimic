import {
  EXPERIENCE_THRESHOLDS,
  CLASS_ASI_LEVELS,
  SUBCLASS_LEVELS,
  LEVEL_UP_SPELL_RULES,
  CLASS_LEVEL_FEATURES
} from '~/data/levelProgression'

const normalizeLevel = level => {
  const value = Number(level ?? 1)

  return Math.min(
    20,
    Math.max(
      1,
      Number.isFinite(value)
        ? value
        : 1
    )
  )
}

const normalizeClassId = classId => {
  return String(
    classId ?? ''
  )
    .trim()
    .toLowerCase()
}

export const getExperienceRequiredForLevel = level => {
  const normalizedLevel =
    normalizeLevel(level)

  return (
    EXPERIENCE_THRESHOLDS[
      normalizedLevel
    ] ?? EXPERIENCE_THRESHOLDS[20]
  )
}

export const getLevelForExperience = experience => {
  const xp = Math.max(
    0,
    Number(experience ?? 0)
  )

  let level = 1

  for (
    let currentLevel = 1;
    currentLevel <= 20;
    currentLevel += 1
  ) {
    const required =
      EXPERIENCE_THRESHOLDS[
        currentLevel
      ]

    if (
      xp >= required
    ) {
      level = currentLevel
    } else {
      break
    }
  }

  return level
}

export const getExperienceProgress = experience => {
  const xp = Math.max(
    0,
    Number(experience ?? 0)
  )

  const level =
    getLevelForExperience(xp)

  if (
    level >= 20
  ) {
    return {
      level: 20,
      currentXP: xp,
      previousLevelXP:
        EXPERIENCE_THRESHOLDS[20],
      nextLevelXP:
        EXPERIENCE_THRESHOLDS[20],
      gainedXP: 0,
      requiredXP: 0,
      progressPercent: 100,
      maxLevel: true
    }
  }

  const previousLevelXP =
    EXPERIENCE_THRESHOLDS[level]

  const nextLevelXP =
    EXPERIENCE_THRESHOLDS[level + 1]

  const gainedXP =
    Math.max(
      0,
      xp - previousLevelXP
    )

  const requiredXP =
    Math.max(
      0,
      nextLevelXP - previousLevelXP
    )

  const progressPercent =
    requiredXP <= 0
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            gainedXP /
              requiredXP *
              100
          )
        )

  return {
    level,
    currentXP: xp,
    previousLevelXP,
    nextLevelXP,
    gainedXP,
    requiredXP,
    progressPercent,
    maxLevel: false
  }
}

export const canGainLevel = ({
  experiencePoints = 0,
  level = 1
} = {}) => {
  return (
    getLevelForExperience(
      experiencePoints
    ) > normalizeLevel(level)
  )
}

export const getClassFeaturesAtLevel = ({
  classId,
  level
} = {}) => {
  const normalizedClassId =
    normalizeClassId(classId)

  const normalizedLevel =
    normalizeLevel(level)

  const classFeatures =
    CLASS_LEVEL_FEATURES[
      normalizedClassId
    ] ?? {}

  return (
    classFeatures[
      normalizedLevel
    ] ?? []
  )
}

export const getFeaturesBetweenLevels = ({
  classId,
  fromLevel,
  toLevel
} = {}) => {
  const start =
    normalizeLevel(fromLevel)

  const end =
    normalizeLevel(toLevel)

  const result = []

  for (
    let level = start + 1;
    level <= end;
    level += 1
  ) {
    const features =
      getClassFeaturesAtLevel({
        classId,
        level
      })

    result.push({
      level,
      features
    })
  }

  return result
}

export const hasAbilityScoreImprovement = ({
  classId,
  level
} = {}) => {
  const normalizedClassId =
    normalizeClassId(classId)

  const normalizedLevel =
    normalizeLevel(level)

  return (
    CLASS_ASI_LEVELS[
      normalizedClassId
    ] ?? []
  ).includes(
    normalizedLevel
  )
}

export const getAbilityScoreImprovementLevels = classId => {
  const normalizedClassId =
    normalizeClassId(classId)

  return (
    CLASS_ASI_LEVELS[
      normalizedClassId
    ] ?? []
  )
}

export const getSubclassChoiceLevel = classId => {
  const normalizedClassId =
    normalizeClassId(classId)

  return (
    SUBCLASS_LEVELS[
      normalizedClassId
    ] ?? null
  )
}

export const hasSubclassChoice = ({
  classId,
  level
} = {}) => {
  const subclassLevel =
    getSubclassChoiceLevel(
      classId
    )

  if (
    subclassLevel === null
  ) {
    return false
  }

  return (
    normalizeLevel(level) ===
    subclassLevel
  )
}

export const getSpellLevelUpRules = classId => {
  const normalizedClassId =
    normalizeClassId(classId)

  return {
    known:
      LEVEL_UP_SPELL_RULES.known[
        normalizedClassId
      ] ?? null,

    prepared:
      LEVEL_UP_SPELL_RULES.prepared[
        normalizedClassId
      ] ?? null
  }
}

export const getLevelFeatures = ({
  classId,
  level
} = {}) => {
  const normalizedClassId =
    normalizeClassId(classId)

  const normalizedLevel =
    normalizeLevel(level)

  return {
    level:
      normalizedLevel,

    classFeatures:
      getClassFeaturesAtLevel({
        classId:
          normalizedClassId,
        level:
          normalizedLevel
      }),

    abilityScoreImprovement:
      hasAbilityScoreImprovement({
        classId:
          normalizedClassId,
        level:
          normalizedLevel
      }),

    subclass:
      hasSubclassChoice({
        classId:
          normalizedClassId,
        level:
          normalizedLevel
      }),

    spellRules:
      getSpellLevelUpRules(
        normalizedClassId
      )
  }
}

export const validateAbilityScoreImprovement = ({
  abilityScores = {},
  ability = null,
  amount = 0
} = {}) => {
  if (!ability) {
    return {
      valid: false,
      reason: 'Характеристика не выбрана.'
    }
  }

  const current =
    Number(
      abilityScores[ability] ?? 0
    )

  const value =
    Number(amount ?? 0)

  if (
    !Number.isFinite(current)
  ) {
    return {
      valid: false,
      reason: 'Текущее значение характеристики некорректно.'
    }
  }

  if (
    value <= 0
  ) {
    return {
      valid: false,
      reason: 'Изменение должно быть положительным.'
    }
  }

  if (
    current + value > 20
  ) {
    return {
      valid: false,
      reason: 'Характеристика не может превысить 20.'
    }
  }

  return {
    valid: true,
    reason: null
  }
}

export const applyAbilityScoreImprovement = ({
  abilityScores = {},
  firstAbility = null,
  firstAmount = 0,
  secondAbility = null,
  secondAmount = 0
} = {}) => {
  const next = {
    ...abilityScores
  }

  const firstValidation =
    validateAbilityScoreImprovement({
      abilityScores:
        next,
      ability:
        firstAbility,
      amount:
        firstAmount
    })

  if (
    !firstValidation.valid
  ) {
    return {
      success: false,
      abilityScores:
        abilityScores,
      reason:
        firstValidation.reason
    }
  }

  next[firstAbility] =
    Number(
      next[firstAbility] ?? 0
    ) +
    Number(firstAmount)

  if (
    secondAbility
  ) {
    const secondValidation =
      validateAbilityScoreImprovement({
        abilityScores:
          next,
        ability:
          secondAbility,
        amount:
          secondAmount
      })

    if (
      !secondValidation.valid
    ) {
      return {
        success: false,
        abilityScores:
          abilityScores,
        reason:
          secondValidation.reason
      }
    }

    next[secondAbility] =
      Number(
        next[secondAbility] ?? 0
      ) +
      Number(secondAmount)
  }

  return {
    success: true,
    abilityScores: next,
    reason: null
  }
}