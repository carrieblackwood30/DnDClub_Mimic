export const defaultMovementMode = 'walk'

export const movementModes = [
  {
    id: 'walk',
    name: 'Ходьба',
    icon: '🥾'
  },
  {
    id: 'swim',
    name: 'Плавание',
    icon: '🌊'
  },
  {
    id: 'fly',
    name: 'Полёт',
    icon: '🪽'
  }
]

export const movementModeById =
  movementModes.reduce(
    (result, mode) => {
      result[mode.id] = mode
      return result
    },
    {}
  )

export const normalizeMovementMode = mode => {
  return movementModeById[mode]
    ? mode
    : defaultMovementMode
}

export const getTerrainMovementMultiplier = (
  terrain,
  movementMode = defaultMovementMode
) => {
  if (!terrain) {
    return null
  }

  if (
    !terrain.movementModes?.includes(
      movementMode
    )
  ) {
    return null
  }

  if (movementMode === 'fly') {
    return 1
  }

  return Math.max(
    1,
    Number(terrain.movementCost ?? 1)
  )
}
