export const useBattlefield = () => {
  const sqrt3 = Math.sqrt(3)

  const offsetToAxial = (col, row) => {
    return {
      q: col - ((row - (row & 1)) / 2),
      r: row
    }
  }

  const axialToOffset = (q, r) => {
    return {
      q: q + ((r - (r & 1)) / 2),
      r
    }
  }

  const hexToPixel = (q, r, size) => {
    return {
      x: size * sqrt3 * (q + (r & 1) / 2),
      y: size * 1.5 * r
    }
  }

  const pixelToAxial = (x, y, size) => {
    const axialQ = (sqrt3 / 3 * x - 1 / 3 * y) / size
    const axialR = (2 / 3 * y) / size

    return {
      q: axialQ,
      r: axialR
    }
  }

  const cubeRound = (q, r) => {
    const x = q
    const z = r
    const y = -x - z

    let rx = Math.round(x)
    let ry = Math.round(y)
    let rz = Math.round(z)

    const xDiff = Math.abs(rx - x)
    const yDiff = Math.abs(ry - y)
    const zDiff = Math.abs(rz - z)

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz
    } else if (yDiff > zDiff) {
      ry = -rx - rz
    } else {
      rz = -rx - ry
    }

    return {
      q: rx,
      r: rz
    }
  }

  const pixelToHex = (x, y, size) => {
    const axial = pixelToAxial(x, y, size)
    const rounded = cubeRound(axial.q, axial.r)
    return axialToOffset(
      rounded.q,
      rounded.r
    )
  }

  const hexDistance = (a, b) => {
    const aAxial = offsetToAxial(a.q, a.r)
    const bAxial = offsetToAxial(b.q, b.r)

    const ax = aAxial.q
    const az = aAxial.r
    const ay = -ax - az

    const bx = bAxial.q
    const bz = bAxial.r
    const by = -bx - bz

    return Math.max(
      Math.abs(ax - bx),
      Math.abs(ay - by),
      Math.abs(az - bz)
    )
  }

  const getHexCorners = (centerX, centerY, size) => {
    return Array.from({ length: 6 }, (_, index) => {
      const angle = Math.PI / 180 * (60 * index - 30)

      return {
        x: centerX + size * Math.cos(angle),
        y: centerY + size * Math.sin(angle)
      }
    })
  }

  const getNeighbors = (hex) => {
    const axial = offsetToAxial(hex.q, hex.r)
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 }
    ]

    return directions.map(direction => {
      return axialToOffset(
        axial.q + direction.q,
        axial.r + direction.r
      )
    })
  }

  const feetBetween = (from, to, feetPerHex = 5) => {
    return hexDistance(from, to) * feetPerHex
  }

  const toFootCoordinate = (hex, feetPerHex = 5) => {
    return {
      x: hex.q * feetPerHex,
      y: hex.r * feetPerHex
    }
  }

  const getBattlefieldBounds = (
    width,
    height,
    size,
    padding = 0
  ) => {
    const points = []

    for (let r = 0; r < height; r += 1) {
      points.push(
        hexToPixel(0, r, size),
        hexToPixel(width - 1, r, size)
      )
    }

    const xs = points.map(point => point.x)
    const ys = points.map(point => point.y)

    return {
      minX: Math.min(...xs) - size - padding,
      maxX: Math.max(...xs) + size + padding,
      minY: Math.min(...ys) - size - padding,
      maxY: Math.max(...ys) + size + padding
    }
  }

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max)
  }

  return {
    hexToPixel,
    pixelToHex,
    hexDistance,
    getHexCorners,
    getNeighbors,
    feetBetween,
    toFootCoordinate,
    getBattlefieldBounds,
    clamp
  }
}
