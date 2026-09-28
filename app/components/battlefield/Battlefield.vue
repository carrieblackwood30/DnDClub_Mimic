<script setup>
import {
  onBeforeUnmount,
  onMounted,
  computed,
  ref,
  watch
} from 'vue'

import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle
} from 'pixi.js'

import { useBattlefieldStore } from '~/stores/battlefield'
import { useBattlefield } from '~/composables/useBattlefield'
import { useCombatStore } from '~/stores/combat'
import { useCharactersStore } from '~/stores/characters'
import CombatSpellcasting from '~/components/combat/CombatSpellcasting.vue'
import { terrainTypes } from '~/data/battlefield/terrain'
import { battlefieldObjectTypes } from '~/data/battlefield/objects'
import { battlefieldTokenTypes } from '~/data/battlefield/tokens'
import { movementModes } from '~/data/battlefield/movement'

const props = defineProps({
  height: {
    type: String,
    default: '760px'
  }
})

const host = ref(null)
const store = useBattlefieldStore()
const combatStore = useCombatStore()
const charactersStore = useCharactersStore()
const combatSyncMessage = ref('')
const showEditorPanel = ref(true)
const playerControlMode = ref(false)
const attackResult = ref(null)
const showSpellPanel = ref(false)
const browserFullscreen = ref(false)
const tacticalPreview = ref(null)
const pendingOpportunityAttacks = computed(() => combatStore.pendingOpportunityAttacks ?? [])

const getParticipantName = id => {
  return combatStore.participants.find(item => item.id === id)?.name ?? 'Участник'
}

const {
  hexToPixel,
  pixelToHex,
  getHexCorners,
  clamp
} = useBattlefield()

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
let dragTokenOrigin = null
let dragTokenPosition = null
let dragTokenValid = false
let dragTokenCostFeet = null
let dragTokenPath = []
let draggedTokenGraphic = null

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

  if (!cell) {
    return null
  }

  if (cell.terrainId === 'grass') {
    return null
  }

  const terrain = store.getTerrain(
    cell.terrainId
  )

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

const getHexNeighborsForThreat = (hex) => {
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
  // Tactical route preview is intentionally drag-only.
  if (!dragging || !draggedTokenId) {
    clearLayerChildren(tacticalLayer)
    tacticalPreview.value = null
    return
  }

  clearLayerChildren(tacticalLayer)
  tacticalPreview.value = null

  const token = store.selectedToken
  const target = store.hoveredHex

  if (!token || !target) {
    return
  }

  if (store.editorMode !== 'select' && store.editorMode !== 'tokens') {
    return
  }

  if (target.q === token.position.q && target.r === token.position.r) {
    return
  }

  const info = store.getTokenTacticalInfo(token.id, target)

  if (!info) {
    return
  }

  tacticalPreview.value = info
  drawThreatZones()

  const points = info.path.map(position => {
    return hexToPixel(
      position.q,
      position.r,
      baseHexSize
    )
  })

  if (points.length < 2) {
    return
  }

  const line = new Graphics()
    .moveTo(points[0].x, points[0].y)

  for (let index = 1; index < points.length; index += 1) {
    line.lineTo(points[index].x, points[index].y)
  }

  line.stroke({
    width: 3,
    color: info.visible ? 0x8fd9ff : 0xe36f68,
    alpha: 0.8,
    pixelLine: true
  })

  tacticalLayer.addChild(line)

  for (let index = 1; index < points.length - 1; index += 1) {
    tacticalLayer.addChild(
      new Graphics()
        .circle(points[index].x, points[index].y, 2.5)
        .fill({
          color: info.visible ? 0x8fd9ff : 0xe36f68,
          alpha: 0.88
        })
    )
  }
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

  if (store.selectedHex) {
    selectedHexGraphic = drawHexOutline(
      store.selectedHex.q,
      store.selectedHex.r,
      0xe8c96f,
      0.92,
      3
    )

    overlayLayer.addChild(
      selectedHexGraphic
    )
  }

  if (store.selectedObject) {
    const object = store.selectedObject
    const selection = new Container()
    selection.label = 'object-selection'

    const position =
      draggedObjectId === object.id &&
      dragObjectPosition
        ? dragObjectPosition
        : object.position

    for (const cell of object.footprint) {
      const q = position.q + cell.q
      const r = position.r + cell.r

      selection.addChild(
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

    overlayLayer.addChild(selection)
    selectedObjectGraphic = selection
    return
  }

  drawTokenSelection()
}

const drawHover = hex => {
  if (hoverHexGraphic) {
    hoverHexGraphic.destroy()
    hoverHexGraphic = null
  }

  if (!hex) {
    return
  }

  let color = 0xf0dfb2

  if (store.editorMode === 'erase') {
    color = 0xe7756b
  }

  if (store.editorMode === 'terrain') {
    color = store.getTerrain(
      store.selectedTerrainId
    )?.color ?? 0xc6ac73
  }

  if (store.editorMode === 'objects') {
    color = store.getObjectType(
      store.selectedObjectTypeId
    )?.color ?? 0xc6ac73
  }

  if (store.editorMode === 'tokens') {
    const tokenType = battlefieldTokenTypes.find(
      item => item.id === store.selectedTokenTypeId
    )

    color = tokenType?.rimColor ?? 0x8fd9ff
  }

  if (
    dragging &&
    draggedObjectId &&
    dragObjectPosition
  ) {
    color = dragObjectValid
      ? 0x8fce78
      : 0xe36f68
  }

  if (
    dragging &&
    draggedTokenId &&
    dragTokenPosition
  ) {
    color = dragTokenValid
      ? 0x8fce78
      : 0xe36f68
  }

  hoverHexGraphic = drawHexOutline(
    hex.q,
    hex.r,
    color,
    0.7,
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
  store.setHoveredHex(hex)
  drawHover(hex)
  if (
    pointerDown &&
    activePointerId !== null &&
    pointerButton === 0 &&
    !panGesture &&
    (
      store.editorMode === 'terrain' ||
      store.editorMode === 'erase'
    )
  ) {
    paintHex(hex)
  }
}

const createToken = token => {
  const container = new Container()
  const size = baseHexSize
  const center = hexToPixel(
    token.position.q,
    token.position.r,
    size
  )

  const isCurrentTurn =
    token.combatParticipantId &&
    combatStore.currentTurn === token.combatParticipantId

  const rimColor = token.rimColor ?? 0xd7ba7b
  const innerColor = token.color ?? 0x42372a

  const shadow = new Graphics()
    .ellipse(
      0,
      size * 0.42,
      size * 0.5,
      size * 0.16
    )
    .fill({
      color: 0x050403,
      alpha: 0.42
    })

  const currentTurnRing = new Graphics()
    .circle(
      0,
      0,
      size * 0.66
    )
    .stroke({
      width: 4,
      color: 0xf3d37a,
      alpha: isCurrentTurn ? 0.92 : 0
    })

  const outer = new Graphics()
    .circle(
      0,
      0,
      size * 0.57
    )
    .fill({
      color: 0x171411,
      alpha: 0.96
    })
    .stroke({
      width: 3,
      color: rimColor,
      alpha: 0.9
    })

  const inner = new Graphics()
    .circle(
      0,
      0,
      size * 0.45
    )
    .fill({
      color: innerColor,
      alpha: 0.98
    })

  const tokenLabel = new Text({
    text: String(token.name ?? '?').slice(0, 1).toUpperCase(),
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 22,
      fontWeight: '700',
      fill: '#f6ecd4',
      align: 'center'
    },
    anchor: 0.5
  })

  const iconLabel = new Text({
    text: token.icon ?? '',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 10,
      fill: '#f6ecd4',
      align: 'center'
    },
    anchor: 0.5,
    y: size * 0.34
  })

  const hpBackground = new Graphics()
    .roundRect(
      -size * 0.5,
      size * 0.63,
      size,
      6,
      3
    )
    .fill({
      color: 0x0a0807,
      alpha: 0.9
    })

  const hpRatio = token.maxHp > 0
    ? clamp(
        token.hp / token.maxHp,
        0,
        1
      )
    : 0

  const hpBar = new Graphics()
    .roundRect(
      -size * 0.5,
      size * 0.63,
      size * hpRatio,
      6,
      3
    )
    .fill({
      color:
        token.faction === 'hostile'
          ? 0xe96b63
          : token.faction === 'neutral'
            ? 0xe0b66d
            : 0x4ecdc4,
      alpha: 0.96
    })

  const nameLabel = new Text({
    text: token.name ?? 'Без имени',
    style: {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 11,
      fontWeight: '600',
      fill: '#f7f0df',
      stroke: {
        color: '#0a0807',
        width: 3
      }
    },
    anchor: 0.5,
    y: size * 0.9
  })

  const acLabel = new Text({
    text: `AC ${token.ac}`,
    style: {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 8,
      fontWeight: '700',
      fill: '#eadcbf',
      stroke: {
        color: '#0a0807',
        width: 2
      }
    },
    anchor: 0.5,
    y: -size * 0.74
  })

  container.addChild(
    shadow,
    currentTurnRing,
    outer,
    inner,
    tokenLabel,
    iconLabel,
    hpBackground,
    hpBar,
    nameLabel,
    acLabel
  )

  container.position.set(
    center.x,
    center.y
  )

  container.eventMode = 'static'
  container.cursor = 'pointer'

  container.on('pointertap', () => {
    if (suppressTap) {
      return
    }

    if (store.editorMode === 'erase') {
      store.removeToken(token.id)
      store.setSelectedToken(null)
      return
    }

    store.setSelectedToken(token.id)
      if (combatStore.combatStarted) {
        selectAttackTarget(token)
      }
    store.setSelectedHex({
      q: token.position.q,
      r: token.position.r
    })
    drawSelection()
  })

  return container
}

const drawTokenSelection = () => {
  if (selectedObjectGraphic?.label === 'token-selection') {
    selectedObjectGraphic.destroy()
    selectedObjectGraphic = null
  }

  const token = store.selectedToken

  if (!token) {
    return
  }

  const selection = new Container()
  selection.label = 'token-selection'

  const position =
    draggedTokenId === token.id &&
    dragTokenPosition
      ? dragTokenPosition
      : token.position

  for (const cell of token.footprint) {
    selection.addChild(
      drawHexOutline(
        position.q + cell.q,
        position.r + cell.r,
        dragging && draggedTokenId === token.id
          ? (dragTokenValid ? 0x8fce78 : 0xe36f68)
          : 0x8fd9ff,
        0.95,
        3
      )
    )
  }

  overlayLayer.addChild(selection)
  selectedObjectGraphic = selection
}
const drawObjects = () => {
  clearLayerChildren(objectLayer)
  objectGraphics.clear()

  draggedObjectGraphic = null

  store.objects.forEach(object => {
    const graphic = drawObjectGraphic(object)

    graphic.eventMode = 'static'
    graphic.cursor = 'pointer'

    objectGraphics.set(
      object.id,
      graphic
    )

    if (draggedObjectId === object.id) {
      draggedObjectGraphic = graphic
    }

    graphic.on('pointertap', () => {
      if (suppressTap) {
        return
      }

      if (store.editorMode === 'erase') {
        store.removeObject(object.id)
        store.setSelectedObject(null)
        return
      }

      store.setSelectedObject(object.id)
      store.setSelectedHex({
        q: object.position.q,
        r: object.position.r
      })
      drawSelection()
    })

    objectLayer.addChild(graphic)
  })
}

const drawTokens = () => {
  clearLayerChildren(tokenLayer)
  tokenGraphics.clear()

  store.tokens.forEach(token => {
    const graphic = createToken(token)

    tokenGraphics.set(
      token.id,
      graphic
    )

    if (draggedTokenId === token.id) {
      draggedTokenGraphic = graphic
    }

    tokenLayer.addChild(graphic)
  })
}

const drawBattlefield = () => {
  if (!app || !world) {
    return
  }

  clearLayerChildren(terrainTextureLayer)
  clearLayerChildren(gridLayer)
  clearMovementRange()
  clearMovementPath()
  clearTacticalPreview()
  clearLayerChildren(interactionLayer)
  clearLayerChildren(tokenLayer)
  tokenGraphics.clear()
  clearLayerChildren(labelsLayer)

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
      const terrainTexture = drawTerrainTextureCell(
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
          color: hash(q, r) > 0.5
            ? 0xeadcb5
            : 0x0b0f0d,
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
        // Empty-cell creation is tap-only. A drag is always movement/pan.
        if (suppressTap || suppressNextTapAfterDrag) {
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
          style: {
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 7,
            fill: '#d6c69f',
            alpha: 0.42
          },
          anchor: 0.5
        })

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

  const {
    hull
  } = getBoardBounds()

  const boardFrame = new Graphics()
    .poly(hull.flatMap(point => [point.x, point.y]))
    .stroke({
      width: 5,
      color: 0x17130e,
      alpha: 0.9
    })
    .stroke({
      width: 1,
      color: 0xd7ba7b,
      alpha: 0.42,
      pixelLine: true
    })

  boardFrameGraphic = boardFrame
  overlayLayer.addChild(boardFrameGraphic)

  drawObjects()

  drawTokens()
  drawSelectedTokenMovementBadge()

  drawMovementRange()
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

  const width = maxX - minX
  const height = maxY - minY

  world.scale.set(1)

  world.x = (
    app.screen.width - width
  ) / 2 - minX

  world.y = (
    app.screen.height - height
  ) / 2 - minY
}

const getHexAtPointer = event => {
  if (!app || !world) {
    return null
  }

  const local = getLocalPoint(event)

  const worldX = (
    local.x - world.x
  ) / world.scale.x

  const worldY = (
    local.y - world.y
  ) / world.scale.y

  const hex = pixelToHex(
    worldX,
    worldY,
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

const updateObjectDragPreview = event => {
  if (!draggedObjectId) {
    return
  }

  const object = store.objects.find(
    item => item.id === draggedObjectId
  )

  if (!object) {
    return
  }

  const hex = getHexAtPointer(event)

  if (!hex) {
    dragObjectPosition = null
    dragObjectValid = false

    if (draggedObjectGraphic) {
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

const updatePointerCursor = event => {
  if (!app || !world) {
    return
  }

  const hex = getHexAtPointer(event)

  if (!hex) {
    drawHover(null)
    clearTacticalPreview()
    store.setHoveredHex(null)
    return
  }

  if (draggedObjectId) {
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
}

const resetObjectDrag = () => {
  draggedObjectId = null
  dragObjectOrigin = null
  dragObjectPosition = null
  dragObjectValid = false
  draggedObjectGraphic = null
}

const resetTokenDrag = () => {
  draggedTokenId = null
  dragTokenOrigin = null
  dragTokenPosition = null
  dragTokenValid = false
  dragTokenCostFeet = null
  dragTokenPath = []
  draggedTokenGraphic = null
  clearMovementPath()
}

const updateTokenDragPreview = event => {
  if (!draggedTokenId) {
    return
  }

  const token = store.tokens.find(
    item => item.id === draggedTokenId
  )

  if (!token) {
    return
  }

  const hex = getHexAtPointer(event)

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
  dragTokenCostFeet =
    moveInfo.costFeet
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
  drawSelection()
  drawSelectedTokenMovementBadge()
}

const onPointerDown = event => {
  if (
    event.button !== 0 &&
    event.button !== 1
  ) {
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
    ? objectGraphics.get(
        objectAtPointer.id
      ) ?? null
    : null

  draggedTokenId = tokenAtPointer?.id ?? null
  dragTokenOrigin = tokenAtPointer
    ? {
        q: tokenAtPointer.position.q,
        r: tokenAtPointer.position.r
      }
    : null
  dragTokenPosition = null
  dragTokenValid = false
  draggedTokenGraphic = tokenAtPointer
    ? tokenGraphics.get(
        tokenAtPointer.id
      ) ?? null
    : null

  if (objectAtPointer) {
    store.setSelectedObject(objectAtPointer.id)
    store.setSelectedHex(hex)
    store.setSelectedToken(null)
    panGesture = false
    app.canvas.style.cursor = 'grab'

    if (app.canvas.setPointerCapture) {
      app.canvas.setPointerCapture(
        event.pointerId
      )
    }

    return
  }

  if (tokenAtPointer) {
    if (battleMode.value && playerControlMode.value) {
      const participant = tokenAtPointer.combatParticipantId
        ? combatStore.participants.find(item => item.id === tokenAtPointer.combatParticipantId)
        : null

      const canControl = Boolean(
        participant &&
        participant.type === 'player' &&
        combatStore.currentTurn === participant.id &&
        participant.currentHP > 0
      )

      if (!canControl) {
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
    app.canvas.style.cursor = 'grab'

    if (app.canvas.setPointerCapture) {
      app.canvas.setPointerCapture(
        event.pointerId
      )
    }

    return
  }

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
    app.canvas.style.cursor = 'grab'

    if (app.canvas.setPointerCapture) {
      app.canvas.setPointerCapture(
        event.pointerId
      )
    }
  }
}

const onPointerMove = event => {
  if (
    pointerDown &&
    event.pointerId === activePointerId
  ) {
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
      updateObjectDragPreview(event)
      app.canvas.style.cursor = dragObjectValid
        ? 'grabbing'
        : 'not-allowed'
    } else if (dragging && draggedTokenId) {
      updateTokenDragPreview(event)
      app.canvas.style.cursor = dragTokenValid
        ? 'grabbing'
        : 'not-allowed'
    } else if (dragging && panGesture) {
      world.x = worldStart.x + dx
      world.y = worldStart.y + dy
      app.canvas.style.cursor = 'grabbing'
    }
  }

  if (draggedObjectId || draggedTokenId) {
    return
  }

  updatePointerCursor(event)
}

const onPointerUp = event => {
  if (event.pointerId !== activePointerId) {
    return
  }

  if (draggedObjectId) {
    let moved = false

    if (
      dragging &&
      dragObjectPosition &&
      dragObjectValid
    ) {
      moved = store.moveSelectedObject(
        dragObjectPosition.q,
        dragObjectPosition.r
      )
    }

    if (!moved && draggedObjectGraphic) {
      const object = store.objects.find(
        item => item.id === draggedObjectId
      )

      if (object && dragObjectOrigin) {
        const center = getObjectCenterAtPosition(
          object,
          dragObjectOrigin
        )

        draggedObjectGraphic.position.set(
          center.x,
          center.y
        )
      }

      draggedObjectGraphic.alpha = 1
    }

    resetObjectDrag()
  }

  if (draggedTokenId) {
    let moved = false

    if (
      dragging &&
      dragTokenPosition &&
      dragTokenValid
    ) {
      moved = store.moveSelectedToken(
        dragTokenPosition.q,
        dragTokenPosition.r
      )
    }

    if (!moved && draggedTokenGraphic) {
      if (dragTokenOrigin) {
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

      draggedTokenGraphic.alpha = 1
    }

    resetTokenDrag()
  }

  if (
    panGesture &&
    app?.canvas?.releasePointerCapture
  ) {
    try {
      app.canvas.releasePointerCapture(
        event.pointerId
      )
    } catch {}
  }

  pointerDown = false
  activePointerId = null
  pointerButton = null
  panGesture = false
  app.canvas.style.cursor = 'default'
  drawSelection()
  drawSelectedTokenMovementBadge()
}

const getSelectedTokenMovementStatus = () => {
  if (!store.selectedToken) {
    return null
  }

  return store.getTokenMovementStatus(
    store.selectedToken.id
  )
}

const getTokenMovementPreview = (tokenId, previewCost) => {
  const status = store.getTokenMovementStatus(tokenId)

  if (!status) {
    return null
  }

  const cost = Math.max(0, Number(previewCost) || 0)
  const usedFeet = status.usedFeet + cost
  const remainingFeet = Math.max(0, status.allowanceFeet - usedFeet)

  return {
    usedFeet,
    remainingFeet
  }
}


const getSelectedTokenMovementMode = () => {
  const mode =
    getSelectedTokenMovementStatus()
      ?.movementMode

  return movementModes.find(
    item => item.id === mode
  ) ?? movementModes[0]
}

const battleMode = computed(() => combatStore.combatStarted)
const currentCombatToken = computed(() => {
  const id = combatStore.currentTurn
  return store.tokens.find(token => token.combatParticipantId === id) ?? null
})
const attackContext = ref(null)

const startBattle = () => {
  syncCombatParticipants()
  const started = combatStore.startCombat()
  attackResult.value = null
  if (started) {
    store.syncLinkedCombatState()
    drawBattlefield()
  }
}

const addEnemyPreset = presetId => {
  combatStore.addEnemyPreset(presetId)
  syncCombatParticipants()
  store.syncLinkedCombatState()
  drawBattlefield()
}

const addTestPlayer = () => {
  combatStore.addTestPlayer()
  syncCombatParticipants()
  store.syncLinkedCombatState()
  drawBattlefield()
}

const currentCombatCharacterId = computed(() => {
  const participant = combatStore.currentParticipant

  return (
    participant?.characterId ??
    currentCombatToken.value?.characterId ??
    null
  )
})

const canOpenSpellPanel = computed(() => {
  const participant = combatStore.currentParticipant

  return Boolean(
    battleMode.value &&
    participant?.type === 'player' &&
    currentCombatCharacterId.value
  )
})

const toggleSpellPanel = () => {
  if (!canOpenSpellPanel.value) {
    showSpellPanel.value = false
    return
  }

  showSpellPanel.value = !showSpellPanel.value
}

const togglePlayerControl = () => {
  playerControlMode.value = !playerControlMode.value
  attackResult.value = null
}

const performBasicAttack = () => {
  if (!attackContext.value) return

  const attacker = currentCombatToken.value
  if (!attacker?.combatParticipantId) return

  const targetToken = store.tokens.find(
    token => token.id === attackContext.value.targetId
  )

  if (!targetToken?.combatParticipantId) return

  const result = combatStore.resolveWeaponAttack({
    attackerId: attacker.combatParticipantId,
    targetId: targetToken.combatParticipantId,
    attackContext: attackContext.value
  })

  attackResult.value = result

  store.syncLinkedCombatState()
  attackContext.value = store.getCombatAttackContext(
    attacker.id,
    targetToken.id
  )
  drawBattlefield()
}

const addSavedCharacter = characterId => {
  const participant = store.addSavedCharacterToCombat(characterId)

  if (!participant) {
    combatSyncMessage.value = 'Персонаж не найден.'
    return
  }

  combatSyncMessage.value = `Добавлен персонаж: ${participant.name}`
  store.syncLinkedCombatState()
  drawBattlefield()
}

const getAttackReasonLabel = reason => {
  const labels = {
    'participant-not-found': 'Участник не найден',
    'target-unconscious': 'Цель недееспособна',
    'attacker-unconscious': 'Атакующий недееспособен',
    'not-current-turn': 'Сейчас не ход этого участника',
    'attack-action-unavailable': 'Атака действием недоступна',
    'out-of-range': 'Цель вне дальности оружия',
    'out-of-reach': 'Цель вне досягаемости оружия',
    'weapon-unavailable': 'Оружие недоступно',
    'line-of-sight-blocked': 'Линия обзора заблокирована'
  }

  return labels[reason] ?? 'Атака недоступна'
}

watch(
  () => combatStore.currentTurn,
  () => {
    showSpellPanel.value = false
  }
)

const endBattle = () => {
  combatStore.endCombat()
  attackContext.value = null
  drawBattlefield()
}

const nextBattleTurn = () => {
  combatStore.nextTurn()
  store.syncLinkedCombatState()
  drawBattlefield()
}

const previousBattleTurn = () => {
  combatStore.previousTurn()
  store.syncLinkedCombatState()
  drawBattlefield()
}

const selectAttackTarget = token => {
  const attacker = currentCombatToken.value
  if (!attacker || !token || attacker.id === token.id || token.hp <= 0) {
    attackContext.value = null
    return
  }
  attackContext.value = store.getCombatAttackContext(attacker.id, token.id)
}

const toggleFlankingRule = () => {
  combatStore.toggleFlanking()
  if (attackContext.value) {
    attackContext.value = store.getCombatAttackContext(
      attackContext.value.attackerId,
      attackContext.value.targetId
    )
  }
  drawBattlefield()
}

const syncCombatParticipants = () => {
  const result = store.syncCombatParticipants()

  combatSyncMessage.value =
    `Добавлено: ${result.added} · обновлено: ${result.updated}` +
    (result.failed ? ` · не добавлено: ${result.failed}` : '')

  drawBattlefield()
}

const onKeyDown = event => {
  if (event.code === 'Space') {
    spacePressed = true
  }
}

const onKeyUp = event => {
  if (event.code === 'Space') {
    spacePressed = false
  }
}

const onContextMenu = event => {
  event.preventDefault()
}

const onWheel = event => {
  event.preventDefault()

  if (!app || !world) {
    return
  }

  const direction = event.deltaY > 0
    ? 1 / zoomStep
    : zoomStep

  const nextScale = clamp(
    world.scale.x * direction,
    minZoom,
    maxZoom
  )

  if (nextScale === world.scale.x) {
    return
  }

  const local = getLocalPoint(event)

  const worldPoint = {
    x: (
      local.x - world.x
    ) / world.scale.x,
    y: (
      local.y - world.y
    ) / world.scale.y
  }

  world.scale.set(nextScale)

  world.x = local.x - worldPoint.x * nextScale
  world.y = local.y - worldPoint.y * nextScale
}

const toggleBrowserFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.()
    return
  }

  await document.exitFullscreen?.()
}

const handleFullscreenChange = () => {
  browserFullscreen.value = Boolean(document.fullscreenElement)
}

const onResize = () => {
  if (!app) {
    return
  }

  drawBattlefield()
  centerWorld()
}

onMounted(async () => {
  // Pinia store may have been created during SSR, where localStorage is unavailable.
  // Reload saved characters on the client before rendering the combat setup.
  charactersStore.loadCharacters()

  app = new Application()

  await app.init({
    resizeTo: host.value,
    antialias: true,
    background: '#090806'
  })

  host.value.appendChild(app.canvas)
  document.body.style.overflow = 'hidden'
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  app.canvas.style.touchAction = 'none'
  app.canvas.style.userSelect = 'none'
  app.canvas.style.cursor = 'default'

  backgroundLayer = new Container()
  world = new Container()
  terrainLayer = new Container()
  terrainTextureLayer = new Container()
  gridLayer = new Container()
  movementRangeLayer = new Container()
  movementPathLayer = new Container()
  threatLayer = new Container()
  tacticalLayer = new Container()
  interactionLayer = new Container()
  overlayLayer = new Container()
  objectLayer = new Container()
  tokenLayer = new Container()
  labelsLayer = new Container()

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

  app.stage.addChild(world)

  await drawForestBackground()
  await loadTerrainTextures()
  await loadObjectTextures()

  drawBattlefield()
  centerWorld()

  const canvas = app.canvas

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

  window.addEventListener(
    'pointerup',
    onPointerUp,
    true
  )

  window.addEventListener(
    'pointercancel',
    onPointerUp,
    true
  )

  window.addEventListener(
    'keydown',
    onKeyDown
  )

  window.addEventListener(
    'keyup',
    onKeyUp
  )

  canvas.addEventListener(
    'contextmenu',
    onContextMenu
  )

  canvas.addEventListener(
    'pointerleave',
    () => {
      if (!pointerDown) {
        drawHover(null)
        store.setHoveredHex(null)
      }
    }
  )

  canvas.addEventListener(
    'wheel',
    onWheel,
    {
      passive: false
    }
  )

  resizeHandler = onResize

  window.addEventListener(
    'resize',
    resizeHandler
  )

  resizeObserver = new ResizeObserver(() => {
    onResize()
  })

  resizeObserver.observe(host.value)
})

watch(
  () => [
    store.selectedHex?.q,
    store.selectedHex?.r
  ],
  () => {
    drawSelection()
  }
)

watch(
  () => [
    store.hoveredHex?.q,
    store.hoveredHex?.r,
    store.selectedTokenId
  ],
  () => {
    // Movement preview is rendered only by the active drag handlers.
  }
)

watch(
  () => store.selectedObjectId,
  () => {
    drawSelection()
  }
)

watch(
  () => store.tokens,
  () => {
    drawBattlefield()
  },
  {
    deep: true
  }
)

watch(
  () => store.selectedTokenId,
  () => {
    drawSelection()
    drawMovementRange()
    drawSelectedTokenMovementBadge()
  }
)

watch(
  () => store.editorMode,
  () => {
    drawMovementRange()
  }
)

watch(
  () => combatStore.participants,
  () => {
    store.syncLinkedCombatState()
    drawBattlefield()
    drawSelectedTokenMovementBadge()
  },
  {
    deep: true
  }
)

watch(
  () => combatStore.currentTurn,
  () => {
    drawBattlefield()
  }
)

watch(
  () => store.showCoordinates,
  () => {
    drawBattlefield()
  }
)

watch(
  () => store.cells,
  () => {
    drawBattlefield()
  },
  {
    deep: true
  }
)

watch(
  () => store.objects,
  () => {
    drawBattlefield()
  },
  {
    deep: true
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.body.style.overflow = ''

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (resizeHandler) {
    window.removeEventListener(
      'resize',
      resizeHandler
    )
    resizeHandler = null
  }

  if (app) {
    const canvas = app.canvas

    canvas.removeEventListener(
      'pointerdown',
      onPointerDown
    )

    canvas.removeEventListener(
      'pointermove',
      onPointerMove
    )

    canvas.removeEventListener(
      'pointerup',
      onPointerUp
    )

    canvas.removeEventListener(
      'pointercancel',
      onPointerUp
    )

    window.removeEventListener(
      'pointerup',
      onPointerUp,
      true
    )

    window.removeEventListener(
      'pointercancel',
      onPointerUp,
      true
    )

    window.removeEventListener(
      'keydown',
      onKeyDown
    )

    window.removeEventListener(
      'keyup',
      onKeyUp
    )

    canvas.removeEventListener(
      'contextmenu',
      onContextMenu
    )

    canvas.removeEventListener(
      'wheel',
      onWheel
    )

    app.destroy({
      removeView: true,
      children: true,
      texture: true,
      textureSource: true
    })

    app = null
  }
})
</script>

<template>
  <section
    class="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden bg-[#090806] text-[#efe5d2]"
  >
    <div
      ref="host"
      class="absolute inset-0"
    />

    <div class="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.22)_68%,rgba(0,0,0,0.72)_100%)]" />
    <div class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_140px_rgba(0,0,0,0.78)]" />

    <div class="absolute left-4 right-4 top-4 z-40 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-xl border border-[#725a35] bg-[#17130f]/90 px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#f0dfb2] shadow-xl backdrop-blur-md transition hover:border-[#ad8a4c] hover:bg-[#231b12]"
          @click="showEditorPanel = !showEditorPanel"
        >
          {{ showEditorPanel ? 'Скрыть DM' : 'Показать DM' }}
        </button>

        <div class="hidden rounded-xl border border-[#5b4b34] bg-[#14110d]/82 px-4 py-2 shadow-xl backdrop-blur-md sm:block">
          <div class="text-[9px] font-semibold tracking-[0.28em] text-[#a58a59]">
            DND · CULT OF MIMIC
          </div>
          <div class="mt-1 font-serif text-lg font-semibold text-[#f1e4c7]">
            Battlemap
          </div>
        </div>
      </div>

      <div
        v-if="combatStore.combatStarted && combatStore.currentParticipant"
        class="hidden min-w-[280px] rounded-2xl border border-[#705b38] bg-[#19140f]/92 px-4 py-3 text-center shadow-2xl backdrop-blur-md md:block"
      >
        <div class="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a58a59]">
          Сейчас ход
        </div>
        <div class="mt-1 text-sm font-semibold text-[#f1e5cf]">
          {{ combatStore.currentParticipant.name }}
        </div>
        <div class="mt-1 text-[10px] text-[#b6a78c]">
          Движение {{ combatStore.getMovementUsed(combatStore.currentParticipant.id) }} / {{ combatStore.getMovementAllowance(combatStore.currentParticipant.id) }} ft
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-xl border border-[#5d4d36] bg-[#15110d]/90 px-3 py-2 text-[10px] text-[#ccb98e] shadow-xl backdrop-blur-md transition hover:border-[#9b7c4c] hover:bg-[#221a13]"
          @click="store.toggleCoordinates"
        >
          {{ store.showCoordinates ? 'Скрыть координаты' : 'Координаты' }}
        </button>

        <button
          type="button"
          class="rounded-xl border border-[#725a35] bg-[#17130f]/90 px-3 py-2 text-[10px] font-semibold text-[#f0dfb2] shadow-xl backdrop-blur-md transition hover:border-[#ad8a4c] hover:bg-[#231b12]"
          @click="toggleBrowserFullscreen"
        >
          {{ browserFullscreen ? 'Выйти из fullscreen' : 'Fullscreen' }}
        </button>
      </div>
    </div>

    <div
      class="absolute left-1/2 top-[76px] z-40 w-[min(960px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-[#6d5735] bg-[#17130f]/94 px-4 py-3 shadow-2xl backdrop-blur-xl"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="rounded-lg border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em]" :class="battleMode ? 'border-[#7da77c] bg-[#1d2c1b] text-[#cfe5c5]' : 'border-[#5b4b34] bg-[#15110d] text-[#cbb78c]'">
            {{ battleMode ? 'БОЙ' : 'ПОДГОТОВКА' }}
          </span>
          <div>
            <div class="text-xs font-semibold text-[#f0e5ce]">
              {{ battleMode ? `Раунд ${combatStore.roundNumber}` : 'Battle Mode' }}
            </div>
            <div class="text-[9px] text-[#a89983]">
              {{ battleMode ? `Ход: ${combatStore.currentParticipant?.name ?? '—'}` : 'Карта готова к запуску боя' }}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button v-if="!battleMode" type="button" class="rounded-lg border border-[#75996d] bg-[#22331f] px-3 py-2 text-[10px] font-semibold text-[#d7e8d0] hover:bg-[#2a4026]" @click="startBattle">
            ⚔ Начать бой
          </button>
          <template v-else>
            <button type="button" class="rounded-lg border border-[#5f4d36] bg-[#1a1510] px-2 py-2 text-[10px] text-[#dfcfaa] hover:bg-[#261d14]" @click="previousBattleTurn">← Ход</button>
            <button type="button" class="rounded-lg border border-[#8a6d42] bg-[#2a2116] px-3 py-2 text-[10px] font-semibold text-[#f0d99e] hover:bg-[#382b1b]" @click="nextBattleTurn">Следующий ход →</button>
            <button type="button" class="rounded-lg border border-[#7b5048] bg-[#2b1b18] px-2 py-2 text-[10px] text-[#e4b1a9] hover:bg-[#3a2420]" @click="endBattle">Завершить</button>
            <button
              v-if="canOpenSpellPanel"
              type="button"
              class="rounded-lg border border-[#6e6aa3] bg-[#211f38] px-3 py-2 text-[10px] font-semibold text-[#d9d6ff] hover:bg-[#2d2a4c]"
              @click="toggleSpellPanel"
            >
              ✦ Заклинания
            </button>
          </template>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 text-[9px]">
        <button
          type="button"
          class="rounded-full border px-3 py-1.5 transition"
          :class="playerControlMode ? 'border-[#6e9fbd] bg-[#1e3440] text-[#d8f2fa]' : 'border-[#4d4233] bg-[#15120f] text-[#b9aa93]'"
          @click="togglePlayerControl"
        >
          {{ playerControlMode ? '✓ Режим игрока' : 'Режим DM' }}
        </button>

        <button type="button" class="rounded-full border border-[#6f9b68] bg-[#1c2a19] px-3 py-1.5 text-[#d3e8cd]" @click="addTestPlayer">
          + Тестовый игрок
        </button>
        <button
          v-for="character in charactersStore.characters"
          :key="`saved-${character.id}`"
          type="button"
          class="rounded-full border border-[#6e9fbd] bg-[#1d3039] px-3 py-1.5 text-[#d7eef6]"
          @click="addSavedCharacter(character.id)"
        >
          + {{ character.name || 'Персонаж' }}
        </button>
        <button type="button" class="rounded-full border border-[#8b6252] bg-[#2a1b16] px-3 py-1.5 text-[#e7c1b4]" @click="addEnemyPreset('goblin')">
          + Гоблин
        </button>
        <button type="button" class="rounded-full border border-[#8b6252] bg-[#2a1b16] px-3 py-1.5 text-[#e7c1b4]" @click="addEnemyPreset('orc')">
          + Орк
        </button>
        <button type="button" class="rounded-full border border-[#8b6252] bg-[#2a1b16] px-3 py-1.5 text-[#e7c1b4]" @click="addEnemyPreset('skeleton')">
          + Скелет
        </button>

        <button type="button" class="rounded-full border px-3 py-1.5 transition" :class="combatStore.flankingEnabled ? 'border-[#9d7a47] bg-[#352817] text-[#efd39a]' : 'border-[#4d4233] bg-[#15120f] text-[#b9aa93]'" @click="toggleFlankingRule">
          {{ combatStore.flankingEnabled ? '✓ Фланкирование включено' : 'Фланкирование выключено' }}
        </button>
        <span class="text-[#897b69]">Опциональное правило DMG 2014</span>
        <span v-if="battleMode" class="ml-auto text-[#b9aa93]">
          {{ combatStore.turnOrder.length }} участников
        </span>
      </div>

      <div v-if="battleMode" class="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="id in combatStore.turnOrder"
          :key="id"
          type="button"
          class="min-w-[92px] rounded-lg border px-2 py-2 text-left"
          :class="id === combatStore.currentTurn ? 'border-[#c9a95f] bg-[#302515] text-[#f3dfaa]' : 'border-[#3f372d] bg-[#12100d] text-[#b8ab98]'"
          
        >
          <div class="truncate text-[10px] font-semibold">{{ combatStore.participants.find(p => p.id === id)?.name ?? '—' }}</div>
          <div class="mt-1 text-[8px] opacity-70">{{ combatStore.participants.find(p => p.id === id)?.initiative ?? 0 }} init</div>
        </button>
      </div>

      <div v-if="attackContext" class="mt-3 rounded-2xl border border-[#725a35] bg-[#17130f] p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-[11px] uppercase tracking-[0.18em] text-[#a58a59]">Цель атаки</div>
            <div class="mt-1 text-base font-semibold text-[#f0e5ce]">{{ store.tokens.find(t => t.id === attackContext.targetId)?.name ?? '—' }}</div>
            <div class="mt-1 text-[12px] text-[#b7aa94]">{{ attackContext.weaponName }} · {{ attackContext.attackMode === 'ranged' ? 'Дальняя' : 'Ближняя' }} атака</div>
          </div>
          <div class="text-right text-sm text-[#d1c3a9]">
            <div>{{ attackContext.distanceFeet }} ft</div>
            <div class="mt-1 text-[12px] text-[#a99b84]">AC {{ attackContext.targetAC }}</div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          <div class="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            Бонус атаки: <strong>+{{ attackContext.attackModifier }}</strong>
          </div>
          <div class="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            Атак за действие: <strong>{{ attackContext.attackCount }}</strong>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-if="attackContext.advantageSources.length"
            class="rounded-full border border-[#c49a57] bg-[#332514] px-3 py-1.5 text-[11px] text-[#f1d28f]"
          >
            Преимущество · {{ attackContext.advantageSources.join(', ') === 'flanking' ? 'фланг' : attackContext.advantageSources.join(', ') }}
          </span>
          <span
            v-if="attackContext.disadvantageSources.length"
            class="rounded-full border border-[#a76767] bg-[#351c1c] px-3 py-1.5 text-[11px] text-[#efc1c1]"
          >
            Помеха · {{ attackContext.disadvantageSources.join(', ') }}
          </span>
          <span
            v-if="!attackContext.advantageSources.length && !attackContext.disadvantageSources.length"
            class="rounded-full border border-[#4c4337] bg-[#15120f] px-3 py-1.5 text-[11px] text-[#c6b89f]"
          >
            Обычный бросок
          </span>
        </div>

        <div v-if="attackContext.notes.length" class="mt-3 space-y-1 text-[11px] leading-5 text-[#a99b84]">
          <div v-for="note in attackContext.notes" :key="note">{{ note }}</div>
        </div>

        <button
          type="button"
          class="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition"
          :class="attackContext.canAttack
            ? 'border-[#a8844d] bg-[#2e2416] text-[#f2d796] hover:bg-[#3a2d1b]'
            : 'cursor-not-allowed border-[#4b4034] bg-[#15120f] text-[#756b5c]'"
          :disabled="!attackContext.canAttack"
          @click="performBasicAttack"
        >
          ⚔ Атаковать
        </button>

        <div
          v-if="!attackContext.canAttack"
          class="mt-2 text-center text-[11px] text-[#d8a29c]"
        >
          {{ getAttackReasonLabel(attackContext.reason) }}
        </div>

        <div
          v-if="attackResult"
          class="mt-3 rounded-xl border px-4 py-3 text-sm"
          :class="attackResult.success ? 'border-[#4f6e4a] bg-[#142016] text-[#d8ead3]' : 'border-[#704b46] bg-[#241514] text-[#ecc1bb]'"
        >
          <template v-if="attackResult.success">
            <div class="font-semibold">
              {{ attackResult.weapon?.name }} · d20 {{ attackResult.rolls.join(' / ') }}
            </div>
            <div class="mt-1">
              {{ attackResult.total }} против AC {{ attackResult.targetAC }} ·
              <span :class="attackResult.hit ? 'text-[#b7dbab]' : 'text-[#dda19a]'">
                {{ attackResult.hit ? `Попадание · ${attackResult.damage} урона` : 'Промах' }}
              </span>
            </div>
            <div class="mt-1 text-[12px] text-[#a9b59f]">
              Использовано атак: {{ attackResult.attacksUsed }} · осталось: {{ attackResult.attacksRemaining }}
            </div>
          </template>
          <template v-else>
            {{ getAttackReasonLabel(attackResult.reason) }}
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="showSpellPanel && canOpenSpellPanel"
      class="absolute right-4 top-[150px] z-50 w-[min(560px,calc(100vw-32px))] max-h-[calc(100dvh-180px)] overflow-y-auto rounded-3xl border border-[#6e6aa3] bg-[#11101a]/96 p-5 text-[#eeeaff] shadow-[0_30px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9f9ad6]">
            SPELLCASTING · D&D 5E 2014
          </div>
          <div class="mt-1 text-lg font-semibold text-[#f1edff]">
            Заклинания
          </div>
          <div class="mt-1 text-xs text-[#aaa5c5]">
            {{ combatStore.currentParticipant?.name ?? '—' }}
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#c9c4df] hover:bg-white/10"
          @click="showSpellPanel = false"
        >
          Закрыть
        </button>
      </div>

      <CombatSpellcasting
        v-if="currentCombatCharacterId"
        :character-id="currentCombatCharacterId"
      />
    </div>

    <div
      v-if="showEditorPanel"
      class="absolute bottom-4 left-4 top-[76px] z-30 w-[320px] overflow-y-auto rounded-3xl border border-[#665238] bg-[#14110d]/88 p-3 text-[#efe5d2] shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[10px] font-semibold tracking-[0.22em] text-[#a58a59]">
            DM EDITOR
          </div>

          <div class="mt-1 text-sm font-semibold text-[#f0e5ce]">
            Редактор поля
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
          class="rounded-lg border border-[#5e4c34] px-2 py-1 text-[10px] text-[#cbb78c] transition hover:border-[#9d7c46] hover:bg-[#241c14]"
            @click="store.clearBattlefield"
          >
            Очистить поле
          </button>

          <button
            type="button"
            class="rounded-lg border border-[#5e4c34] px-2 py-1 text-[10px] text-[#cbb78c] transition hover:border-[#9d7c46] hover:bg-[#241c14]"
            @click="showEditorPanel = false"
          >
            ×
          </button>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-5 gap-2">
        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="store.editorMode === 'select'
            ? 'border-[#c9a95f] bg-[#2a2115] text-[#f2d78e]'
            : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
          @click="store.setEditorMode('select')"
        >
          Выбор
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="store.editorMode === 'terrain'
            ? 'border-[#80a66b] bg-[#203020] text-[#d4e6c9]'
            : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
          @click="store.setEditorMode('terrain')"
        >
          Terrain
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="store.editorMode === 'objects'
            ? 'border-[#a9844f] bg-[#292015] text-[#efd398]'
            : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
          @click="store.setEditorMode('objects')"
        >
          Объекты
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="store.editorMode === 'tokens'
            ? 'border-[#5f8f9e] bg-[#1e3038] text-[#cdeffc]'
            : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
          @click="store.setEditorMode('tokens')"
        >
          Токены
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="store.editorMode === 'erase'
            ? 'border-[#a66b61] bg-[#30201d] text-[#f1c2bb]'
            : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
          @click="store.setEditorMode('erase')"
        >
          Ластик
        </button>
      </div>

      <div
        v-if="store.editorMode === 'terrain'"
        class="mt-3"
      >
        <div class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]">
          Тип поверхности
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="terrain in terrainTypes"
            :key="terrain.id"
            type="button"
            class="flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] transition"
            :class="store.selectedTerrainId === terrain.id
              ? 'border-[#c8a45b] bg-[#2b2217] text-[#f1d995]'
              : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
            @click="store.setSelectedTerrain(terrain.id)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              :style="{
                backgroundColor: `#${terrain.color.toString(16).padStart(6, '0')}`
              }"
            >
              {{ terrain.icon }}
            </span>

            <span class="min-w-0">
              <span class="block truncate font-semibold">
                {{ terrain.name }}
              </span>

              <span class="mt-0.5 block text-[9px] text-[#a89983]">
                {{ terrain.movementCost }}× движение
              </span>
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="store.editorMode === 'objects'"
        class="mt-3"
      >
        <div class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]">
          Объекты
        </div>

        <div class="rounded-lg border border-[#40382c] bg-[#15110e] px-3 py-2 text-[9px] leading-4 text-[#c9bca9]">
          Пустой hex — поставить выбранный объект. Клик по объекту — выбрать. Потяните объект — переместить. Пустое поле + drag — передвинуть карту.
        </div>

        <div class="mt-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]">
          Объект
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="objectType in battlefieldObjectTypes"
            :key="objectType.id"
            type="button"
            class="flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] transition"
            :class="store.selectedObjectTypeId === objectType.id
              ? 'border-[#c8a45b] bg-[#2b2217] text-[#f1d995]'
              : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
            @click="store.setSelectedObjectType(objectType.id)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              :style="{
                backgroundColor: `#${objectType.color.toString(16).padStart(6, '0')}`
              }"
            >
              {{ objectType.icon }}
            </span>

            <span class="min-w-0">
              <span class="block truncate font-semibold">
                {{ objectType.name }}
              </span>

              <span class="mt-0.5 block text-[9px] text-[#a89983]">
                {{ objectType.cover ?? 'без cover' }}
              </span>
            </span>
          </button>
        </div>

        <div
          v-if="store.selectedObject"
          class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#ddcda9]">
              {{ store.selectedObject.name }}
            </span>

            <button
              type="button"
              class="rounded-md border border-[#60433a] px-2 py-1 text-[9px] text-[#d99b90]"
              @click="store.removeObject(store.selectedObject.id)"
            >
              Удалить
            </button>
          </div>

          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-if="store.selectedObject.blocksMovement"
              class="rounded-full border border-[#705c39] bg-[#271f14] px-2 py-1 text-[9px] text-[#d7bd80]"
            >
              Блокирует движение
            </span>

            <span
              v-if="store.selectedObject.blocksLineOfSight"
              class="rounded-full border border-[#5c4a3a] bg-[#211a15] px-2 py-1 text-[9px] text-[#cfbca1]"
            >
              Блокирует обзор
            </span>

            <span
              v-if="store.selectedObject.cover"
              class="rounded-full border border-[#536146] bg-[#1c261a] px-2 py-1 text-[9px] text-[#b9cfaa]"
            >
              Cover: {{ store.selectedObject.cover }}
            </span>

            <span
              v-if="store.selectedObject.destructible"
              class="rounded-full border border-[#5b4b3d] bg-[#211913] px-2 py-1 text-[9px] text-[#cdb59a]"
            >
              HP: {{ store.selectedObject.hp }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="store.editorMode === 'tokens'"
        class="mt-3"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]">
            Токены
          </div>

          <button
            type="button"
            class="rounded-lg border border-[#5f8f9e] bg-[#1d3038] px-2 py-1 text-[9px] text-[#c9ecf5] transition hover:bg-[#25404a]"
            @click="syncCombatParticipants"
          >
            Синхронизировать бой
          </button>
        </div>

        <div class="mt-2 rounded-lg border border-[#40382c] bg-[#15110e] px-3 py-2 text-[9px] leading-4 text-[#c9bca9]">
          Пустой hex — поставить выбранный токен.
          Клик по токену — выбрать. Потяните токен — переместить.
          Потяните пустое поле — передвинуть карту.
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2">
          <button
            v-for="tokenType in battlefieldTokenTypes"
            :key="tokenType.id"
            type="button"
            class="rounded-lg border px-2 py-2 text-[10px] transition"
            :class="store.selectedTokenTypeId === tokenType.id
              ? 'border-[#6f9fb0] bg-[#21343d] text-[#d8f2fa]'
              : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
            @click="store.setSelectedTokenType(tokenType.id)"
          >
            <span class="block text-base leading-none">
              {{ tokenType.icon }}
            </span>

            <span class="mt-1 block truncate">
              {{ tokenType.name }}
            </span>
          </button>
        </div>

        <div
          v-if="combatSyncMessage"
          class="mt-2 rounded-lg border border-[#3b5e68] bg-[#142127] px-2 py-2 text-[9px] text-[#b9dce7]"
        >
          {{ combatSyncMessage }}
        </div>

        <div
          v-if="store.selectedToken"
          class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#ddcda9]">
              {{ store.selectedToken.name }}
            </span>

            <button
              type="button"
              class="rounded-md border border-[#60433a] px-2 py-1 text-[9px] text-[#d99b90]"
              @click="store.removeToken(store.selectedToken.id)"
            >
              Удалить
            </button>
          </div>

          <div class="mt-3 space-y-2">
            <label class="block">
              <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                Имя
              </span>

              <input
                :value="store.selectedToken.name"
                type="text"
                class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                @input="store.updateSelectedToken('name', $event.target.value)"
              >
            </label>

            <div class="grid grid-cols-2 gap-2">
              <label>
                <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                  HP
                </span>

                <input
                  :value="store.selectedToken.hp"
                  type="number"
                  min="0"
                  :max="store.selectedToken.maxHp"
                  class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                  @input="store.updateSelectedToken('hp', $event.target.value)"
                >
              </label>

              <label>
                <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                  Max HP
                </span>

                <input
                  :value="store.selectedToken.maxHp"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                  @input="store.updateSelectedToken('maxHp', $event.target.value)"
                >
              </label>

              <label>
                <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                  AC
                </span>

                <input
                  :value="store.selectedToken.ac"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                  @input="store.updateSelectedToken('ac', $event.target.value)"
                >
              </label>

              <label>
                <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                  Speed
                </span>

                <input
                  :value="store.selectedToken.speed"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                  @input="store.updateSelectedToken('speed', $event.target.value)"
                >
              </label>
            </div>

            <label class="block">
              <span class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]">
                Режим движения
              </span>

              <select
                :value="store.selectedToken.movementMode"
                class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
                @change="store.updateSelectedToken('movementMode', $event.target.value)"
              >
                <option
                  v-for="mode in movementModes"
                  :key="mode.id"
                  :value="mode.id"
                >
                  {{ mode.icon }} {{ mode.name }}
                </option>
              </select>
            </label>

            <div class="mt-3 rounded-lg border border-[#3c4f4a] bg-[#13201d] p-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[9px] uppercase tracking-[0.12em] text-[#8daaa2]">
                  Движение
                </span>

                <span class="text-[10px] font-semibold text-[#d8e9df]">
                  {{ getSelectedTokenMovementMode().icon }}
                  {{ getSelectedTokenMovementMode().name }}
                </span>
              </div>

              <div
                v-if="getSelectedTokenMovementStatus()?.enforced"
                class="mt-2 space-y-1.5 text-[10px]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[#b6c9c0]">
                    Пройдено за ход
                  </span>

                  <span class="font-semibold text-[#e6f5ea]">
                    {{ getSelectedTokenMovementStatus()?.usedFeet }} ft
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[#b6c9c0]">
                    Осталось
                  </span>

                  <span class="font-semibold text-[#e6f5ea]">
                    {{ getSelectedTokenMovementStatus()?.remainingFeet }} /
                    {{ getSelectedTokenMovementStatus()?.allowanceFeet }} ft
                  </span>
                </div>

                <div
                  v-if="getSelectedTokenMovementStatus()?.dashUsed"
                  class="rounded-md border border-[#5c4f31] bg-[#211b12] px-2 py-1 text-[9px] text-[#d8bd7d]"
                >
                  Рывок активен · доступно {{ getSelectedTokenMovementStatus()?.allowanceFeet }} ft
                </div>
              </div>

              <div
                v-else
                class="mt-2 text-[10px] text-[#a9bcb3]"
              >
                Свободное перемещение вне боя
              </div>

              <div
                v-if="getSelectedTokenMovementStatus()?.enforced && !getSelectedTokenMovementStatus()?.currentTurn"
                class="mt-2 rounded-md border border-[#564239] bg-[#211714] px-2 py-1.5 text-[9px] text-[#dfc5b7]"
              >
                Сейчас ход другого участника.
              </div>

              <button
                v-if="getSelectedTokenMovementStatus()?.enforced && getSelectedTokenMovementStatus()?.currentTurn"
                type="button"
                class="mt-2 w-full rounded-md border px-2 py-1.5 text-[10px] transition"
                :class="store.canDashToken(store.selectedToken.id)
                  ? 'border-[#8a7040] bg-[#2a2115] text-[#eed59a] hover:bg-[#352817]'
                  : 'border-[#40382c] bg-[#17130f] text-[#6f675b]'"
                :disabled="!store.canDashToken(store.selectedToken.id)"
                @click="store.useDashToken(store.selectedToken.id)"
              >
                Рывок · +{{ store.selectedToken.speed }} ft движения
              </button>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-1">
            <span class="rounded-full border border-[#42515b] bg-[#172027] px-2 py-1 text-[9px] text-[#b9ced9]">
              {{ store.selectedToken.tokenType }}
            </span>

            <span
              v-if="store.selectedToken.combatParticipantId"
              class="rounded-full border border-[#5f6b45] bg-[#1d2417] px-2 py-1 text-[9px] text-[#c7d6a6]"
            >
              Связан с боем
            </span>
          </div>
        </div>

        <div
          v-else
          class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3 text-[10px] leading-5 text-[#d0c4b3]"
        >
          Пустой hex создаёт токен выбранного типа. Существующий токен выбирается кликом или перемещается перетаскиванием.
        </div>
      </div>

      <div
        v-if="store.editorMode === 'erase'"
        class="mt-3 rounded-xl border border-[#4b3934] bg-[#17110f] p-3 text-[11px] leading-5 text-[#bcaea0]"
      >
        Ластик удаляет объект с клетки. Если объекта нет, удаляется terrain.
      </div>

      <div
        v-if="store.editorMode === 'select'"
        class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3 text-[11px] leading-5 text-[#d0c4b3]"
      >
        Режим выбора. Клик по hex выбирает клетку или объект.
      </div>
    </div>

    <div class="absolute right-4 top-4 z-20 rounded-2xl border border-[#655038] bg-[#1b1712]/90 px-4 py-3 text-xs text-[#c6b58e] shadow-xl backdrop-blur">
      <div class="font-semibold tracking-[0.18em] text-[#e6d4ac]">
        HEX BATTLEFIELD
      </div>

      <div class="mt-1">
        {{ store.width }} × {{ store.height }} · {{ store.cellSizeFeet }} ft / hex · {{ store.tokens.length }} tokens
      </div>
    </div>

    <div
      v-if="dragging && draggedTokenId && tacticalPreview"
      class="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-[#5f7f8c] bg-[#0f171a]/94 px-5 py-3 text-center shadow-2xl backdrop-blur-xl"
    >
      <div class="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#83a9b5]">
        Перемещение
      </div>
      <div class="mt-1 text-base font-semibold text-[#e4f1f4]">
        {{ tacticalPreview.distanceFeet }} ft · {{ tacticalPreview.distanceHexes }} hex
      </div>
      <div
        v-if="draggedTokenId && getTokenMovementPreview(draggedTokenId, tacticalPreview.distanceFeet)"
        class="mt-2 flex items-center justify-center gap-4 text-[11px]"
      >
        <span class="text-[#d0c4b3]">
          Пройдено: <b class="text-[#f0d788]">{{ getTokenMovementPreview(draggedTokenId, tacticalPreview.distanceFeet).usedFeet }} ft</b>
        </span>
        <span class="text-[#d0c4b3]">
          Осталось: <b :class="getTokenMovementPreview(draggedTokenId, tacticalPreview.distanceFeet).remainingFeet > 0 ? 'text-[#9fd8a7]' : 'text-[#ea8b82]'">{{ getTokenMovementPreview(draggedTokenId, tacticalPreview.distanceFeet).remainingFeet }} ft</b>
        </span>
      </div>
      <div class="mt-1 flex items-center justify-center gap-2 text-[10px]">
        <span :class="tacticalPreview.visible ? 'text-[#9fd8a7]' : 'text-[#ea8b82]'">
          {{ tacticalPreview.visible ? 'Line of Sight' : 'Обзор заблокирован' }}
        </span>
        <span v-if="tacticalPreview.cover" class="text-[#d5bf86]">
          · {{ tacticalPreview.cover }} cover
        </span>
      </div>
    </div>

    <div
      v-if="store.hoveredHex"
      class="absolute bottom-4 z-20 rounded-2xl border border-[#5f4a31] bg-[#1b1712]/90 px-4 py-3 text-xs text-[#c6b58e] shadow-xl backdrop-blur"
      :class="showEditorPanel ? 'left-[350px]' : 'left-4'"
    >
      <div class="font-semibold text-[#e6d4ac]">
        HEX {{ store.hoveredHex.q }}, {{ store.hoveredHex.r }}
      </div>

      <div class="mt-1">
        {{ store.hoveredHex.q * store.cellSizeFeet }} ft,
        {{ store.hoveredHex.r * store.cellSizeFeet }} ft
      </div>
    </div>

    <div
      v-if="store.selectedToken"
      class="absolute bottom-5 right-5 z-30 w-[250px] rounded-2xl border border-[#5b7984] bg-[#10171a]/90 px-4 py-3 shadow-2xl backdrop-blur-xl"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-[9px] uppercase tracking-[0.18em] text-[#7e9aa4]">
            Selected Token
          </div>
          <div class="mt-1 text-sm font-semibold text-[#e7f2f4]">
            {{ store.selectedToken.name }}
          </div>
        </div>
        <div class="text-right text-[10px] text-[#adc4ca]">
          AC {{ store.selectedToken.ac }}
        </div>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-[#0b0e0f]">
        <div
          class="h-full rounded-full transition-all"
          :class="store.selectedToken.faction === 'hostile' ? 'bg-[#d96b63]' : store.selectedToken.faction === 'neutral' ? 'bg-[#d6b36d]' : 'bg-[#54c5bc]'"
          :style="{ width: `${store.selectedToken.maxHp ? Math.max(0, Math.min(1, store.selectedToken.hp / store.selectedToken.maxHp)) * 100 : 0}%` }"
        />
      </div>
      <div class="mt-2 flex items-center justify-between text-[10px] text-[#9db4bb]">
        <span>HP {{ store.selectedToken.hp }} / {{ store.selectedToken.maxHp }}</span>
        <span>{{ getSelectedTokenMovementStatus()?.usedFeet ?? 0 }} / {{ getSelectedTokenMovementStatus()?.allowanceFeet ?? store.selectedToken.speed }} ft</span>
      </div>
    </div>

    <div
      v-if="store.selectedHex && !store.selectedToken"
      class="absolute bottom-4 right-4 z-20 rounded-2xl border border-[#8a6b3e] bg-[#241c12]/95 px-4 py-3 text-xs text-[#dfc88d] shadow-xl backdrop-blur"
    >
      <div class="font-semibold tracking-wide">
        SELECTED HEX
      </div>

      <div class="mt-1">
        q={{ store.selectedHex.q }} · r={{ store.selectedHex.r }}
      </div>
    </div>

    <div
      v-if="pendingOpportunityAttacks.length"
      class="pointer-events-auto fixed left-1/2 top-5 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2 rounded-xl border border-red-400/50 bg-[#17120f]/95 p-4 text-[#f4e7c8] shadow-2xl backdrop-blur-md"
    >
      <div class="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
        Провоцированная атака
      </div>
      <div class="mt-2 text-sm text-[#d8cbb2]">
        Перемещение спровоцировало Opportunity Attack.
      </div>

      <div class="mt-3 space-y-2">
        <div
          v-for="opportunity in pendingOpportunityAttacks"
          :key="opportunity.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3"
        >
          <div>
            <div class="font-semibold">
              {{ getParticipantName(opportunity.attackerId) }}
              →
              {{ getParticipantName(opportunity.targetId) }}
            </div>
            <div class="mt-1 text-xs text-[#a99d87]">
              Реакция доступна
            </div>
          </div>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-red-300/50 bg-red-900/40 px-3 py-2 text-xs font-semibold hover:bg-red-800/50"
              @click="combatStore.useOpportunityAttack(opportunity.id)"
            >
              Атаковать
            </button>
            <button
              type="button"
              class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
              @click="combatStore.declineOpportunityAttack(opportunity.id)"
            >
              Не атаковать
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
