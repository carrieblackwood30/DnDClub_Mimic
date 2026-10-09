const normalizeLevel = level => {
  const value = Number(level ?? 1)

  return Math.min(
    20,
    Math.max(
      1,
      Number.isFinite(value) ? value : 1
    )
  )
}

export const getFightingStyleACBonus = ({
  classId,
  level = 1,
  armor = null,
  classChoices = {}
} = {}) => {
  if (!armor) {
    return 0
  }

  if (
    classChoices.fightingStyle !== 'defense'
  ) {
    return 0
  }

  const normalizedLevel =
    normalizeLevel(level)

  const canUseStyle =
    classId === 'fighter' ||
    (
      ['paladin', 'ranger'].includes(classId) &&
      normalizedLevel >= 2
    )

  return canUseStyle ? 1 : 0
}

export const getClassSpeedBonus = ({
  classId,
  level = 1,
  armor = null,
  shield = null
} = {}) => {
  const normalizedLevel =
    normalizeLevel(level)

  if (classId === 'barbarian') {
    if (
      normalizedLevel >= 5 &&
      armor?.type !== 'heavy'
    ) {
      return 10
    }

    return 0
  }

  if (classId === 'monk') {
    if (
      normalizedLevel < 2 ||
      armor ||
      shield
    ) {
      return 0
    }

    if (normalizedLevel >= 18) return 30
    if (normalizedLevel >= 14) return 25
    if (normalizedLevel >= 10) return 20
    if (normalizedLevel >= 6) return 15

    return 10
  }

  return 0
}

export const getCharacterSpeed = ({
  baseSpeed = 30,
  classId = null,
  level = 1,
  armor = null,
  shield = null
} = {}) => {
  return (
    Number(baseSpeed ?? 30) +
    getClassSpeedBonus({
      classId,
      level,
      armor,
      shield
    })
  )
}