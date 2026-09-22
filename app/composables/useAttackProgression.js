import { attackProgression } from '~/data/attackProgression'

export const useAttackProgression = () => {
  const getAttackCount = ({
    classId,
    level,
    subclassId = null,
    pactBoon = null,
    invocationIds = []
  }) => {
    const currentLevel = Math.min(
      Math.max(Number(level) || 1, 1),
      20
    )

    const progression =
      attackProgression[classId]

    if (!progression) {
      return 1
    }

    const extraAttack =
      progression.extraAttack

    if (!extraAttack) {
      return 1
    }

    if (extraAttack.subclass) {
      const subclassProgression =
        extraAttack.subclass[subclassId]

      if (!subclassProgression) {
        return 1
      }

      const levels = Object.keys(
        subclassProgression
      ).map(Number)

      const availableLevels =
        levels.filter(
          requiredLevel =>
            currentLevel >= requiredLevel
        )

      if (!availableLevels.length) {
        return 1
      }

      return Math.max(
        ...availableLevels.map(
          requiredLevel =>
            subclassProgression[
              requiredLevel
            ]
        )
      )
    }

    if (extraAttack.invocation) {
      const invocation =
        extraAttack.invocation

      const hasRequiredLevel =
        currentLevel >=
        (invocation.requiredLevel ?? 1)

      const hasRequiredPact =
        pactBoon ===
        invocation.requiredPactBoon

      const hasInvocation =
        invocationIds.includes(
          invocation.id
        )

      if (
        hasRequiredLevel &&
        hasRequiredPact &&
        hasInvocation
      ) {
        return invocation.attacks
      }

      return 1
    }

    const levels = Object.keys(
      extraAttack
    ).map(Number)

    const availableLevels =
      levels.filter(
        requiredLevel =>
          currentLevel >= requiredLevel
      )

    if (!availableLevels.length) {
      return 1
    }

    return Math.max(
      ...availableLevels.map(
        requiredLevel =>
          extraAttack[requiredLevel]
      )
    )
  }

  return {
    getAttackCount
  }
}
