import { resolveAttackOutcome } from '~/domain/combat/attackEngine'

export const useAttackResolution = () => {
  const resolveAttack = (
    roll,
    attackModifier,
    targetAC
  ) => {
    return resolveAttackOutcome({
      d20: roll,
      attackModifier,
      targetAC
    })
  }

  return {
    resolveAttack
  }
}
