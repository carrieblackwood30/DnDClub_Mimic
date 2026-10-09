export const getMaxHitPoints = ({
  level = 1,
  hitDie = 0,
  constitutionModifier = 0,
  hitPointRolls = {}
} = {}) => {
  const normalizedLevel =
    Math.max(
      1,
      Number(level ?? 1)
    )

  const normalizedHitDie =
    Number(hitDie ?? 0)

  const normalizedConstitutionModifier =
    Number(
      constitutionModifier ?? 0
    )

  if (
    normalizedHitDie <= 0
  ) {
    return 0
  }

  const firstLevelHP =
    Math.max(
      1,
      normalizedHitDie +
        normalizedConstitutionModifier
    )

  if (
    normalizedLevel === 1
  ) {
    return firstLevelHP
  }

  let total =
    firstLevelHP

  const hitDieAverage =
    Math.floor(
      normalizedHitDie / 2
    ) + 1

  for (
    let currentLevel = 2;
    currentLevel <= normalizedLevel;
    currentLevel += 1
  ) {
    const storedRoll =
      Number(
        hitPointRolls?.[
          currentLevel
        ]
      )

    const hitDieResult =
      Number.isFinite(
        storedRoll
      ) &&
      storedRoll >= 1 &&
      storedRoll <= normalizedHitDie
        ? storedRoll
        : hitDieAverage

    total += Math.max(
      1,
      hitDieResult +
        normalizedConstitutionModifier
    )
  }

  return total
}