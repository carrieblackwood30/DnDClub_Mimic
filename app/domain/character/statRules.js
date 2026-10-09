export const getAbilityModifier = (
  score
) => {
  return Math.floor(
    (
      Number(score ?? 10) - 10
    ) / 2
  )
}

export const getAbilityModifiers = (
  abilityScores = {}
) => {
  const modifiers = {}

  for (
    const [ability, score]
    of Object.entries(abilityScores)
  ) {
    modifiers[ability] =
      getAbilityModifier(score)
  }

  return modifiers
}

export const getProficiencyBonus = (
  level
) => {
  return (
    Math.floor(
      (
        Number(level ?? 1) - 1
      ) / 4
    ) + 2
  )
}