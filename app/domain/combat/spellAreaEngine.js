const AXIAL_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
]

const offsetToAxial = (q, r) => {
  return {
    q: q - ((r - (r & 1)) / 2),
    r
  }
}

const axialToOffset = (q, r) => {
  return {
    q: q + ((r - (r & 1)) / 2),
    r
  }
}

const getDirectionIndex = direction => {
  return AXIAL_DIRECTIONS.findIndex(
    item =>
      item.q === direction.q &&
      item.r === direction.r
  )
}

const getDirection = index => {
  const normalized =
    ((index % AXIAL_DIRECTIONS.length) +
      AXIAL_DIRECTIONS.length) %
    AXIAL_DIRECTIONS.length

  return AXIAL_DIRECTIONS[normalized]
}

const getAreaDirection = (origin, target) => {
  if (!origin || !target) {
    return null
  }

  const originAxial =
    offsetToAxial(
      origin.q,
      origin.r
    )

  const targetAxial =
    offsetToAxial(
      target.q,
      target.r
    )

  const deltaQ =
    targetAxial.q -
    originAxial.q

  const deltaR =
    targetAxial.r -
    originAxial.r

  if (deltaQ === 0 && deltaR === 0) {
    return null
  }

  let bestDirection = null
  let bestScore = Infinity

  for (
    const direction of AXIAL_DIRECTIONS
  ) {
    const score =
      Math.abs(deltaQ - direction.q) +
      Math.abs(deltaR - direction.r)

    if (score < bestScore) {
      bestScore = score
      bestDirection = direction
    }
  }

  return bestDirection
}

const getAreaCells = ({
  origin,
  direction,
  sizeFeet,
  cellSizeFeet
}) => {
  if (
    !origin ||
    !direction ||
    !sizeFeet ||
    !cellSizeFeet
  ) {
    return []
  }

  const directionIndex =
    getDirectionIndex(direction)

  if (directionIndex < 0) {
    return []
  }

  const axialOrigin =
    offsetToAxial(
      origin.q,
      origin.r
    )

  const cellsPerSide =
    Math.max(
      1,
      Math.round(
        sizeFeet / cellSizeFeet
      )
    )

  const forward =
    getDirection(
      directionIndex
    )

  const lateral =
    getDirection(
      directionIndex + 2
    )

  const result = []
  const seen = new Set()

  for (
    let forwardStep = 0;
    forwardStep < cellsPerSide;
    forwardStep += 1
  ) {
    for (
      let lateralStep = 0;
      lateralStep < cellsPerSide;
      lateralStep += 1
    ) {
      const axialQ =
        axialOrigin.q +
        forward.q *
          (forwardStep + 1) +
        lateral.q *
          lateralStep

      const axialR =
        axialOrigin.r +
        forward.r *
          (forwardStep + 1) +
        lateral.r *
          lateralStep

      const position =
        axialToOffset(
          axialQ,
          axialR
        )

      const key =
        `${position.q}:${position.r}`

      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      result.push(position)
    }
  }

  return result
}

const getPushDestination = ({
  origin,
  target,
  distanceFeet,
  cellSizeFeet
}) => {
  if (
    !origin ||
    !target ||
    !distanceFeet ||
    !cellSizeFeet
  ) {
    return null
  }

  const direction =
    getAreaDirection(
      origin,
      target
    )

  if (!direction) {
    return null
  }

  const cells =
    Math.max(
      1,
      Math.round(
        distanceFeet /
          cellSizeFeet
      )
    )

  const targetAxial =
    offsetToAxial(
      target.q,
      target.r
    )

  const destinationAxial = {
    q:
      targetAxial.q +
      direction.q * cells,
    r:
      targetAxial.r +
      direction.r * cells
  }

  return axialToOffset(
    destinationAxial.q,
    destinationAxial.r
  )
}

export {
  AXIAL_DIRECTIONS,
  offsetToAxial,
  axialToOffset,
  getDirectionIndex,
  getDirection,
  getAreaDirection,
  getAreaCells,
  getPushDestination
}