<script setup>
import {
  onBeforeUnmount,
  onMounted,
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
import { terrainTypes } from '~/data/battlefield/terrain'

const props = defineProps({
  height: {
    type: String,
    default: '760px'
  }
})

const host = ref(null)
const store = useBattlefieldStore()

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
let gridLayer = null
let interactionLayer = null
let overlayLayer = null
let tokenLayer = null
let labelsLayer = null

let resizeObserver = null
let resizeHandler = null

let pointerDown = false
let dragging = false
let activePointerId = null
let pointerStart = null
let worldStart = null

let hoverHexGraphic = null
let selectedHexGraphic = null

let forestSprite = null
let forestMask = null

const baseHexSize = 32

const minZoom = 0.55
const maxZoom = 1.65
const zoomStep = 1.12

const textureSeed = 2917

const getLocalPoint = event => {
  const rect =
    app.canvas.getBoundingClientRect()

  return {
    x:
      event.clientX -
      rect.left,

    y:
      event.clientY -
      rect.top
  }
}

const hash = (q, r) => {
  const value =
    Math.sin(
      q * 12.9898 +
      r * 78.233 +
      textureSeed
    ) *
    43758.5453

  return (
    value -
    Math.floor(value)
  )
}

const cross = (
  o,
  a,
  b
) => {
  return (
    (a.x - o.x) *
      (b.y - o.y) -
    (a.y - o.y) *
      (b.x - o.x)
  )
}

const getHexPolygon = (
  q,
  r,
  size = baseHexSize
) => {
  const center =
    hexToPixel(
      q,
      r,
      size
    )

  const corners =
    getHexCorners(
      center.x,
      center.y,
      size
    )

  return corners.flatMap(
    point => [
      point.x,
      point.y
    ]
  )
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
      const center =
        hexToPixel(
          q,
          r,
          baseHexSize
        )

      const corners =
        getHexCorners(
          center.x,
          center.y,
          baseHexSize
        )

      points.push(
        ...corners
      )
    }
  }

  const sorted =
    [...points].sort(
      (a, b) => {
        if (
          a.x !== b.x
        ) {
          return (
            a.x -
            b.x
          )
        }

        return (
          a.y -
          b.y
        )
      }
    )

  const lower = []

  for (
    const point of sorted
  ) {
    while (
      lower.length >= 2 &&
      cross(
        lower[
          lower.length - 2
        ],
        lower[
          lower.length - 1
        ],
        point
      ) <= 0
    ) {
      lower.pop()
    }

    lower.push(point)
  }

  const upper = []

  for (
    let index =
      sorted.length - 1;
    index >= 0;
    index -= 1
  ) {
    const point =
      sorted[index]

    while (
      upper.length >= 2 &&
      cross(
        upper[
          upper.length - 2
        ],
        upper[
          upper.length - 1
        ],
        point
      ) <= 0
    ) {
      upper.pop()
    }

    upper.push(point)
  }

  lower.pop()
  upper.pop()

  return lower.concat(
    upper
  )
}

const getBoardBounds = () => {
  const hull =
    getBoardHull()

  const xs =
    hull.map(
      point => point.x
    )

  const ys =
    hull.map(
      point => point.y
    )

  return {
    hull,

    minX:
      Math.min(...xs),

    maxX:
      Math.max(...xs),

    minY:
      Math.min(...ys),

    maxY:
      Math.max(...ys)
  }
}

const clearLayerChildren =
  layer => {
    if (!layer) {
      return
    }

    layer
      .removeChildren()
      .forEach(
        child => {
          child.destroy()
        }
      )
  }

const createBoardMask = () => {
  const hull =
    getBoardHull()

  const polygon =
    hull.flatMap(
      point => [
        point.x,
        point.y
      ]
    )

  return new Graphics()
    .poly(polygon)
    .fill({
      color: 0xffffff,
      alpha: 1
    })
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
      getHexPolygon(
        q,
        r
      )
    )
    .stroke({
      width,
      color,
      alpha,
      pixelLine: true
    })
}

const drawTerrainCell = (
  q,
  r
) => {
  return new Graphics()
    .poly(
      getHexPolygon(
        q,
        r
      )
    )
    .fill({
      color: 0xffffff,
      alpha: 0.001
    })
}

const drawTerrainOverlay = (
  q,
  r
) => {
  const cell =
    store.getCell(
      q,
      r
    )

  if (
    !cell ||
    cell.terrainId ===
      'grass'
  ) {
    return null
  }

  const terrain =
    store.getTerrain(
      cell.terrainId
    )

  if (!terrain) {
    return null
  }

  const center =
    hexToPixel(
      q,
      r,
      baseHexSize
    )

  const graphic =
    new Graphics()
      .poly(
        getHexPolygon(
          q,
          r
        )
      )
      .fill({
        color:
          terrain.color,

        alpha:
          terrain.alpha
      })
      .stroke({
        width:
          terrain.difficult
            ? 1.5
            : 1,

        color:
          terrain.color,

        alpha:
          Math.min(
            0.45,
            terrain.alpha +
              0.08
          ),

        pixelLine:
          true
      })

  if (
    cell.terrainId ===
    'water'
  ) {
    graphic
      .moveTo(
        center.x - 12,
        center.y - 5
      )
      .lineTo(
        center.x + 11,
        center.y - 5
      )
      .stroke({
        width: 1,
        color: 0x8bd2df,
        alpha: 0.24,
        pixelLine: true
      })

    graphic
      .moveTo(
        center.x - 8,
        center.y + 5
      )
      .lineTo(
        center.x + 15,
        center.y + 5
      )
      .stroke({
        width: 1,
        color: 0x8bd2df,
        alpha: 0.18,
        pixelLine: true
      })
  }

  if (
    cell.terrainId ===
    'snow'
  ) {
    graphic
      .circle(
        center.x - 7,
        center.y - 4,
        2
      )
      .fill({
        color: 0xeef7f5,
        alpha: 0.3
      })

    graphic
      .circle(
        center.x + 8,
        center.y + 4,
        2
      )
      .fill({
        color: 0xeef7f5,
        alpha: 0.25
      })
  }

  if (
    cell.terrainId ===
    'mud'
  ) {
    graphic
      .ellipse(
        center.x - 8,
        center.y + 2,
        7,
        3
      )
      .fill({
        color: 0x2d2116,
        alpha: 0.2
      })
  }

  if (
    cell.terrainId ===
    'forest'
  ) {
    graphic
      .circle(
        center.x - 8,
        center.y - 6,
        5
      )
      .fill({
        color: 0x18351e,
        alpha: 0.34
      })

    graphic
      .circle(
        center.x + 7,
        center.y + 7,
        4
      )
      .fill({
        color: 0x18351e,
        alpha: 0.3
      })
  }

  return graphic
}

const drawForestFallback =
  () => {
    const {
      hull,
      minX,
      maxX,
      minY,
      maxY
    } =
      getBoardBounds()

    const polygon =
      hull.flatMap(
        point => [
          point.x,
          point.y
        ]
      )

    const width =
      maxX -
      minX

    const height =
      maxY -
      minY

    const base =
      new Graphics()
        .poly(polygon)
        .fill({
          color: 0x243724,
          alpha: 1
        })

    backgroundLayer.addChild(
      base
    )

    const atmosphere =
      new Graphics()

    for (
      let index = 0;
      index < 180;
      index += 1
    ) {
      const x =
        minX +
        Math.random() *
          width

      const y =
        minY +
        Math.random() *
          height

      const radius =
        8 +
        Math.random() *
          34

      atmosphere
        .circle(
          x,
          y,
          radius
        )
        .fill({
          color:
            index % 3 === 0
              ? 0x58774d
              : index % 3 === 1
                ? 0x3d5b3c
                : 0x30492f,

          alpha:
            0.05 +
            Math.random() *
              0.07
        })
    }

    const mask =
      createBoardMask()

    atmosphere.mask =
      mask

    backgroundLayer.addChild(
      atmosphere,
      mask
    )
  }

const drawForestBackground =
  async () => {
    clearLayerChildren(
      backgroundLayer
    )

    const {
      hull,
      minX,
      maxX,
      minY,
      maxY
    } =
      getBoardBounds()

    const polygon =
      hull.flatMap(
        point => [
          point.x,
          point.y
        ]
      )

    const boardWidth =
      maxX -
      minX

    const boardHeight =
      maxY -
      minY

    const shadow =
      new Graphics()
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

    backgroundLayer.addChild(
      shadow
    )

    try {
      const texture =
        await Assets.load(
          '/battlefield/forest-clearing.png'
        )

      forestSprite =
        new Sprite(
          texture
        )

      const scale =
        Math.max(
          boardWidth /
            texture.width,
          boardHeight /
            texture.height
        )

      forestSprite.width =
        texture.width *
        scale

      forestSprite.height =
        texture.height *
        scale

      forestSprite.x =
        minX +
        (
          boardWidth -
          forestSprite.width
        ) /
          2

      forestSprite.y =
        minY +
        (
          boardHeight -
          forestSprite.height
        ) /
          2

      forestMask =
        createBoardMask()

      forestSprite.mask =
        forestMask

      backgroundLayer.addChild(
        forestSprite,
        forestMask
      )
    } catch {
      drawForestFallback()
    }

    const atmosphere =
      new Graphics()
        .poly(polygon)
        .fill({
          color: 0x071008,
          alpha: 0.12
        })

    backgroundLayer.addChild(
      atmosphere
    )
  }

const drawSelection =
  () => {
    if (
      selectedHexGraphic
    ) {
      selectedHexGraphic.destroy()

      selectedHexGraphic =
        null
    }

    if (
      !store.selectedHex
    ) {
      return
    }

    selectedHexGraphic =
      new Graphics()
        .poly(
          getHexPolygon(
            store.selectedHex.q,
            store.selectedHex.r
          )
        )
        .fill({
          color: 0xe8c96f,
          alpha: 0.08
        })
        .stroke({
          width: 3,
          color: 0xf0d788,
          alpha: 0.9,
          pixelLine: true
        })

    overlayLayer.addChild(
      selectedHexGraphic
    )
  }

const drawHover =
  hex => {
    if (
      hoverHexGraphic
    ) {
      hoverHexGraphic.destroy()

      hoverHexGraphic =
        null
    }

    if (!hex) {
      return
    }

    const color =
      store.editorMode ===
      'select'
        ? 0xf0dfb2
        : store.editorMode ===
            'erase'
          ? 0xe7756b
          : (
              store.getTerrain(
                store.selectedTerrainId
              )?.color ??
              0xc6ac73
            )

    hoverHexGraphic =
      new Graphics()
        .poly(
          getHexPolygon(
            hex.q,
            hex.r
          )
        )
        .fill({
          color,
          alpha: 0.055
        })
        .stroke({
          width: 2,
          color,
          alpha: 0.7,
          pixelLine: true
        })

    overlayLayer.addChild(
      hoverHexGraphic
    )
  }

const paintHex = hex => {
  if (!hex) {
    return
  }

  if (
    store.editorMode ===
    'terrain'
  ) {
    store.paintTerrain(
      hex.q,
      hex.r
    )

    store.setSelectedHex(
      hex
    )

    return
  }

  if (
    store.editorMode ===
    'erase'
  ) {
    store.eraseTerrain(
      hex.q,
      hex.r
    )

    store.setSelectedHex(
      hex
    )

    return
  }

  store.setSelectedHex(
    hex
  )
}

const handleHexPointerOver =
  hex => {
    store.setHoveredHex(
      hex
    )

    drawHover(
      hex
    )

    if (
      pointerDown &&
      !dragging &&
      activePointerId !== null &&
      store.editorMode !==
        'select'
    ) {
      paintHex(
        hex
      )
    }
  }

const createToken =
  participant => {
    const container =
      new Container()

    const size =
      baseHexSize

    const center =
      hexToPixel(
        participant.position.q,
        participant.position.r,
        size
      )

    const isPlayer =
      participant.type ===
      'player'

    const rimColor =
      isPlayer
        ? 0x8fd9ff
        : 0xff746e

    const shadow =
      new Graphics()
        .ellipse(
          0,
          size *
            0.42,
          size *
            0.5,
          size *
            0.16
        )
        .fill({
          color:
            0x050403,
          alpha:
            0.42
        })

    const outer =
      new Graphics()
        .circle(
          0,
          0,
          size *
            0.57
        )
        .fill({
          color:
            0x171411,
          alpha:
            0.96
        })
        .stroke({
          width:
            3,
          color:
            rimColor,
          alpha:
            0.9
        })

    const inner =
      new Graphics()
        .circle(
          0,
          0,
          size *
            0.45
        )
        .fill({
          color:
            isPlayer
              ? 0x355f72
              : 0x6f3735,
          alpha:
            0.98
        })

    const tokenLabel =
      new Text({
        text:
          participant.name
            .slice(
              0,
              1
            )
            .toUpperCase(),

        style: {
          fontFamily:
            'Georgia, serif',

          fontSize:
            22,

          fontWeight:
            '700',

          fill:
            isPlayer
              ? '#d9f5ff'
              : '#ffe3df',

          align:
            'center'
        },

        anchor:
          0.5
      })

    const hpBackground =
      new Graphics()
        .roundRect(
          -size *
            0.5,

          size *
            0.63,

          size,

          6,

          3
        )
        .fill({
          color:
            0x0a0807,

          alpha:
            0.9
        })

    const hpRatio =
      participant.maxHp >
      0
        ? clamp(
            participant.hp /
              participant.maxHp,

            0,

            1
          )
        : 0

    const hpBar =
      new Graphics()
        .roundRect(
          -size *
            0.5,

          size *
            0.63,

          size *
            hpRatio,

          6,

          3
        )
        .fill({
          color:
            isPlayer
              ? 0x4ecdc4
              : 0xe96b63,

          alpha:
            0.96
        })

    const nameLabel =
      new Text({
        text:
          participant.name,

        style: {
          fontFamily:
            'Inter, Arial, sans-serif',

          fontSize:
            11,

          fontWeight:
            '600',

          fill:
            '#f7f0df',

          stroke: {
            color:
              '#0a0807',

            width:
              3
          }
        },

        anchor:
          0.5,

        y:
          size *
          0.9
      })

    container.addChild(
      shadow,
      outer,
      inner,
      tokenLabel,
      hpBackground,
      hpBar,
      nameLabel
    )

    container.position.set(
      center.x,
      center.y
    )

    container.eventMode =
      'static'

    container.cursor =
      'pointer'

    container.on(
      'pointertap',
      () => {
        store.setSelectedHex({
          q:
            participant.position.q,

          r:
            participant.position.r
        })
      }
    )

    return container
  }

const drawBattlefield =
  () => {
    if (
      !app ||
      !world
    ) {
      return
    }

    clearLayerChildren(
      terrainLayer
    )

    clearLayerChildren(
      gridLayer
    )

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
        const terrainOverlay =
          drawTerrainOverlay(
            q,
            r
          )

        if (
          terrainOverlay
        ) {
          terrainLayer.addChild(
            terrainOverlay
          )
        }

        const grid =
          drawHexOutline(
            q,
            r,
            0xd7ba7b,
            0.22,
            1
          )

        grid.eventMode =
          'none'

        gridLayer.addChild(
          grid
        )

        const interaction =
          drawTerrainCell(
            q,
            r
          )

        interaction.eventMode =
          'static'

        interaction.cursor =
          'pointer'

        interaction.on(
          'pointerover',
          () => {
            handleHexPointerOver({
              q,
              r
            })
          }
        )

        interaction.on(
          'pointerout',
          () => {
            store.setHoveredHex(
              null
            )

            drawHover(
              null
            )
          }
        )

        interaction.on(
          'pointertap',
          () => {
            paintHex({
              q,
              r
            })
          }
        )

        interactionLayer.addChild(
          interaction
        )

        if (
          store.showCoordinates
        ) {
          const center =
            hexToPixel(
              q,
              r,
              baseHexSize
            )

          const label =
            new Text({
              text:
                `${q},${r}`,

              style: {
                fontFamily:
                  'Inter, Arial, sans-serif',

                fontSize:
                  7,

                fill:
                  '#d6c69f',

                alpha:
                  0.42
              },

              anchor:
                0.5
            })

          label.position.set(
            center.x,
            center.y +
              baseHexSize *
                0.34
          )

          labelsLayer.addChild(
            label
          )
        }
      }
    }

    store.participants.forEach(
      participant => {
        tokenLayer.addChild(
          createToken(
            participant
          )
        )
      }
    )

    drawSelection()
  }

const centerWorld =
  () => {
    if (
      !app ||
      !world
    ) {
      return
    }

    const {
      minX,
      maxX,
      minY,
      maxY
    } =
      getBoardBounds()

    const width =
      maxX -
      minX

    const height =
      maxY -
      minY

    world.scale.set(
      1
    )

    world.x =
      (
        app.screen.width -
        width
      ) /
        2 -
      minX

    world.y =
      (
        app.screen.height -
        height
      ) /
        2 -
      minY
  }

const updatePointerCursor =
  event => {
    if (
      !app ||
      !world
    ) {
      return
    }

    const local =
      getLocalPoint(
        event
      )

    const worldX =
      (
        local.x -
        world.x
      ) /
      world.scale.x

    const worldY =
      (
        local.y -
        world.y
      ) /
      world.scale.y

    const hex =
      pixelToHex(
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
      drawHover(
        null
      )

      store.setHoveredHex(
        null
      )

      return
    }

    if (
      !store.hoveredHex ||
      store.hoveredHex.q !==
        hex.q ||
      store.hoveredHex.r !==
        hex.r
    ) {
      store.setHoveredHex(
        hex
      )

      drawHover(
        hex
      )
    }
  }

const onPointerDown =
  event => {
    pointerDown =
      true

    dragging =
      false

    activePointerId =
      event.pointerId

    pointerStart =
      getLocalPoint(
        event
      )

    worldStart = {
      x:
        world.x,

      y:
        world.y
    }
  }

const onPointerMove =
  event => {
    if (
      pointerDown &&
      event.pointerId ===
        activePointerId
    ) {
      const local =
        getLocalPoint(
          event
        )

      const dx =
        local.x -
        pointerStart.x

      const dy =
        local.y -
        pointerStart.y

      if (
        Math.abs(dx) > 4 ||
        Math.abs(dy) > 4
      ) {
        dragging =
          true
      }

      if (
        dragging
      ) {
        world.x =
          worldStart.x +
          dx

        world.y =
          worldStart.y +
          dy
      }
    }

    updatePointerCursor(
      event
    )
  }

const onPointerUp =
  event => {
    if (
      event.pointerId !==
      activePointerId
    ) {
      return
    }

    pointerDown =
      false

    activePointerId =
      null
  }

const onWheel =
  event => {
    event.preventDefault()

    if (
      !app ||
      !world
    ) {
      return
    }

    const direction =
      event.deltaY > 0
        ? 1 /
          zoomStep
        : zoomStep

    const nextScale =
      clamp(
        world.scale.x *
          direction,

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
      getLocalPoint(
        event
      )

    const worldPoint = {
      x:
        (
          local.x -
          world.x
        ) /
        world.scale.x,

      y:
        (
          local.y -
          world.y
        ) /
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

const onResize =
  () => {}

onMounted(
  async () => {
    app =
      new Application()

    await app.init({
      resizeTo:
        host.value,

      antialias:
        true,

      background:
        '#090806'
    })

    host.value.appendChild(
      app.canvas
    )

    backgroundLayer =
      new Container()

    world =
      new Container()

    terrainLayer =
      new Container()

    gridLayer =
      new Container()

    interactionLayer =
      new Container()

    overlayLayer =
      new Container()

    tokenLayer =
      new Container()

    labelsLayer =
      new Container()

    world.addChild(
      backgroundLayer,
      terrainLayer,
      gridLayer,
      interactionLayer,
      overlayLayer,
      tokenLayer,
      labelsLayer
    )

    app.stage.addChild(
      world
    )

    await drawForestBackground()

    const title =
      new Text({
        text:
          'CULT OF MIMIC · BATTLEFIELD',

        style:
          new TextStyle({
            fontFamily:
              'Georgia, serif',

            fontSize:
              16,

            fontWeight:
              '700',

            fill:
              '#e6d4ac',

            letterSpacing:
              2
          })
      })

    title.position.set(
      22,
      18
    )

    app.stage.addChild(
      title
    )

    const scaleLabel =
      new Text({
        text:
          '1 HEX = 5 FT',

        style:
          new TextStyle({
            fontFamily:
              'Inter, Arial, sans-serif',

            fontSize:
              11,

            fontWeight:
              '600',

            fill:
              '#b7aa8e'
          })
      })

    scaleLabel.position.set(
      22,
      42
    )

    app.stage.addChild(
      scaleLabel
    )

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
      'pointerleave',
      () => {
        if (
          !pointerDown
        ) {
          drawHover(
            null
          )

          store.setHoveredHex(
            null
          )
        }
      }
    )

    canvas.addEventListener(
      'wheel',
      onWheel,
      {
        passive:
          false
      }
    )

    resizeHandler =
      onResize

    window.addEventListener(
      'resize',
      resizeHandler
    )

    resizeObserver =
      new ResizeObserver(
        () => {
          onResize()
        }
      )

    resizeObserver.observe(
      host.value
    )
  }
)

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
  () => store.participants,
  () => {
    drawBattlefield()
  },
  {
    deep:
      true
  }
)

watch(
  () =>
    store.showCoordinates,
  () => {
    drawBattlefield()
  }
)

watch(
  () =>
    store.cells,
  () => {
    drawBattlefield()
  },
  {
    deep:
      true
  }
)

onBeforeUnmount(
  () => {
    if (
      resizeObserver
    ) {
      resizeObserver.disconnect()

      resizeObserver =
        null
    }

    if (
      resizeHandler
    ) {
      window.removeEventListener(
        'resize',
        resizeHandler
      )

      resizeHandler =
        null
    }

    if (app) {
      const canvas =
        app.canvas

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

      canvas.removeEventListener(
        'wheel',
        onWheel
      )

      app.destroy({
        removeView:
          true,

        children:
          true,

        texture:
          true,

        textureSource:
          true
      })

      app =
        null
    }
  }
)
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-[#5f4a31] bg-[#14120f] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
    :style="{
      height: props.height
    }"
  >
    <div
      ref="host"
      class="absolute inset-0"
    />

    <div
      class="absolute left-4 top-4 z-20 w-[270px] rounded-2xl border border-[#665238] bg-[#14110d]/94 p-3 text-[#efe5d2] shadow-2xl backdrop-blur-md"
    >
      <div
        class="flex items-center justify-between"
      >
        <div>
          <div
            class="text-[10px] font-semibold tracking-[0.22em] text-[#a58a59]"
          >
            DM EDITOR
          </div>

          <div
            class="mt-1 text-sm font-semibold text-[#f0e5ce]"
          >
            Редактор поля
          </div>
        </div>

        <button
          type="button"
          class="rounded-lg border border-[#5e4c34] px-2 py-1 text-[10px] text-[#cbb78c] transition hover:border-[#9d7c46] hover:bg-[#241c14]"
          @click="store.clearTerrain"
        >
          Очистить
        </button>
      </div>

      <div
        class="mt-3 grid grid-cols-3 gap-2"
      >
        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="
            store.editorMode === 'select'
              ? 'border-[#c9a95f] bg-[#2a2115] text-[#f2d78e]'
              : 'border-[#4f4230] bg-[#17130f] text-[#b8aa8c] hover:bg-[#211b15]'
          "
          @click="
            store.setEditorMode(
              'select'
            )
          "
        >
          Выбор
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="
            store.editorMode === 'terrain'
              ? 'border-[#80a66b] bg-[#203020] text-[#d4e6c9]'
              : 'border-[#4f4230] bg-[#17130f] text-[#b8aa8c] hover:bg-[#211b15]'
          "
          @click="
            store.setEditorMode(
              'terrain'
            )
          "
        >
          Terrain
        </button>

        <button
          type="button"
          class="rounded-lg border px-2 py-2 text-[11px] transition"
          :class="
            store.editorMode === 'erase'
              ? 'border-[#a66b61] bg-[#30201d] text-[#f1c2bb]'
              : 'border-[#4f4230] bg-[#17130f] text-[#b8aa8c] hover:bg-[#211b15]'
          "
          @click="
            store.setEditorMode(
              'erase'
            )
          "
        >
          Ластик
        </button>
      </div>

      <div
        v-if="
          store.editorMode ===
          'terrain'
        "
        class="mt-3"
      >
        <div
          class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e826d]"
        >
          Тип поверхности
        </div>

        <div
          class="grid grid-cols-2 gap-2"
        >
          <button
            v-for="
              terrain in terrainTypes
            "
            :key="
              terrain.id
            "
            type="button"
            class="flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] transition"
            :class="
              store.selectedTerrainId === terrain.id
                ? 'border-[#c8a45b] bg-[#2b2217] text-[#f1d995]'
                : 'border-[#40382c] bg-[#16130f] text-[#c6b9a1] hover:bg-[#201a14]'
            "
            @click="
              store.setSelectedTerrain(
                terrain.id
              )
            "
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              :style="{
                backgroundColor: `#${terrain.color.toString(16).padStart(6, '0')}`
              }"
            >
              {{ terrain.icon }}
            </span>

            <span
              class="min-w-0"
            >
              <span
                class="block truncate font-semibold"
              >
                {{ terrain.name }}
              </span>

              <span
                class="mt-0.5 block text-[9px] text-[#837965]"
              >
                {{ terrain.movementCost }}× движение
              </span>
            </span>
          </button>
        </div>

        <div
          v-if="
            store.getTerrain(
              store.selectedTerrainId
            )
          "
          class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3"
        >
          <div
            class="flex items-center justify-between"
          >
            <span
              class="text-xs font-semibold text-[#ddcda9]"
            >
              {{
                store.getTerrain(
                  store.selectedTerrainId
                ).name
              }}
            </span>

            <span
              class="text-[10px] text-[#91856f]"
            >
              {{
                store.getTerrain(
                  store.selectedTerrainId
                ).movementCost
              }}×
            </span>
          </div>

          <div
            class="mt-2 flex flex-wrap gap-1"
          >
            <span
              v-if="
                store.getTerrain(
                  store.selectedTerrainId
                ).difficult
              "
              class="rounded-full border border-[#705c39] bg-[#271f14] px-2 py-1 text-[9px] text-[#d7bd80]"
            >
              Difficult terrain
            </span>

            <span
              v-if="
                store.getTerrain(
                  store.selectedTerrainId
                ).blocksLineOfSight
              "
              class="rounded-full border border-[#5c4a3a] bg-[#211a15] px-2 py-1 text-[9px] text-[#cfbca1]"
            >
              Блокирует обзор
            </span>

            <span
              v-if="
                store.getTerrain(
                  store.selectedTerrainId
                ).cover
              "
              class="rounded-full border border-[#536146] bg-[#1c261a] px-2 py-1 text-[9px] text-[#b9cfaa]"
            >
              Cover:
              {{
                store.getTerrain(
                  store.selectedTerrainId
                ).cover
              }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-else-if="
          store.editorMode ===
          'erase'
        "
        class="mt-3 rounded-xl border border-[#4b3934] bg-[#17110f] p-3 text-[11px] leading-5 text-[#bcaea0]"
      >
        Нажимай на клетки, чтобы удалить назначенный terrain и вернуть базовый лесной фон.
      </div>

      <div
        v-else
        class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3 text-[11px] leading-5 text-[#b9ad98]"
      >
        Режим выбора. Клик по hex выбирает клетку. ЛКМ по полю также можно использовать для перемещения камеры.
      </div>
    </div>

    <div
      class="absolute right-4 top-4 z-20 rounded-2xl border border-[#655038] bg-[#1b1712]/90 px-4 py-3 text-xs text-[#c6b58e] shadow-xl backdrop-blur"
    >
      <div
        class="font-semibold tracking-[0.18em] text-[#e6d4ac]"
      >
        HEX BATTLEFIELD
      </div>

      <div
        class="mt-1"
      >
        {{
          store.width
        }}
        ×
        {{
          store.height
        }}
        ·
        {{
          store.cellSizeFeet
        }}
        ft / hex
      </div>
    </div>

    <div
      v-if="
        store.hoveredHex
      "
      class="absolute bottom-4 left-4 z-20 rounded-2xl border border-[#5f4a31] bg-[#1b1712]/90 px-4 py-3 text-xs text-[#c6b58e] shadow-xl backdrop-blur"
    >
      <div
        class="font-semibold text-[#e6d4ac]"
      >
        HEX
        {{
          store.hoveredHex.q
        }},
        {{
          store.hoveredHex.r
        }}
      </div>

      <div
        class="mt-1"
      >
        {{
          store.hoveredHex.q *
          store.cellSizeFeet
        }}
        ft,

        {{
          store.hoveredHex.r *
          store.cellSizeFeet
        }}
        ft
      </div>
    </div>

    <div
      v-if="
        store.selectedHex
      "
      class="absolute bottom-4 right-4 z-20 rounded-2xl border border-[#8a6b3e] bg-[#241c12]/95 px-4 py-3 text-xs text-[#dfc88d] shadow-xl backdrop-blur"
    >
      <div
        class="font-semibold tracking-wide"
      >
        SELECTED HEX
      </div>

      <div
        class="mt-1"
      >
        q={{
          store.selectedHex.q
        }}
        ·
        r={{
          store.selectedHex.r
        }}
      </div>
    </div>
  </section>
</template>