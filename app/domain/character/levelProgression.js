export const EXPERIENCE_THRESHOLDS = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
}

export const getExperienceForLevel = level => {
  return EXPERIENCE_THRESHOLDS[
    Math.max(
      1,
      Math.min(
        20,
        Number(level ?? 1)
      )
    )
  ] ?? 0
}

export const getLevelForExperience = experiencePoints => {
  const experience = Math.max(
    0,
    Number(experiencePoints ?? 0)
  )

  let level = 1

  for (
    let candidate = 1;
    candidate <= 20;
    candidate += 1
  ) {
    if (
      experience >=
      EXPERIENCE_THRESHOLDS[candidate]
    ) {
      level = candidate
    }
  }

  return level
}

export const getExperienceProgress = (
  experiencePoints,
  level
) => {
  const currentLevel = Math.max(
    1,
    Math.min(
      20,
      Number(level ?? 1)
    )
  )

  const experience = Math.max(
    0,
    Number(experiencePoints ?? 0)
  )

  const currentThreshold =
    getExperienceForLevel(
      currentLevel
    )

  const nextThreshold =
    currentLevel >= 20
      ? null
      : getExperienceForLevel(
          currentLevel + 1
        )

  if (
    nextThreshold === null
  ) {
    return {
      currentThreshold,
      nextThreshold: null,
      currentXP: experience,
      gainedXP: Math.max(
        0,
        experience - currentThreshold
      ),
      requiredXP: 0,
      progress: 1,
      isMaxLevel: true
    }
  }

  const requiredXP =
    nextThreshold -
    currentThreshold

  const gainedXP =
    Math.max(
      0,
      experience - currentThreshold
    )

  return {
    currentThreshold,
    nextThreshold,
    currentXP: experience,
    gainedXP,
    requiredXP,
    progress: Math.min(
      1,
      gainedXP / requiredXP
    ),
    isMaxLevel: false
  }
}

export const canLevelUp = (
  experiencePoints,
  level
) => {
  const currentLevel = Number(
    level ?? 1
  )

  if (
    currentLevel >= 20
  ) {
    return false
  }

  return (
    Number(experiencePoints ?? 0) >=
    getExperienceForLevel(
      currentLevel + 1
    )
  )
}