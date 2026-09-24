export const useDice = () => {
  const normalizeMode = (mode) => {
    if (mode === 'advantage') {
      return 'advantage'
    }

    if (mode === 'disadvantage') {
      return 'disadvantage'
    }

    return 'normal'
  }

  const rollDie = (sides) => {
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

  const rollDice = (
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
      i++
    ) {
      rolls.push(
        rollDie(normalizedSides)
      )
    }

    const total = rolls.reduce(
      (sum, roll) =>
        sum + roll,
      0
    )

    return {
      rolls,
      total,
      count: normalizedCount,
      sides: normalizedSides
    }
  }

  const rollD20 = () => {
    return rollDie(20)
  }

  const rollD20ByMode = (
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

  const rollD20WithAdvantage = () => {
    return rollD20ByMode(
      'advantage'
    )
  }

  const rollD20WithDisadvantage = () => {
    return rollD20ByMode(
      'disadvantage'
    )
  }

  const getRollType = (roll) => {
    if (roll === 20) {
      return 'critical'
    }

    if (roll === 1) {
      return 'critical-fail'
    }

    return 'normal'
  }

  const rollCheck = (
    modifier = 0,
    mode = 'normal'
  ) => {
    const result =
      rollD20ByMode(mode)

    const rollType =
      getRollType(result.roll)

    return {
      rolls: result.rolls,
      roll: result.roll,
      modifier,
      total:
        result.roll +
        modifier,
      mode: result.mode,
      rollType,
      natural20:
        result.roll === 20,
      natural1:
        result.roll === 1,
      isCritical:
        result.roll === 20,
      isCriticalFail:
        result.roll === 1
    }
  }

  const parseDice = (dice) => {
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

  const parseFixedDamage = (
    damage
  ) => {
    if (
      typeof damage === 'number' &&
      Number.isFinite(damage)
    ) {
      return Math.max(
        0,
        damage
      )
    }

    if (
      typeof damage !== 'string'
    ) {
      return null
    }

    const value =
      damage.trim()

    if (
      !/^\d+$/.test(value)
    ) {
      return null
    }

    return Math.max(
      0,
      Number(value)
    )
  }

  const rollDamage = (
    dice,
    {
      critical = false
    } = {}
  ) => {
    const fixedDamage =
      parseFixedDamage(dice)

    if (
      fixedDamage !== null
    ) {
      return {
        rolls: [],
        total: fixedDamage,
        count: 0,
        sides: 0,
        dice,
        critical,
        isFixed: true
      }
    }

    const parsed =
      parseDice(dice)

    if (!parsed) {
      return null
    }

    const count =
      critical
        ? parsed.count * 2
        : parsed.count

    const result =
      rollDice(
        count,
        parsed.sides
      )

    return {
      ...result,
      dice,
      critical,
      isFixed: false
    }
  }

  return {
    rollD20,
    rollD20ByMode,
    rollD20WithAdvantage,
    rollD20WithDisadvantage,
    getRollType,
    rollCheck,
    rollDie,
    rollDice,
    parseDice,
    rollDamage
  }
}