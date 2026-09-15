export const useAttackResolution = () => {
  const resolveAttack = (
    roll,
    attackModifier,
    targetAC
  ) => {
    const total =
      roll + attackModifier

    if (roll === 20) {
      return {
        hit: true,
        miss: false,
        critical: true,
        criticalFail: false,
        total
      }
    }

    if (roll === 1) {
      return {
        hit: false,
        miss: true,
        critical: false,
        criticalFail: true,
        total
      }
    }

    const hit =
      total >= targetAC

    return {
      hit,
      miss: !hit,
      critical: false,
      criticalFail: false,
      total
    }
  }

  return {
    resolveAttack
  }
}