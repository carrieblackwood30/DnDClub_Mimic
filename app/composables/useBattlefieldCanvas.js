import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js'
import { useBattlefield } from '~/composables/useBattlefield'
import { terrainTypes } from '~/data/battlefield/terrain'
import { battlefieldObjectTypes } from '~/data/battlefield/objects'
import { battlefieldTokenTypes } from '~/data/battlefield/tokens'

export const useBattlefieldCanvas = ({
  host,
  store,
  combatStore,
  battleMode,
  playerControlMode,
  selectAttackTarget,
  loadCharacters
}) => {
  const getHost = () => {
    return typeof host === 'function'
      ? host()
      : host?.value ?? host
  }
  const tacticalPreview = ref(null)

  let app = null
  let world = null

  let backgroundLayer = null
  let terrainLayer = null
  let terrainTextureLayer = null
  let gridLayer = null
  let movementRangeLayer = null
  let movementPathLayer = null
  let threatLayer = null
  let tacticalLayer = null
  let interactionLayer = null
  let overlayLayer = null
  let objectLayer = null
  let tokenLayer = null
  let labelsLayer = null

  let resizeObserver = null
  let resizeHandler = null

  let pointerDown = false
  let dragging = false
  let suppressTap = false
  let suppressNextTapAfterDrag = false
  let activePointerId = null
  let pointerButton = null
  let panGesture = false
  let pointerStart = null
  let worldStart = null
  let spacePressed = false
  let draggedObjectId = null
  let dragObjectOrigin = null
  let dragObjectPosition = null
  let dragObjectValid = false
  let draggedObjectGraphic = null
  let draggedTokenId = null
  const draggedTokenIdState = ref(null)
  let dragTokenOrigin = null
  let dragTokenPosition = null
  let dragTokenValid = false
  let dragTokenCostFeet = null
  let dragTokenPath = []
  let draggedTokenGraphic = null
  let hoveredAttackTargetId = null

  let hoverHexGraphic = null
  let selectedHexGraphic = null
  let selectedObjectGraphic = null
  let boardFrameGraphic = null
  let selectedMovementBadgeGraphic = null

  let forestSprite = null
  let forestMask = null

  const terrainTextureCache = new Map()
  const objectTextureCache = new Map()
  const objectGraphics = new Map()
  const tokenGraphics = new Map()
  const missingObjectTextures = new Set()

  const baseHexSize = 32
  const minZoom = 0.55
  const maxZoom = 1.65
  const zoomStep = 1.12
  const textureSeed = 2917

  const {
    hexToPixel,
    pixelToHex,
    getHexCorners,
    clamp
  } = useBattlefield()

  const getLocalPoint = event => {
    const rect = app.canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  const hash = (q, r) => {
    const value = Math.sin(
      q * 12.9898 +
      r * 78.233 +
      textureSeed
    ) * 43758.5453

    return value - Math.floor(value)
  }

  const cross = (o, a, b) => {
    return (
      (a.x - o.x) * (b.y - o.y) -
      (a.y - o.y) * (b.x - o.x)
    )
  }

  const getTokenCells = (token, position = token?.position) => {
    if (!token || !position) {
      return []
    }

    const footprint =
      Array.isArray(token.footprint) &&
      token.footprint.length
        ? token.footprint
        : [{ q: 0, r: 0 }]

    return footprint.map(offset => ({
      q: position.q + offset.q,
      r: position.r + offset.r
    }))
  }

  const getHexPolygon = (
    q,
    r,
    size = baseHexSize
  ) => {
    const center = hexToPixel(
      q,
      r,
      size
    )

    const corners = getHexCorners(
      center.x,
      center.y,
      size
    )

    return corners.flatMap(point => [
      point.x,
      point.y
    ])
  }

  const getBoardHull = () => {
    const points = []

    for (
      let r = 0;
      r < store.height;
      r += 1
    ) {
      for (
        let q = 0;
        q < store.width;
        q += 1
      ) {
        const center = hexToPixel(
          q,
          r,
          baseHexSize
        )

        const corners = getHexCorners(
          center.x,
          center.y,
          baseHexSize
        )

        points.push(...corners)
      }
    }

    const sorted = [...points].sort((a, b) => {
      if (a.x !== b.x) {
        return a.x - b.x
      }

      return a.y - b.y
    })

    const lower = []

    for (const point of sorted) {
      while (
        lower.length >= 2 &&
        cross(
          lower[lower.length - 2],
          lower[lower.length - 1],
          point
        ) <= 0
      ) {
        lower.pop()
      }

      lower.push(point)
    }

    const upper = []

    for (
      let index = sorted.length - 1;
      index >= 0;
      index -= 1
    ) {
      const point = sorted[index]

      while (
        upper.length >= 2 &&
        cross(
          upper[upper.length - 2],
          upper[upper.length - 1],
          point
        ) <= 0
      ) {
        upper.pop()
      }

      upper.push(point)
    }

    lower.pop()
    upper.pop()

    return lower.concat(upper)
  }

  const getBoardBounds = () => {
    const hull = getBoardHull()
    const xs = hull.map(point => point.x)
    const ys = hull.map(point => point.y)

    return {
      hull,
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  }

  const clearLayerChildren = layer => {
    if (!layer) {
      return
    }

    layer.removeChildren().forEach(child => {
      child.destroy({
        children: true,
        texture: false,
        textureSource: false
      })
    })
  }

  const createBoardMask = () => {
    const hull = getBoardHull()

    return new Graphics()
      .poly(
        hull.flatMap(point => [
          point.x,
          point.y
        ])
      )
      .fill({
        color: 0xffffff,
        alpha: 1
      })
  }

  const loadTerrainTextures = async () => {
    await Promise.all(
      terrainTypes
        .filter(terrain => terrain.texture)
        .map(async terrain => {
          try {
            const texture = await Assets.load(
              terrain.texture
            )

            terrainTextureCache.set(
              terrain.id,
              texture
            )
          } catch {
            terrainTextureCache.delete(
              terrain.id
            )
          }
        })
    )
  }

  const loadObjectTextures = async () => {
    await Promise.all(
      battlefieldObjectTypes
        .filter(objectType => objectType.texture)
        .map(async objectType => {
          try {
            const texture = await Assets.load(
              objectType.texture
            )

            objectTextureCache.set(
              objectType.id,
              texture
            )
          } catch {
            missingObjectTextures.add(
              objectType.id
            )
          }
        })
    )
  }

  const drawHexOutline = (
    q,
    r,
    color,
    alpha,
    width = 1
  ) => {
    return new Graphics()
      .poly(
        getHexPolygon(q, r)
      )
      .stroke({
        width,
        color,
        alpha,
        pixelLine: true
      })
  }

  const drawInteractionCell = (q, r) => {
    return new Graphics()
      .poly(
        getHexPolygon(q, r)
      )
      .fill({
        color: 0xffffff,
        alpha: 0.001
      })
  }

  const drawTerrainTextureCell = (q, r) => {
    const cell = store.getCell(q, r)

    const terrain = cell
      ? store.getTerrain(cell.terrainId)
      : null

    if (!cell) {
      return null
    }

    if (cell.terrainId === 'grass') {
      return null
    }

    if (!terrain?.texture) {
      return null
    }

    const texture = terrainTextureCache.get(
      terrain.id
    )

    if (!texture) {
      return null
    }

    const center = hexToPixel(
      q,
      r,
      baseHexSize
    )

    const corners = getHexCorners(
      center.x,
      center.y,
      baseHexSize
    )

    const xs = corners.map(point => point.x)
    const ys = corners.map(point => point.y)
    const width = Math.max(...xs) - Math.min(...xs)
    const height = Math.max(...ys) - Math.min(...ys)

    const scale = Math.max(
      width / texture.width,
      height / texture.height
    )

    const sprite = new Sprite(texture)

    sprite.width = texture.width * scale
    sprite.height = texture.height * scale
    sprite.position.set(center.x, center.y)
    sprite.anchor.set(0.5)
    sprite.alpha = 0.98

    const mask = new Graphics()
      .poly(
        corners.flatMap(point => [
          point.x,
          point.y
        ])
      )
      .fill({
        color: 0xffffff,
        alpha: 1
      })

    sprite.mask = mask

    const container = new Container()

    container.addChild(
      sprite,
      mask
    )

    return container
  }

  const drawForestFallback = () => {
    const {
      hull,
      minX,
      maxX,
      minY,
      maxY
    } = getBoardBounds()

    const polygon = hull.flatMap(point => [
      point.x,
      point.y
    ])

    const width = maxX - minX
    const height = maxY - minY

    const base = new Graphics()
      .poly(polygon)
      .fill({
        color: 0x243724,
        alpha: 1
      })

    backgroundLayer.addChild(base)

    const atmosphere = new Graphics()

    for (let index = 0; index < 180; index += 1) {
      const x = minX + Math.random() * width
      const y = minY + Math.random() * height
      const radius = 8 + Math.random() * 34

      atmosphere
        .circle(x, y, radius)
        .fill({
          color:
            index % 3 === 0
              ? 0x58774d
              : index % 3 === 1
                ? 0x3d5b3c
                : 0x30492f,
          alpha: 0.05 + Math.random() * 0.07
        })
    }

    const mask = new Graphics()
      .poly(polygon)
      .fill({
        color: 0xffffff,
        alpha: 1
      })

    atmosphere.mask = mask

    backgroundLayer.addChild(
      atmosphere,
      mask
    )
  }

  const drawForestBackground = async () => {
    clearLayerChildren(
      backgroundLayer
    )

    const {
      hull,
      minX,
      maxX,
      minY,
      maxY
    } = getBoardBounds()

    const polygon = hull.flatMap(point => [
      point.x,
      point.y
    ])

    const boardWidth = maxX - minX
    const boardHeight = maxY - minY

    const shadow = new Graphics()
      .poly(polygon)
      .fill({
        color: 0x020302,
        alpha: 0.9
      })
      .stroke({
        width: 10,
        color: 0x020302,
        alpha: 0.5
      })

    backgroundLayer.addChild(shadow)

    try {
      const texture = await Assets.load(
        '/battlefield/forest-clearing.png'
      )

      forestSprite = new Sprite(texture)

      const scale = Math.max(
        boardWidth / texture.width,
        boardHeight / texture.height
      )

      forestSprite.width = texture.width * scale
      forestSprite.height = texture.height * scale
      forestSprite.x = minX + (
        boardWidth - forestSprite.width
      ) / 2
      forestSprite.y = minY + (
        boardHeight - forestSprite.height
      ) / 2

      forestMask = createBoardMask()
      forestSprite.mask = forestMask

      backgroundLayer.addChild(
        forestSprite,
        forestMask
      )
    } catch {
      drawForestFallback()
    }

    const atmosphere = new Graphics()
      .poly(polygon)
      .fill({
        color: 0x071008,
        alpha: 0.12
      })

    backgroundLayer.addChild(atmosphere)
  }


  const getObjectCenterAtPosition = (object, position) => {
    const cells = object.footprint.map(offset => ({
      q: position.q + offset.q,
      r: position.r + offset.r
    }))

    const sum = cells.reduce(
      (result, cell) => {
        const point = hexToPixel(
          cell.q,
          cell.r,
          baseHexSize
        )

        return {
          x: result.x + point.x,
          y: result.y + point.y
        }
      },
      { x: 0, y: 0 }
    )

    return {
      x: sum.x / cells.length,
      y: sum.y / cells.length
    }
  }

  const getObjectCenter = object => {
    return getObjectCenterAtPosition(
      object,
      object.position
    )
  }

  const drawObjectFallback = object => {
    const container = new Container()
    const center = getObjectCenter(object)
    const size = baseHexSize

    const shadow = new Graphics()
      .ellipse(
        0,
        size * 0.46,
        size * 0.58,
        size * 0.17
      )
      .fill({
        color: 0x050403,
        alpha: 0.38
      })

    container.addChild(shadow)

    if (object.type === 'tree') {
      const trunk = new Graphics()
        .roundRect(
          -6,
          -4,
          12,
          26,
          5
        )
        .fill({
          color: 0x65452d,
          alpha: 1
        })

      const foliage = new Graphics()
        .circle(-13, -15, 16)
        .circle(9, -17, 17)
        .circle(0, -31, 18)
        .fill({
          color: 0x2c5c32,
          alpha: 0.96
        })
        .stroke({
          width: 1,
          color: 0x91a868,
          alpha: 0.42
        })

      const highlight = new Graphics()
        .circle(-8, -28, 5)
        .circle(8, -20, 4)
        .fill({
          color: 0x6d914b,
          alpha: 0.42
        })

      container.addChild(
        trunk,
        foliage,
        highlight
      )
    }

    if (object.type === 'rock') {
      const rock = new Graphics()
        .poly([
          -25, 11,
          -18, -12,
          -2, -22,
          19, -14,
          25, 4,
          11, 20,
          -9, 23
        ])
        .fill({
          color: 0x66675f,
          alpha: 1
        })
        .stroke({
          width: 2,
          color: 0x9e9e91,
          alpha: 0.5
        })

      rock
        .moveTo(-10, -8)
        .lineTo(5, -14)
        .lineTo(16, -4)
        .stroke({
          width: 2,
          color: 0xc1c0aa,
          alpha: 0.24
        })

      container.addChild(rock)
    }

    if (object.type === 'wall') {
      const wall = new Graphics()
        .roundRect(
          -27,
          -8,
          54,
          18,
          4
        )
        .fill({
          color: 0x69665e,
          alpha: 1
        })
        .stroke({
          width: 2,
          color: 0xb0a99a,
          alpha: 0.34
        })

      for (let index = -20; index <= 20; index += 20) {
        wall
          .moveTo(index, -8)
          .lineTo(index + 4, 10)
          .stroke({
            width: 1,
            color: 0x3b3934,
            alpha: 0.36
          })
      }

      container.addChild(wall)
    }

    if (object.type === 'door') {
      const frame = new Graphics()
        .roundRect(
          -18,
          -23,
          36,
          46,
          4
        )
        .fill({
          color: 0x4f301f,
          alpha: 1
        })
        .stroke({
          width: 3,
          color: 0xb2804d,
          alpha: 0.46
        })

      const panel = new Graphics()
        .roundRect(
          -11,
          -17,
          22,
          34,
          3
        )
        .fill({
          color: 0x795333,
          alpha: 1
        })

      const knob = new Graphics()
        .circle(7, 1, 2.5)
        .fill({
          color: 0xd3b86a,
          alpha: 0.94
        })

      container.addChild(
        frame,
        panel,
        knob
      )
    }

    if (object.type === 'crate') {
      const crate = new Graphics()
        .roundRect(
          -19,
          -19,
          38,
          38,
          4
        )
        .fill({
          color: 0x865c34,
          alpha: 1
        })
        .stroke({
          width: 3,
          color: 0x3f2819,
          alpha: 0.9
        })

      crate
        .moveTo(-14, -14)
        .lineTo(14, 14)
        .stroke({
          width: 3,
          color: 0xb58046,
          alpha: 0.72
        })

      crate
        .moveTo(14, -14)
        .lineTo(-14, 14)
        .stroke({
          width: 3,
          color: 0xb58046,
          alpha: 0.72
        })

      container.addChild(crate)
    }

    container.position.set(
      center.x,
      center.y
    )

    return container
  }

  const drawObjectGraphic = object => {
    const texture = objectTextureCache.get(object.type)

    if (!texture || missingObjectTextures.has(object.type)) {
      return drawObjectFallback(object)
    }

    const center = getObjectCenter(object)
    const sprite = new Sprite(texture)
    const size = baseHexSize * 1.9
    const scale = Math.max(
      size / texture.width,
      size / texture.height
    )

    sprite.width = texture.width * scale
    sprite.height = texture.height * scale
    sprite.anchor.set(0.5, 0.72)
    sprite.position.set(
      center.x,
      center.y
    )

    const container = new Container()
    const shadow = new Graphics()
      .ellipse(
        center.x,
        center.y + baseHexSize * 0.43,
        baseHexSize * 0.58,
        baseHexSize * 0.16
      )
      .fill({
        color: 0x050403,
        alpha: 0.34
      })

    container.addChild(
      shadow,
      sprite
    )

    return container
  }

  const drawObjectSelection = () => {
    if (selectedObjectGraphic) {
      selectedObjectGraphic.destroy()
      selectedObjectGraphic = null
    }

    const object = store.selectedObject

    if (!object) {
      return
    }

    const position =
      draggedObjectId === object.id &&
      dragObjectPosition
        ? dragObjectPosition
        : object.position

    selectedObjectGraphic = new Container()

    for (const cell of object.footprint) {
      const q = position.q + cell.q
      const r = position.r + cell.r

      selectedObjectGraphic.addChild(
        drawHexOutline(
          q,
          r,
          dragging && draggedObjectId === object.id
            ? (dragObjectValid ? 0x8fce78 : 0xe36f68)
            : 0xf0d788,
          0.95,
          3
        )
      )
    }

    overlayLayer.addChild(
      selectedObjectGraphic
    )
  }

  const clearMovementRange = () => {
    clearLayerChildren(
      movementRangeLayer
    )
  }

  const clearMovementPath = () => {
    clearLayerChildren(
      movementPathLayer
    )
  }

  const clearTacticalPreview = () => {
    clearLayerChildren(tacticalLayer)
    clearThreatZones()
    tacticalPreview.value = null
  }

  const clearThreatZones = () => {
    clearLayerChildren(threatLayer)
  }

  const getHexNeighborsForThreat = hex => {
    const parity = ((hex.r % 2) + 2) % 2

    const directions = parity === 0
      ? [
          { q: 1, r: 0 },
          { q: 0, r: -1 },
          { q: -1, r: -1 },
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: 0, r: 1 }
        ]
      : [
          { q: 1, r: 0 },
          { q: 1, r: -1 },
          { q: 0, r: -1 },
          { q: -1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 }
        ]

    return directions.map(direction => ({
      q: hex.q + direction.q,
      r: hex.r + direction.r
    }))
  }

  const drawThreatZones = () => {
  clearThreatZones()

  if (!dragging || !draggedTokenId || !store.selectedToken) {
    return
  }

  const movingToken = store.selectedToken
  const movingFaction = movingToken.faction ?? 'friendly'
  const zones = new Set()

  for (const token of store.tokens) {
    if (token.id === movingToken.id) continue

    const faction = token.faction ?? 'friendly'
    if (faction === movingFaction || faction === 'neutral') continue

    const reach = Number(token.reach ?? 5)
    const cells = token.footprint?.length
      ? token.footprint.map(offset => ({
          q: token.position.q + offset.q,
          r: token.position.r + offset.r
        }))
      : [token.position]

    if (reach <= 5) {
      for (const cell of cells) {
        for (const neighbor of getHexNeighborsForThreat(cell)) {
          if (!store.isInside(neighbor.q, neighbor.r)) continue
          zones.add(`${neighbor.q}:${neighbor.r}`)
        }
      }
    }
  }

  for (const key of zones) {
    const [q, r] = key.split(':').map(Number)
    const graphic = new Graphics()
      .poly(getHexPolygon(q, r))
      .fill({ color: 0xb94b45, alpha: 0.10 })
      .stroke({
        width: 1.5,
        color: 0xe06d63,
        alpha: 0.42,
        pixelLine: true
      })

    threatLayer.addChild(graphic)
  }
}

  const drawTacticalPreview = () => {
    clearLayerChildren(tacticalLayer)
    tacticalPreview.value = null

    if (!draggedTokenId || !dragging || !store.selectedToken) {
      return
    }

    const token = store.tokens.find(
      item => item.id === draggedTokenId
    )

    const target = store.hoveredHex

    if (!token || !target) {
      return
    }

    if (
      target.q === token.position.q &&
      target.r === token.position.r
    ) {
      return
    }

    const moveInfo = store.getTokenMoveInfo(
      token.id,
      target
    )

    const status = store.getTokenMovementStatus(
      token.id
    )

    const distanceHexes = moveInfo.path?.length
      ? Math.max(0, moveInfo.path.length - 1)
      : store.getHexDistance(
          token.position,
          target
        )

    const distanceFeet = Math.max(
      0,
      Number(moveInfo.costFeet ?? 0)
    )

    const usedFeet = status?.enforced
      ? Number(status.usedFeet ?? 0) + distanceFeet
      : distanceFeet

    const remainingFeet = status?.enforced
      ? Math.max(
          0,
          Number(status.allowanceFeet ?? status.speed ?? 0) - usedFeet
        )
      : Math.max(
          0,
          Number(status?.speed ?? token.speed ?? 0) - usedFeet
        )

    const tactical = store.getTokenTacticalInfo(
      token.id,
      target
    )

    tacticalPreview.value = {
      distanceFeet,
      distanceHexes,
      usedFeet,
      remainingFeet,
      blocked: !moveInfo.allowed,
      reason: moveInfo.reason ?? null,
      visible: tactical?.visible ?? true,
      cover: tactical?.cover ?? null,
      path: moveInfo.path ?? []
    }

    const path = moveInfo.path ?? []

    if (path.length < 2) {
      return
    }

    const line = new Graphics()

    path.forEach((position, index) => {
      const point = hexToPixel(
        position.q,
        position.r,
        baseHexSize
      )

      if (index === 0) {
        line.moveTo(point.x, point.y)
      } else {
        line.lineTo(point.x, point.y)
      }
    })

    line.stroke({
      width: 3,
      color: moveInfo.allowed ? 0x74c69d : 0xe36f68,
      alpha: 0.8,
      pixelLine: true
    })

    tacticalLayer.addChild(line)
  }

  const drawMovementRange = () => {
  clearMovementRange()

  if (store.editorMode !== 'tokens') {
    return
  }

  const token = store.selectedToken

  if (!token) {
    return
  }

  const cells =
    store.getReachableTokenCells(
      token.id
    )

  for (const cell of cells) {
    const isOrigin =
      cell.q === token.position.q &&
      cell.r === token.position.r

    const graphic = new Graphics()
      .poly(
        getHexPolygon(
          cell.q,
          cell.r
        )
      )
      .fill({
        color: isOrigin
          ? 0xf0d788
          : 0x78ad7b,
        alpha: isOrigin ? 0.08 : 0.12
      })
      .stroke({
        width: isOrigin ? 2 : 1,
        color: isOrigin
          ? 0xf0d788
          : 0x78ad7b,
        alpha: isOrigin ? 0.55 : 0.45,
        pixelLine: true
      })

    movementRangeLayer.addChild(
      graphic
    )
  }
}

  const drawSelectedTokenMovementBadge = () => {
  if (selectedMovementBadgeGraphic) {
    selectedMovementBadgeGraphic.destroy({
      children: true,
      texture: false,
      textureSource: false
    })
    selectedMovementBadgeGraphic = null
  }

  if (!store.selectedToken) {
    return
  }

  const status = store.getTokenMovementStatus(
    store.selectedToken.id
  )

  if (!status) {
    return
  }

  const position = draggedTokenId === store.selectedToken.id && dragTokenPosition
    ? dragTokenPosition
    : store.selectedToken.position

  const center = hexToPixel(
    position.q,
    position.r,
    baseHexSize
  )

  const movementText = status.enforced
    ? `Осталось ${status.remainingFeet} ft`
    : `Скорость ${status.speed} ft`

  const badge = new Container()

  const text = new Text({
    text: movementText,
    style: {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 9,
      fontWeight: '700',
      fill: '#f4e7c8',
      stroke: {
        color: '#0b0907',
        width: 3
      },
      align: 'center'
    },
    anchor: 0.5
  })

  const width = Math.max(
    54,
    text.width + 14
  )

  const background = new Graphics()
    .roundRect(
      -width * 0.5,
      -9,
      width,
      18,
      7
    )
    .fill({
      color: status.enforced
        ? (status.currentTurn ? 0x173028 : 0x221c16)
        : 0x1b1712,
      alpha: 0.94
    })
    .stroke({
      width: 1,
      color: status.enforced
        ? (status.currentTurn ? 0x75b69f : 0x8d7757)
        : 0x705d42,
      alpha: 0.92,
      pixelLine: true
    })

  badge.addChild(
    background,
    text
  )

  badge.position.set(
    center.x,
    center.y - baseHexSize * 0.92
  )

  selectedMovementBadgeGraphic = badge
  labelsLayer.addChild(badge)
}

  const drawMovementPath = () => {
  clearMovementPath()

  if (
    !draggedTokenId ||
    !dragTokenPath.length
  ) {
    return
  }

  const points = dragTokenPath.map(
    position => {
      return hexToPixel(
        position.q,
        position.r,
        baseHexSize
      )
    }
  )

  if (points.length < 2) {
    return
  }

  const pathGraphic = new Graphics()
    .moveTo(
      points[0].x,
      points[0].y
    )

  for (let index = 1; index < points.length; index += 1) {
    pathGraphic.lineTo(
      points[index].x,
      points[index].y
    )
  }

  pathGraphic.stroke({
    width: 5,
    color: dragTokenValid
      ? 0xf0d788
      : 0xe36f68,
    alpha: 0.9,
    pixelLine: true
  })

  movementPathLayer.addChild(
    pathGraphic
  )

  for (let index = 1; index < points.length - 1; index += 1) {
    movementPathLayer.addChild(
      new Graphics()
        .circle(
          points[index].x,
          points[index].y,
          3
        )
        .fill({
          color: dragTokenValid
            ? 0xf0d788
            : 0xe36f68,
          alpha: 0.95
        })
    )
  }

  if (dragTokenPosition && dragTokenCostFeet !== null) {
    const token = store.tokens.find(
      item => item.id === draggedTokenId
    )

    const status = token
      ? store.getTokenMovementStatus(token.id)
      : null

    const remainingFeet = status?.enforced
      ? Math.max(
          0,
          status.remainingFeet - dragTokenCostFeet
        )
      : null

    const text = new Text({
      text: remainingFeet === null
        ? `${dragTokenCostFeet} ft`
        : `${dragTokenCostFeet} ft · ${remainingFeet} ft ост.`,
      style: {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 9,
        fontWeight: '700',
        fill: dragTokenValid
          ? '#f3e0ad'
          : '#f4aaa2',
        stroke: {
          color: '#0b0907',
          width: 3
        },
        align: 'center'
      },
      anchor: 0.5
    })

    const point = points[points.length - 1]

    const background = new Graphics()
      .roundRect(
        point.x - Math.max(32, text.width * 0.5 + 10),
        point.y - 24,
        Math.max(64, text.width + 20),
        18,
        7
      )
      .fill({
        color: dragTokenValid ? 0x19160f : 0x291614,
        alpha: 0.96
      })
      .stroke({
        width: 1,
        color: dragTokenValid ? 0xc29c58 : 0x9a514a,
        alpha: 0.92,
        pixelLine: true
      })

    text.position.set(
      point.x,
      point.y - 15
    )

    movementPathLayer.addChild(
      background,
      text
    )
  }
}

  const drawSelection = () => {
    if (selectedHexGraphic) {
      selectedHexGraphic.destroy()
      selectedHexGraphic = null
    }

    if (selectedObjectGraphic) {
      selectedObjectGraphic.destroy()
      selectedObjectGraphic = null
    }

    const selectedHex = store.selectedHex

    if (selectedHex) {
      selectedHexGraphic = drawHexOutline(
        selectedHex.q,
        selectedHex.r,
        0xf0d788,
        0.9,
        3
      )

      overlayLayer.addChild(
        selectedHexGraphic
      )
    }

    if (store.selectedObject) {
      drawObjectSelection()
    } else {
      drawTokenSelection()
    }

    drawSelectedTokenMovementBadge()
  }

  const drawHover = hex => {
    if (hoverHexGraphic) {
      hoverHexGraphic.destroy()
      hoverHexGraphic = null
    }

    if (!hex) {
      return
    }

    let color = 0xffffff

    if (
      store.editorMode === 'terrain'
    ) {
      color = 0x6da9ff
    }

    if (
      store.editorMode === 'objects'
    ) {
      color = 0xd5a867
    }

    if (
      store.editorMode === 'tokens'
    ) {
      color = 0x8fc8ff
    }

    if (
      dragging &&
      draggedTokenId
    ) {
      color = dragTokenValid
        ? 0x8fce78
        : 0xe36f68
    }

    if (
      dragging &&
      draggedObjectId
    ) {
      color = dragObjectValid
        ? 0x8fce78
        : 0xe36f68
    }

    hoverHexGraphic = drawHexOutline(
      hex.q,
      hex.r,
      color,
      0.75,
      2
    )

    overlayLayer.addChild(
      hoverHexGraphic
    )
  }

  const paintHex = hex => {
    if (!hex) {
      return
    }

    if (store.editorMode === 'terrain') {
      store.paintTerrain(
        hex.q,
        hex.r
      )
      store.setSelectedHex(hex)
      return
    }

    if (store.editorMode === 'objects') {
      store.setSelectedToken(null)

      const existingObject = store.getObjectAt(
        hex.q,
        hex.r
      )

      if (existingObject) {
        store.setSelectedObject(
          existingObject.id
        )
        store.setSelectedHex(hex)
        return
      }

      store.placeObject(
        hex.q,
        hex.r
      )
      store.setSelectedHex(hex)
      return
    }

    if (store.editorMode === 'tokens') {
      store.setSelectedObject(null)

      const existingToken = store.getTokenAt(
        hex.q,
        hex.r
      )

      if (existingToken) {
        store.setSelectedToken(
          existingToken.id
        )
        store.setSelectedHex(hex)
        return
      }

      store.placeToken(
        hex.q,
        hex.r
      )
      store.setSelectedHex(hex)
      return
    }

    if (store.editorMode === 'erase') {
      const removedToken = store.removeTokenAt(
        hex.q,
        hex.r
      )

      if (!removedToken) {
        const removedObject = store.removeObjectAt(
          hex.q,
          hex.r
        )

        if (!removedObject) {
          store.eraseTerrain(
            hex.q,
            hex.r
          )
        }
      }

      store.setSelectedHex(hex)
      return
    }

    store.setSelectedHex(hex)
  }

  const handleHexPointerOver = hex => {
    store.hoveredHex = hex

    drawHover(hex)

    if (
      pointerDown &&
      dragging &&
      pointerButton === 0 &&
      !panGesture
    ) {
      if (
        store.editorMode === 'terrain' ||
        store.editorMode === 'erase'
      ) {
        paintHex(hex)
        drawBattlefield()
      }
    }
  }

  const createToken = token => {
    const container = new Container()

    const center = hexToPixel(
      token.position.q,
      token.position.r,
      baseHexSize
    )

    container.position.set(
      center.x,
      center.y
    )

    const isCurrentTurn =
      Boolean(
        token.combatParticipantId &&
        combatStore.currentTurn ===
          token.combatParticipantId
      )

    const faction =
      token.faction ?? 'friendly'

    const factionColor =
      faction === 'enemy'
        ? 0xc95b5b
        : faction === 'neutral'
          ? 0xc5a95b
          : 0x5b93d1

    const shadow = new Graphics()
      .ellipse(
        0,
        23,
        20,
        7
      )
      .fill({
        color: 0x000000,
        alpha: 0.38
      })

    const ring = new Graphics()
      .circle(
        0,
        0,
        24
      )
      .fill({
        color: 0x101318,
        alpha: 0.92
      })

    const outer = new Graphics()
      .circle(
        0,
        0,
        21
      )
      .fill({
        color: factionColor,
        alpha: 1
      })

    const inner = new Graphics()
      .circle(
        0,
        0,
        17
      )
      .fill({
        color: 0x20252d,
        alpha: 1
      })

    container.addChild(
      shadow,
      ring,
      outer,
      inner
    )

    if (isCurrentTurn) {
      container.addChild(
        new Graphics()
          .circle(0, 0, 25)
          .stroke({
            width: 3,
            color: 0xf5d76e,
            alpha: 0.95
          })
      )
    }

    const tokenType =
      battlefieldTokenTypes.find(
        type =>
          type.id === token.type
      )

    if (tokenType?.icon) {
      const icon = new Text({
        text: tokenType.icon,
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 18,
          fill: 0xffffff
        })
      })

      icon.anchor.set(0.5)

      container.addChild(icon)
    } else {
      const initial =
        String(
          token.name ?? '?'
        )
          .charAt(0)
          .toUpperCase()

      const label = new Text({
        text: initial,
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 17,
          fontWeight: '700',
          fill: 0xffffff
        })
      })

      label.anchor.set(0.5)

      container.addChild(label)
    }

    const maxHp =
      Math.max(
        1,
        Number(token.maxHp ?? token.hp ?? 1)
      )

    const hp =
      Math.max(
        0,
        Math.min(
          maxHp,
          Number(token.hp ?? maxHp)
        )
      )

    const hpWidth = 34
    const hpRatio = hp / maxHp

    const hpBackground = new Graphics()
      .roundRect(
        -17,
        28,
        hpWidth,
        4,
        2
      )
      .fill({
        color: 0x191919,
        alpha: 0.95
      })

    const hpBar = new Graphics()
      .roundRect(
        -17,
        28,
        hpWidth * hpRatio,
        4,
        2
      )
      .fill({
        color:
          hpRatio > 0.5
            ? 0x70bd70
            : hpRatio > 0.25
              ? 0xd0b95d
              : 0xd05b5b,
        alpha: 1
      })

    container.addChild(
      hpBackground,
      hpBar
    )

    const name = new Text({
      text: String(
        token.name ?? 'Участник'
      ).slice(0, 18),
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 9,
        fontWeight: '700',
        fill: 0xffffff,
        stroke: {
          color: 0x07101b,
          width: 3
        },
        align: 'center'
      })
    })

    name.anchor.set(0.5)
    name.position.set(
      0,
      37
    )

    container.addChild(name)

    const ac = new Text({
      text: `AC ${Number(token.ac ?? 10)}`,
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 8,
        fontWeight: '700',
        fill: 0xdfe8f3,
        stroke: {
          color: 0x07101b,
          width: 2
        }
      })
    })

    ac.anchor.set(0.5)
    ac.position.set(
      0,
      -30
    )

    container.addChild(ac)

    container.eventMode = 'static'
    container.cursor = 'pointer'

    container.on(
      'pointerover',
      () => {
        if (combatStore.combatStarted) {
          selectAttackTarget(token)
        }
      }
    )

    container.on(
      'pointertap',
      () => {
        if (suppressTap) {
          suppressTap = false
          return
        }

        if (
          store.editorMode === 'erase'
        ) {
          store.removeTokenAt(
            token.position.q,
            token.position.r
          )
          drawBattlefield()
          return
        }

        store.selectedTokenId =
          token.id

        store.setSelectedObject(null)

        if (
          combatStore.combatStarted
        ) {
          selectAttackTarget(
            token
          )
        }

        store.setSelectedHex({
          q: token.position.q,
          r: token.position.r
        })

        drawSelection()
      }
    )

    return container
  }

  const drawTokenSelection = () => {
    const token =
      store.selectedToken

    if (!token) {
      return
    }

    const position =
      draggedTokenId === token.id &&
      dragTokenPosition
        ? dragTokenPosition
        : token.position

    const valid =
      draggedTokenId === token.id
        ? dragTokenValid
        : true

    const graphic = new Container()

    for (
      const cell of getTokenCells(
        token,
        position
      )
    ) {
      graphic.addChild(
        drawHexOutline(
          cell.q,
          cell.r,
          valid
            ? 0x74a9ff
            : 0xe36f68,
          0.9,
          3
        )
      )
    }

    overlayLayer.addChild(
      graphic
    )

    selectedHexGraphic = graphic
  }

  const drawObjects = () => {
    clearLayerChildren(
      objectLayer
    )

    objectGraphics.clear()

    for (const object of store.objects) {
      const graphic =
        drawObjectGraphic(object)

      graphic.eventMode = 'static'
      graphic.cursor = 'pointer'

      graphic.on(
        'pointertap',
        () => {
          if (suppressTap || suppressNextTapAfterDrag) {
            suppressTap = false
            suppressNextTapAfterDrag = false
            return
          }

          if (
            store.editorMode === 'erase'
          ) {
            store.removeObjectAt(
              object.position.q,
              object.position.r
            )
          } else {
            store.setSelectedObject(
              object.id
            )

            store.setSelectedToken(null)

            store.setSelectedHex({
              q: object.position.q,
              r: object.position.r
            })
          }

          drawBattlefield()
        }
      )

      objectLayer.addChild(
        graphic
      )

      objectGraphics.set(
        object.id,
        graphic
      )
    }
  }

  const drawTokens = () => {
    clearLayerChildren(
      tokenLayer
    )

    tokenGraphics.clear()

    for (const token of store.tokens) {
      const graphic =
        createToken(token)

      tokenLayer.addChild(
        graphic
      )

      tokenGraphics.set(
        token.id,
        graphic
      )
    }
  }

  const drawBattlefield = () => {
    if (!app || !world) {
      return
    }

    clearLayerChildren(
      terrainTextureLayer
    )

    clearLayerChildren(
      terrainLayer
    )

    clearLayerChildren(
      gridLayer
    )

    clearMovementRange()
    clearMovementPath()
    clearTacticalPreview()

    clearLayerChildren(
      interactionLayer
    )

    clearLayerChildren(
      tokenLayer
    )

    clearLayerChildren(
      labelsLayer
    )

    for (
      let r = 0;
      r < store.height;
      r += 1
    ) {
      for (
        let q = 0;
        q < store.width;
        q += 1
      ) {
        const terrainTexture =
          drawTerrainTextureCell(
            q,
            r
          )

        if (terrainTexture) {
          terrainTextureLayer.addChild(
            terrainTexture
          )
        }

        const polygon = getHexPolygon(
          q,
          r
        )

        const grid = new Graphics()
          .poly(polygon)
          .fill({
            color: 0xe2d5b3,
            alpha: 0.018
          })
          .stroke({
            width: 1,
            color: 0xd7ba7b,
            alpha: 0.17,
            pixelLine: true
          })

        grid.eventMode = 'none'
        gridLayer.addChild(grid)

        const interaction = drawInteractionCell(
          q,
          r
        )

        interaction.eventMode = 'static'
        interaction.cursor = 'pointer'

        interaction.on('pointerover', () => {
          handleHexPointerOver({
            q,
            r
          })
        })

        interaction.on('pointerout', () => {
          store.setHoveredHex(null)
          drawHover(null)
          clearTacticalPreview()
        })

        interaction.on('pointertap', () => {
          if (suppressTap || suppressNextTapAfterDrag) {
            suppressTap = false
            suppressNextTapAfterDrag = false
            return
          }

          paintHex({
            q,
            r
          })
        })

        interactionLayer.addChild(
          interaction
        )

        if (store.showCoordinates) {
          const center = hexToPixel(
            q,
            r,
            baseHexSize
          )

          const label = new Text({
            text: `${q},${r}`,
            style: new TextStyle({
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 7,
              fill: 0xd6c69f,
              alpha: 0.42
            })
          })

          label.anchor.set(0.5)
          label.position.set(
            center.x,
            center.y + baseHexSize * 0.34
          )

          labelsLayer.addChild(label)
        }
      }
    }

    if (boardFrameGraphic) {
      boardFrameGraphic.destroy()
      boardFrameGraphic = null
    }

    const hull =
      getBoardHull()

    boardFrameGraphic =
      new Graphics()
        .poly(
          hull.flatMap(point => [
            point.x,
            point.y
          ])
        )
        .stroke({
          width: 4,
          color: 0x131b12,
          alpha: 0.9
        })

    overlayLayer.addChild(
      boardFrameGraphic
    )

    drawObjects()
    drawTokens()
    drawMovementRange()
    drawMovementPath()
    drawThreatZones()
    drawTacticalPreview()
    drawSelection()
  }

  const centerWorld = () => {
    if (!app || !world) {
      return
    }

    const {
      minX,
      maxX,
      minY,
      maxY
    } = getBoardBounds()

    const width =
      maxX - minX

    const height =
      maxY - minY

    world.x =
      (app.screen.width - width * world.scale.x) / 2 -
      minX * world.scale.x

    world.y =
      (app.screen.height - height * world.scale.y) / 2 -
      minY * world.scale.y
  }

  const getHexAtPointer = event => {
    if (!app || !world) {
      return null
    }

    const local =
      getLocalPoint(event)

    const worldPoint = {
      x:
        (local.x - world.x) /
        world.scale.x,
      y:
        (local.y - world.y) /
        world.scale.y
    }

    const hex =
      pixelToHex(
        worldPoint.x,
        worldPoint.y,
        baseHexSize
      )

    if (
      hex.q < 0 ||
      hex.r < 0 ||
      hex.q >= store.width ||
      hex.r >= store.height
    ) {
      return null
    }

    return hex
  }

  const getObjectAtHex = hex => {
    if (!hex) {
      return null
    }

    return store.getObjectAt(
      hex.q,
      hex.r
    )
  }

  const getTokenAtHex = hex => {
    if (!hex) {
      return null
    }

    return store.getTokenAt(
      hex.q,
      hex.r
    )
  }


  const updateObjectDrag = hex => {
    if (!draggedObjectId) {
      return
    }

    const object = store.objects.find(
      item => item.id === draggedObjectId
    )

    if (!object) {
      return
    }

    if (!hex) {
      dragObjectPosition = null
      dragObjectValid = false

      if (draggedObjectGraphic && dragObjectOrigin) {
        const center = getObjectCenterAtPosition(
          object,
          dragObjectOrigin
        )

        draggedObjectGraphic.position.set(
          center.x,
          center.y
        )
      }

      drawHover(null)
      drawObjectSelection()
      return
    }

    dragObjectPosition = {
      q: hex.q,
      r: hex.r
    }

    dragObjectValid = store.canMoveObject(
      object.id,
      hex.q,
      hex.r
    )

    if (draggedObjectGraphic) {
      const center = getObjectCenterAtPosition(
        object,
        dragObjectPosition
      )

      draggedObjectGraphic.position.set(
        center.x,
        center.y
      )
      draggedObjectGraphic.alpha =
        dragObjectValid ? 1 : 0.5
    }

    store.setHoveredHex(hex)
    drawHover(hex)
    drawObjectSelection()
  }

  const finishObjectDrag = () => {
    if (!draggedObjectId) {
      return
    }

    let moved = false

    if (dragging && dragObjectPosition && dragObjectValid) {
      moved = store.moveObject(
        draggedObjectId,
        dragObjectPosition.q,
        dragObjectPosition.r
      )
    }

    if (!moved && draggedObjectGraphic && dragObjectOrigin) {
      const object = store.objects.find(
        item => item.id === draggedObjectId
      )

      if (object) {
        const center = getObjectCenterAtPosition(
          object,
          dragObjectOrigin
        )

        draggedObjectGraphic.position.set(
          center.x,
          center.y
        )
      }
    }

    if (draggedObjectGraphic) {
      draggedObjectGraphic.alpha = 1
    }

    draggedObjectGraphic = null
    draggedObjectId = null
    dragObjectOrigin = null
    dragObjectPosition = null
    dragObjectValid = false

    drawBattlefield()
  }



  const updateTokenDrag = hex => {
    if (!draggedTokenId) {
      return
    }

    const token = store.tokens.find(
      item => item.id === draggedTokenId
    )

    if (!token) {
      return
    }

    if (!hex) {
      dragTokenPosition = null
      dragTokenValid = false
      dragTokenCostFeet = null
      dragTokenPath = []

      if (draggedTokenGraphic && dragTokenOrigin) {
        const center = hexToPixel(
          dragTokenOrigin.q,
          dragTokenOrigin.r,
          baseHexSize
        )

        draggedTokenGraphic.position.set(
          center.x,
          center.y
        )
      }

      drawMovementPath()
      drawTacticalPreview()
      drawHover(null)
      drawSelection()
      return
    }

    const moveInfo = store.getTokenMoveInfo(
      token.id,
      {
        q: hex.q,
        r: hex.r
      }
    )

    dragTokenPosition = {
      q: hex.q,
      r: hex.r
    }

    dragTokenValid = moveInfo.allowed
    dragTokenCostFeet = moveInfo.costFeet
    dragTokenPath = moveInfo.path ?? []

    if (draggedTokenGraphic) {
      const center = hexToPixel(
        hex.q,
        hex.r,
        baseHexSize
      )

      draggedTokenGraphic.position.set(
        center.x,
        center.y
      )
      draggedTokenGraphic.alpha =
        dragTokenValid ? 1 : 0.5
    }

    store.setHoveredHex(hex)
    drawHover(hex)
    drawMovementPath()
    drawTacticalPreview()
    drawThreatZones()
    drawSelection()
    drawSelectedTokenMovementBadge()
  }

  const finishTokenDrag = () => {
    if (!draggedTokenId) {
      return
    }

    let moved = false

    if (dragging && dragTokenPosition && dragTokenValid) {
      moved = store.moveToken(
        draggedTokenId,
        dragTokenPosition.q,
        dragTokenPosition.r
      )
    }

    if (!moved && draggedTokenGraphic && dragTokenOrigin) {
      const center = hexToPixel(
        dragTokenOrigin.q,
        dragTokenOrigin.r,
        baseHexSize
      )

      draggedTokenGraphic.position.set(
        center.x,
        center.y
      )
    }

    if (draggedTokenGraphic) {
      draggedTokenGraphic.alpha = 1
    }

    draggedTokenGraphic = null
    draggedTokenId = null
    draggedTokenIdState.value = null
    dragTokenOrigin = null
    dragTokenPosition = null
    dragTokenValid = false
    dragTokenCostFeet = null
    dragTokenPath = []
    tacticalPreview.value = null

    drawBattlefield()
  }


  const updatePointerCursor = event => {
    if (!app || !world || draggedObjectId || draggedTokenId) {
      return
    }

    const hex = getHexAtPointer(event)

    if (!hex) {
      drawHover(null)
      clearTacticalPreview()
      store.setHoveredHex(null)

      if (battleMode.value && hoveredAttackTargetId !== null) {
        hoveredAttackTargetId = null
        selectAttackTarget(null)
      }

      return
    }

    if (
      !store.hoveredHex ||
      store.hoveredHex.q !== hex.q ||
      store.hoveredHex.r !== hex.r
    ) {
      store.setHoveredHex(hex)
      drawHover(hex)
    }

    if (battleMode.value) {
      const hoveredToken = getTokenAtHex(hex)
      const nextTargetId = hoveredToken?.id ?? null

      if (nextTargetId !== hoveredAttackTargetId) {
        hoveredAttackTargetId = nextTargetId
        selectAttackTarget(hoveredToken)
      }
    } else {
      hoveredAttackTargetId = null
    }
  }

  const onPointerDown = event => {
    if (!app || !world) {
      return
    }

    if (event.button !== 0 && event.button !== 1) {
      return
    }

    pointerDown = true
    dragging = false
    suppressTap = false
    suppressNextTapAfterDrag = false
    activePointerId = event.pointerId
    pointerButton = event.button
    pointerStart = getLocalPoint(event)
    worldStart = {
      x: world.x,
      y: world.y
    }

    const hex = getHexAtPointer(event)

    const objectAtPointer =
      hex &&
      event.button === 0 &&
      store.editorMode === 'objects'
        ? store.getObjectAt(hex.q, hex.r)
        : null

    const tokenAtPointer =
      hex &&
      event.button === 0 &&
      (store.editorMode === 'tokens' || battleMode.value)
        ? store.getTokenAt(hex.q, hex.r)
        : null

    draggedObjectId = objectAtPointer?.id ?? null
    dragObjectOrigin = objectAtPointer
      ? {
          q: objectAtPointer.position.q,
          r: objectAtPointer.position.r
        }
      : null
    dragObjectPosition = null
    dragObjectValid = false
    draggedObjectGraphic = objectAtPointer
      ? objectGraphics.get(objectAtPointer.id) ?? null
      : null

    draggedTokenId = tokenAtPointer?.id ?? null
    draggedTokenIdState.value = draggedTokenId
    dragTokenOrigin = tokenAtPointer
      ? {
          q: tokenAtPointer.position.q,
          r: tokenAtPointer.position.r
        }
      : null
    dragTokenPosition = null
    dragTokenValid = false
    draggedTokenGraphic = tokenAtPointer
      ? tokenGraphics.get(tokenAtPointer.id) ?? null
      : null

    if (objectAtPointer) {
      store.setSelectedObject(objectAtPointer.id)
      store.setSelectedHex(hex)
      store.setSelectedToken(null)
      panGesture = false
      dragging = false
      app.canvas.style.cursor = 'grab'

      if (app.canvas.setPointerCapture) {
        app.canvas.setPointerCapture(event.pointerId)
      }

      return
    }

    if (tokenAtPointer) {
      if (battleMode.value && playerControlMode.value) {
        const participant = tokenAtPointer.combatParticipantId
          ? combatStore.participants.find(
              item => item.id === tokenAtPointer.combatParticipantId
            )
          : null

        const canControl = Boolean(
          participant &&
          participant.type === 'player' &&
          combatStore.currentTurn === participant.id &&
          participant.currentHP > 0
        )

        if (!canControl) {
          draggedTokenId = null
          draggedTokenIdState.value = null
          draggedTokenGraphic = null
          store.setSelectedToken(tokenAtPointer.id)
          store.setSelectedHex(hex)
          store.setSelectedObject(null)
          panGesture = false
          return
        }
      }

      store.setSelectedToken(tokenAtPointer.id)
      store.setSelectedHex(hex)
      store.setSelectedObject(null)
      panGesture = false
      dragging = false
      app.canvas.style.cursor = 'grab'

      if (app.canvas.setPointerCapture) {
        app.canvas.setPointerCapture(event.pointerId)
      }

      return
    }

    draggedObjectId = null
    draggedTokenId = null
    draggedTokenIdState.value = null
    draggedObjectGraphic = null
    draggedTokenGraphic = null

    store.setSelectedObject(null)

    panGesture =
      event.button === 1 ||
      (
        event.button === 0 &&
        (
          spacePressed ||
          store.editorMode === 'select' ||
          store.editorMode === 'objects' ||
          store.editorMode === 'tokens'
        )
      )

    if (panGesture) {
      event.preventDefault()
      dragging = true
      app.canvas.style.cursor = 'grab'

      if (app.canvas.setPointerCapture) {
        app.canvas.setPointerCapture(event.pointerId)
      }
    }
  }

  const onPointerMove = event => {
    if (!pointerDown || event.pointerId !== activePointerId) {
      return
    }

    const local = getLocalPoint(event)
    const dx = local.x - pointerStart.x
    const dy = local.y - pointerStart.y

    if (
      Math.abs(dx) > 4 ||
      Math.abs(dy) > 4
    ) {
      dragging = true
      suppressTap = true
      suppressNextTapAfterDrag = true
    }

    if (dragging && draggedObjectId) {
      updateObjectDrag(
        getHexAtPointer(event)
      )
      app.canvas.style.cursor = dragObjectValid
        ? 'grabbing'
        : 'not-allowed'
      return
    }

    if (dragging && draggedTokenId) {
      updateTokenDrag(
        getHexAtPointer(event)
      )
      app.canvas.style.cursor = dragTokenValid
        ? 'grabbing'
        : 'not-allowed'
      return
    }

    if (dragging && panGesture) {
      world.x = worldStart.x + dx
      world.y = worldStart.y + dy
      app.canvas.style.cursor = 'grabbing'
      return
    }

    updatePointerCursor(event)
  }

  const onPointerUp = event => {
    if (event.pointerId !== activePointerId) {
      return
    }

    if (draggedObjectId) {
      finishObjectDrag()
    } else if (draggedTokenId) {
      finishTokenDrag()
    }

    if (panGesture && app?.canvas?.releasePointerCapture) {
      try {
        app.canvas.releasePointerCapture(
          event.pointerId
        )
      } catch {}
    }

    if (dragging) {
      suppressNextTapAfterDrag = true
    }

    pointerDown = false
    dragging = false
    panGesture = false
    activePointerId = null
    pointerButton = null
    pointerStart = null
    worldStart = null
    app.canvas.style.cursor = 'default'
    drawSelection()
    drawSelectedTokenMovementBadge()
  }

  const onWheel = event => {
    event.preventDefault()

    if (
      !app ||
      !world
    ) {
      return
    }

    const direction =
      event.deltaY > 0
        ? 1 / zoomStep
        : zoomStep

    const nextScale =
      clamp(
        world.scale.x * direction,
        minZoom,
        maxZoom
      )

    if (
      nextScale ===
      world.scale.x
    ) {
      return
    }

    const local =
      getLocalPoint(event)

    const worldPoint = {
      x:
        (local.x - world.x) /
        world.scale.x,
      y:
        (local.y - world.y) /
        world.scale.y
    }

    world.scale.set(
      nextScale
    )

    world.x =
      local.x -
      worldPoint.x *
        nextScale

    world.y =
      local.y -
      worldPoint.y *
        nextScale
  }

  const onContextMenu = event => {
    event.preventDefault()
  }

  const onKeyDown = event => {
    if (
      event.code === 'Space'
    ) {
      spacePressed = true
    }
  }

  const onKeyUp = event => {
    if (
      event.code === 'Space'
    ) {
      spacePressed = false
    }
  }

  const onResize = () => {
    if (!app) {
      return
    }

    drawBattlefield()
    centerWorld()
  }

  const init = async () => {
    const hostElement = getHost()

    if (
      app ||
      !hostElement ||
      !(hostElement instanceof HTMLElement)
    ) {
      return
    }

    if (loadCharacters) {
      await loadCharacters()
    }

    app = new Application()

    await app.init({
      resizeTo: hostElement,
      antialias: true,
      background: '#090806'
    })

    hostElement.appendChild(app.canvas)

    app.canvas.style.touchAction =
      'none'

    app.canvas.style.userSelect =
      'none'

    app.canvas.style.cursor =
      'default'

    backgroundLayer =
      new Container()

    world =
      new Container()

    terrainLayer =
      new Container()

    terrainTextureLayer =
      new Container()

    gridLayer =
      new Container()

    movementRangeLayer =
      new Container()

    movementPathLayer =
      new Container()

    threatLayer =
      new Container()

    tacticalLayer =
      new Container()

    interactionLayer =
      new Container()

    overlayLayer =
      new Container()

    objectLayer =
      new Container()

    tokenLayer =
      new Container()

    labelsLayer =
      new Container()

    world.addChild(
      backgroundLayer,
      terrainLayer,
      terrainTextureLayer,
      gridLayer,
      movementRangeLayer,
      movementPathLayer,
      threatLayer,
      tacticalLayer,
      interactionLayer,
      overlayLayer,
      objectLayer,
      tokenLayer,
      labelsLayer
    )

    app.stage.addChild(
      world
    )

    await drawForestBackground()
    await loadTerrainTextures()
    await loadObjectTextures()

    drawBattlefield()
    centerWorld()

    const canvas =
      app.canvas

    canvas.addEventListener(
      'pointerdown',
      onPointerDown
    )

    canvas.addEventListener(
      'pointermove',
      onPointerMove
    )

    canvas.addEventListener(
      'pointerup',
      onPointerUp
    )

    canvas.addEventListener(
      'pointercancel',
      onPointerUp
    )

    canvas.addEventListener(
      'wheel',
      onWheel,
      {
        passive: false
      }
    )

    canvas.addEventListener(
      'contextmenu',
      onContextMenu
    )

    window.addEventListener(
      'keydown',
      onKeyDown
    )

    window.addEventListener(
      'keyup',
      onKeyUp
    )

    resizeHandler =
      onResize

    window.addEventListener(
      'resize',
      resizeHandler
    )

    resizeObserver =
      new ResizeObserver(
        onResize
      )

    resizeObserver.observe(
      hostElement
    )
  }

  const destroy = () => {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (resizeHandler) {
      window.removeEventListener(
        'resize',
        resizeHandler
      )
      resizeHandler = null
    }

    window.removeEventListener(
      'keydown',
      onKeyDown
    )

    window.removeEventListener(
      'keyup',
      onKeyUp
    )

    if (app?.canvas) {
      app.canvas.removeEventListener(
        'pointerdown',
        onPointerDown
      )

      app.canvas.removeEventListener(
        'pointermove',
        onPointerMove
      )

      app.canvas.removeEventListener(
        'pointerup',
        onPointerUp
      )

      app.canvas.removeEventListener(
        'pointercancel',
        onPointerUp
      )

      app.canvas.removeEventListener(
        'wheel',
        onWheel
      )

      app.canvas.removeEventListener(
        'contextmenu',
        onContextMenu
      )
    }

    if (app) {
      app.destroy(
        true,
        {
          children: true,
          texture: false
        }
      )
    }

    app = null
    world = null

    backgroundLayer = null
    terrainLayer = null
    terrainTextureLayer = null
    gridLayer = null
    movementRangeLayer = null
    movementPathLayer = null
    threatLayer = null
    tacticalLayer = null
    interactionLayer = null
    overlayLayer = null
    objectLayer = null
    tokenLayer = null
    labelsLayer = null

    objectGraphics.clear()
    tokenGraphics.clear()
    terrainTextureCache.clear()
    objectTextureCache.clear()
    missingObjectTextures.clear()

    forestSprite = null
    forestMask = null
    draggedTokenIdState.value = null
    hoveredAttackTargetId = null
  }

  watch(
    () => [
      store.cells,
      store.objects,
      store.tokens,
      store.selectedHex,
      store.selectedObjectId,
      store.selectedTokenId,
      store.editorMode,
      store.showCoordinates,
      combatStore.currentTurn,
      combatStore.combatStarted,
      combatStore.participants,
      battleMode.value,
      playerControlMode.value
    ],
    () => {
      if (app && !draggedTokenId && !draggedObjectId) {
        drawBattlefield()
      }
    },
    {
      deep: true
    }
  )

  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    app,
    world,
    tacticalPreview,
    draggedTokenId: draggedTokenIdState,
    drawBattlefield,
    centerWorld,
    clearTacticalPreview,
    getHexAtPointer,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    init,
    destroy
  }
}