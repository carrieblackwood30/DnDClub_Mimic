const parseDice = dice => {
  const match = String(dice ?? '1d6').match(/^(\d+)d(\d+)$/i)

  if (!match) {
    return {
      count: 1,
      sides: 1
    }
  }

  return {
    count: Math.max(1, Number(match[1])),
    sides: Math.max(1, Number(match[2]))
  }
}

const rollDice = dice => {
  const parsed = parseDice(dice)
  const rolls = []

  for (let index = 0; index < parsed.count; index += 1) {
    rolls.push(Math.floor(Math.random() * parsed.sides) + 1)
  }

  return {
    rolls,
    total: rolls.reduce((sum, value) => sum + value, 0)
  }
}

export const resolveRollMode = (advantageSources = [], disadvantageSources = []) => {
  const hasAdvantage = advantageSources.length > 0
  const hasDisadvantage = disadvantageSources.length > 0

  if (hasAdvantage && hasDisadvantage) {
    return 'normal'
  }

  if (hasAdvantage) return 'advantage'
  if (hasDisadvantage) return 'disadvantage'

  return 'normal'
}

export const rollD20ByMode = mode => {
  const first = Math.floor(Math.random() * 20) + 1

  if (mode === 'normal') {
    return {
      rolls: [first],
      roll: first
    }
  }

  const second = Math.floor(Math.random() * 20) + 1

  return {
    rolls: [first, second],
    roll: mode === 'advantage'
      ? Math.max(first, second)
      : Math.min(first, second)
  }
}



export const getCoverACBonus = cover => {
  if (cover === 'three-quarters') return 5
  if (cover === 'half') return 2
  return 0
}

export const rollWeaponDamage = (damageDice, damageModifier, critical = false, isUnarmed = false) => {
  if (isUnarmed) {
    return {
      rolls: [],
      total: Math.max(0, 1 + Number(damageModifier ?? 0)),
      diceTotal: 1
    }
  }

  const first = rollDice(damageDice)
  const second = critical ? rollDice(damageDice) : null
  const diceTotal = first.total + (second?.total ?? 0)

  return {
    rolls: second
      ? [...first.rolls, ...second.rolls]
      : first.rolls,
    total: Math.max(
      0,
      diceTotal + Number(damageModifier ?? 0)
    ),
    diceTotal
  }
}
