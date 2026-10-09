import {
  rollDiceExpression,
  rollD20ByMode
} from './diceEngine'

export {
  rollD20ByMode
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

export const resolveAttackOutcome = ({
  d20,
  attackModifier = 0,
  targetAC = 0
}) => {
  const roll = Number(d20 ?? 0)
  const modifier = Number(
    attackModifier ?? 0
  )
  const ac = Number(
    targetAC ?? 0
  )

  const total =
    roll + modifier

  const critical =
    roll === 20

  const criticalFail =
    roll === 1

  const hit =
    critical
      ? true
      : criticalFail
        ? false
        : total >= ac

  return {
    roll,
    modifier,
    total,
    targetAC: ac,
    hit,
    critical,
    criticalFail
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

const first =
  rollDiceExpression(
    damageDice
  )

const second =
  critical
    ? rollDiceExpression(
        damageDice
      )
    : null
    
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
