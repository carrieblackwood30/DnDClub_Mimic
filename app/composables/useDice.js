import {
  rollDie,
  rollDice,
  rollD20,
  rollD20ByMode,
  parseDice
} from '~/domain/combat/diceEngine'

export const useDice = () => {


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