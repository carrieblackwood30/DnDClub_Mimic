export const normalizeMode = (mode) => {
  if (mode === 'advantage') {
    return 'advantage'
  }

  if (mode === 'disadvantage') {
    return 'disadvantage'
  }

  return 'normal'
}

export const rollDie = (sides) => {
  const normalizedSides = Number(sides)

  if (
    !Number.isInteger(normalizedSides) ||
    normalizedSides <= 0
  ) {
    return null
  }

  return Math.floor(
    Math.random() * normalizedSides
  ) + 1
}

export const rollDice = (
  count,
  sides
) => {
  const normalizedCount = Number(count)
  const normalizedSides = Number(sides)

  if (
    !Number.isInteger(normalizedCount) ||
    normalizedCount <= 0 ||
    !Number.isInteger(normalizedSides) ||
    normalizedSides <= 0
  ) {
    return null
  }

  const rolls = []

  for (
    let i = 0;
    i < normalizedCount;
    i += 1
  ) {
    rolls.push(
      rollDie(normalizedSides)
    )
  }

  return {
    rolls,
    total: rolls.reduce(
      (sum, roll) =>
        sum + roll,
      0
    ),
    count: normalizedCount,
    sides: normalizedSides
  }
}

export const rollD20 = () => {
  return rollDie(20)
}

export const rollD20ByMode = (
  mode = 'normal'
) => {
  const normalizedMode =
    normalizeMode(mode)

  if (
    normalizedMode ===
    'advantage'
  ) {
    const first = rollD20()
    const second = rollD20()

    return {
      rolls: [
        first,
        second
      ],
      roll: Math.max(
        first,
        second
      ),
      mode: normalizedMode
    }
  }

  if (
    normalizedMode ===
    'disadvantage'
  ) {
    const first = rollD20()
    const second = rollD20()

    return {
      rolls: [
        first,
        second
      ],
      roll: Math.min(
        first,
        second
      ),
      mode: normalizedMode
    }
  }

  const roll = rollD20()

  return {
    rolls: [roll],
    roll,
    mode: normalizedMode
  }
}

export const parseDice = (
  dice
) => {
  if (
    typeof dice !== 'string'
  ) {
    return null
  }

  const match = dice
    .trim()
    .toLowerCase()
    .match(
      /^(\d+)d(\d+)$/
    )

  if (!match) {
    return null
  }

  const count =
    Number(match[1])

  const sides =
    Number(match[2])

  if (
    count <= 0 ||
    sides <= 0
  ) {
    return null
  }

  return {
    count,
    sides
  }
}

export const rollDiceExpression = (
  dice,
  fallback = {
    count: 1,
    sides: 1
  }
) => {
  const parsed =
    parseDice(dice) ??
    fallback

  const result =
    rollDice(
      parsed.count,
      parsed.sides
    )

  if (!result) {
    return {
      rolls: [],
      total: 0
    }
  }

  return result
}