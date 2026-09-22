export const useDice = () => {
  const rollD20 = () => {
    return Math.floor(
      Math.random() * 20
    ) + 1
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

  const rollD20WithAdvantage = () => {
    const first = rollD20()
    const second = rollD20()

    const result = Math.max(
      first,
      second
    )

    return {
      rolls: [first, second],
      result
    }
  }

  const rollD20WithDisadvantage = () => {
    const first = rollD20()
    const second = rollD20()

    const result = Math.min(
      first,
      second
    )

    return {
      rolls: [first, second],
      result
    }
  }

  const rollCheck = (
    modifier = 0,
    mode = 'normal'
  ) => {
    let roll
    let rolls

    if (mode === 'advantage') {
      const result =
        rollD20WithAdvantage()

      rolls = result.rolls
      roll = result.result
    } else if (
      mode === 'disadvantage'
    ) {
      const result =
        rollD20WithDisadvantage()

      rolls = result.rolls
      roll = result.result
    } else {
      roll = rollD20()
      rolls = [roll]
    }

    const rollType =
      getRollType(roll)

    return {
      rolls,
      roll,
      modifier,
      total: roll + modifier,
      mode,
      rollType,
      isCritical:
        rollType === 'critical',
      isCriticalFail:
        rollType === 'critical-fail'
    }
  }

  const rollDie = (sides) => {
    return Math.floor(
      Math.random() * sides
    ) + 1
  }

  const rollDice = (
    count,
    sides
  ) => {
    const rolls = []

    for (
      let i = 0;
      i < count;
      i++
    ) {
      rolls.push(
        rollDie(sides)
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
      count,
      sides
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
      .match(/^(\d+)d(\d+)$/)

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

    const value = damage.trim()

    if (!/^\d+$/.test(value)) {
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

    if (fixedDamage !== null) {
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