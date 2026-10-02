import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { battlefieldDefaults } from '~/data/battlefield/battlefieldDefaults'
import {
  terrainById,
  defaultTerrainId
} from '~/data/battlefield/terrain'
import {
  battlefieldObjectById,
  defaultObjectTypeId
} from '~/data/battlefield/objects'
import {
  battlefieldTokenTypeById,
  defaultTokenTypeId
} from '~/data/battlefield/tokens'
import {
  defaultMovementMode,
  movementModeById,
  getTerrainMovementMultiplier,
  normalizeMovementMode
} from '~/data/battlefield/movement'
import { useCombatStore } from '~/stores/combat'
import { useCharactersStore } from '~/stores/characters'
import {
  getAreaCells,
  getAreaDirection,
  getPushDestination
} from '~/domain/combat/spellAreaEngine'

const getCellKey = (q, r) => `${q}:${r}`

let objectSequence = 0
let tokenSequence = 0

const getObjectCells = object => {
  return object.footprint.map(offset => ({
    q: object.position.q + offset.q,
    r: object.position.r + offset.r
  }))
}

const getTokenCells = token => {
  return token.footprint.map(offset => ({
    q: token.position.q + offset.q,
    r: token.position.r + offset.r
  }))
}

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

const getHexNeighbors = hex => {
  const axial = offsetToAxial(
    hex.q,
    hex.r
  )

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

const cubeRound = cube => {
  let q = Math.round(cube.q)
  let r = Math.round(cube.r)
  let s = Math.round(cube.s)

  const qDiff = Math.abs(q - cube.q)
  const rDiff = Math.abs(r - cube.r)
  const sDiff = Math.abs(s - cube.s)

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s
  } else if (rDiff > sDiff) {
    r = -q - s
  } else {
    s = -q - r
  }

  return { q, r, s }
}

const getHexDistanceRaw = (from, to) => {
  const start = offsetToAxial(from.q, from.r)
  const end = offsetToAxial(to.q, to.r)

  const startCube = {
    q: start.q,
    r: start.r,
    s: -start.q - start.r
  }

  const endCube = {
    q: end.q,
    r: end.r,
    s: -end.q - end.r
  }

  return Math.max(
    Math.abs(startCube.q - endCube.q),
    Math.abs(startCube.r - endCube.r),
    Math.abs(startCube.s - endCube.s)
  )
}

const getHexLine = (from, to) => {
  const start = offsetToAxial(from.q, from.r)
  const end = offsetToAxial(to.q, to.r)

  const startCube = {
    q: start.q,
    r: start.r,
    s: -start.q - start.r
  }

  const endCube = {
    q: end.q,
    r: end.r,
    s: -end.q - end.r
  }

  const distance = Math.max(
    Math.abs(startCube.q - endCube.q),
    Math.abs(startCube.r - endCube.r),
    Math.abs(startCube.s - endCube.s)
  )

  if (distance === 0) {
    return [{ q: from.q, r: from.r }]
  }

  const result = []
  const seen = new Set()

  for (let index = 0; index <= distance; index += 1) {
    const t = index / distance
    const cube = cubeRound({
      q: startCube.q + (endCube.q - startCube.q) * t,
      r: startCube.r + (endCube.r - startCube.r) * t,
      s: startCube.s + (endCube.s - startCube.s) * t
    })

    const position = axialToOffset(cube.q, cube.r)
    const key = `${position.q}:${position.r}`

    if (!seen.has(key)) {
      seen.add(key)
      result.push(position)
    }
  }

  return result
}

export const useBattlefieldStore = defineStore('battlefield', () => {
  const id = ref(battlefieldDefaults.id)
  const width = ref(battlefieldDefaults.width)
  const height = ref(battlefieldDefaults.height)
  const cellSizeFeet = ref(battlefieldDefaults.cellSizeFeet)
  const selectedHex = ref(null)
  const hoveredHex = ref(null)
  const tokens = ref([])
  const objects = ref([])
  const editorMode = ref('select')
  const objectTool = ref('place')
  const tokenTool = ref('place')
  const selectedTerrainId = ref(defaultTerrainId)
  const selectedObjectTypeId = ref(defaultObjectTypeId)
  const selectedTokenTypeId = ref(defaultTokenTypeId)
  const selectedObjectId = ref(null)
  const selectedTokenId = ref(null)
  const cells = ref({})
  const showCoordinates = ref(false)

  const participants = computed(() => tokens.value)

  const selectedParticipant = computed(() => {
    if (!selectedHex.value) {
      return null
    }

    return tokens.value.find(token => {
      return getTokenCells(token).some(position => {
        return (
          position.q === selectedHex.value.q &&
          position.r === selectedHex.value.r
        )
      })
    }) ?? null
  })

  const selectedToken = computed(() => {
    if (!selectedTokenId.value) {
      return null
    }

    return tokens.value.find(token => {
      return token.id === selectedTokenId.value
    }) ?? null
  })

  const selectedObject = computed(() => {
    if (!selectedObjectId.value) {
      return null
    }

    return objects.value.find(object => {
      return object.id === selectedObjectId.value
    }) ?? null
  })

  const isInside = (q, r) => {
    return (
      Number.isInteger(q) &&
      Number.isInteger(r) &&
      q >= 0 &&
      r >= 0 &&
      q < width.value &&
      r < height.value
    )
  }

  const getCell = (q, r) => {
    if (
      q < 0 ||
      r < 0 ||
      q >= width.value ||
      r >= height.value
    ) {
      return null
    }

    const key = getCellKey(q, r)
    const stored = cells.value[key]
    const terrainId = stored?.terrainId ?? defaultTerrainId
    const terrain = terrainById[terrainId] ?? terrainById[defaultTerrainId]

    return {
      q,
      r,
      terrainId,
      ...terrain,
      ...(stored ?? {})
    }
  }

  const terrainCells = computed(() => {
    return Object.entries(cells.value).map(([key, cell]) => {
      const [q, r] = key.split(':').map(Number)
      return {
        q,
        r,
        ...cell
      }
    })
  })

  const objectCells = computed(() => {
    return objects.value.flatMap(object => {
      return getObjectCells(object).map(position => ({
        objectId: object.id,
        ...position
      }))
    })
  })

  const tokenCells = computed(() => {
    return tokens.value.flatMap(token => {
      return getTokenCells(token).map(position => ({
        tokenId: token.id,
        ...position
      }))
    })
  })

  const setSelectedHex = hex => {
    selectedHex.value = hex
  }

  const setHoveredHex = hex => {
    hoveredHex.value = hex
  }

  const setParticipants = items => {
    tokens.value = items.map(item => {
      const tokenType =
        battlefieldTokenTypeById[item.tokenType ?? item.type] ??
        battlefieldTokenTypeById[defaultTokenTypeId]

      const maxHp = Number(
        item.maxHp ??
        item.maxHP ??
        tokenType.defaultHp
      )

      const hp = Number(
        item.hp ??
        item.currentHP ??
        maxHp
      )

      return {
        ...item,
        id:
          item.id ??
          `token-${Date.now()}-${tokenSequence += 1}`,
        type:
          item.tokenType ??
          item.type ??
          defaultTokenTypeId,
        tokenType: tokenType.id,
        name:
          item.name ??
          tokenType.name,
        faction:
          item.faction ??
          tokenType.faction,
        icon:
          item.icon ??
          tokenType.icon,
        color:
          item.color ??
          tokenType.color,
        rimColor:
          item.rimColor ??
          tokenType.rimColor,
        footprint:
          item.footprint?.map(
            offset => ({ ...offset })
          ) ??
          tokenType.footprint.map(
            offset => ({ ...offset })
          ),
        position: {
          q: item.position?.q ?? 0,
          r: item.position?.r ?? 0
        },
        hp,
        maxHp,
        ac: Number(
          item.ac ??
          item.armorClass ??
          tokenType.defaultAc
        ),
        speed: Number(
          item.speed ??
          tokenType.defaultSpeed
        ),
        movementMode: normalizeMovementMode(
          item.movementMode ??
          defaultMovementMode
        ),
        lastMovementCostFeet: Number(
          item.lastMovementCostFeet ?? 0
        ),
        lastMovementPath: [
          ...(item.lastMovementPath ?? [])
        ]
      }
    })
  }

  const setTokenTool = tool => {
    if (!['place', 'move'].includes(tool)) {
      return false
    }

    tokenTool.value = tool
    return true
  }

  const setSelectedTokenType = tokenTypeId => {
    if (!battlefieldTokenTypeById[tokenTypeId]) {
      return false
    }

    selectedTokenTypeId.value = tokenTypeId
    return true
  }

  const setSelectedToken = tokenId => {
    if (
      tokenId !== null &&
      !tokens.value.some(token => token.id === tokenId)
    ) {
      return false
    }

    selectedTokenId.value = tokenId
    return true
  }

  const updateSelectedToken = (field, value) => {
    const token = selectedToken.value

    if (!token) {
      return false
    }

    const syncMovementToCombat = () => {
      if (!token.combatParticipantId) {
        return
      }

      const combatStore = useCombatStore()

      const participant =
        combatStore.participants.find(
          item =>
            item.id === token.combatParticipantId
        )

      if (!participant) {
        return
      }

      participant.speed = Number(
        token.speed ??
        participant.speed ??
        30
      )

      participant.movementMode =
        normalizeMovementMode(
          token.movementMode ??
          participant.movementMode ??
          defaultMovementMode
        )
    }

    if (field === 'name') {
      token.name = String(value).slice(0, 48)
      return true
    }

    if (field === 'movementMode') {
      if (!movementModeById[value]) {
        return false
      }

      token.movementMode =
        normalizeMovementMode(value)

      syncMovementToCombat()

      return true
    }

    if (
      [
        'hp',
        'maxHp',
        'ac',
        'speed'
      ].includes(field)
    ) {
      const number = Number(value)

      if (!Number.isFinite(number)) {
        return false
      }

      if (field === 'maxHp') {
        token.maxHp = Math.max(
          0,
          number
        )

        token.hp = Math.min(
          token.hp,
          token.maxHp
        )

        return true
      }

      if (field === 'hp') {
        token.hp = Math.max(
          0,
          Math.min(
            number,
            token.maxHp
          )
        )

        return true
      }

      token[field] = Math.max(
        0,
        number
      )

      if (field === 'speed') {
        syncMovementToCombat()
      }

      return true
    }

    return false
  }

  const setParticipantPosition = (
    participantId,
    position
  ) => {
    const token = tokens.value.find(
      item =>
        item.id === participantId ||
        item.combatParticipantId === participantId
    )

    if (!token) {
      return false
    }

    token.position = {
      q: position.q,
      r: position.r
    }

    return true
  }

  const setEditorMode = mode => {
    editorMode.value = mode

    if (mode !== 'objects') {
      selectedObjectId.value = null
    }

    if (mode !== 'tokens') {
      selectedTokenId.value = null
    }
  }

  const setObjectTool = tool => {
    if (!['place', 'move'].includes(tool)) {
      return false
    }

    objectTool.value = tool
    return true
  }

  const setSelectedTerrain = terrainId => {
    if (!terrainById[terrainId]) {
      return false
    }

    selectedTerrainId.value = terrainId
    return true
  }

  const setSelectedObjectType = objectTypeId => {
    if (!battlefieldObjectById[objectTypeId]) {
      return false
    }

    selectedObjectTypeId.value = objectTypeId
    return true
  }

  const setSelectedObject = objectId => {
    if (
      objectId !== null &&
      !objects.value.some(
        object => object.id === objectId
      )
    ) {
      return false
    }

    selectedObjectId.value = objectId
    return true
  }

  const paintTerrain = (
    q,
    r,
    terrainId = selectedTerrainId.value
  ) => {
    if (
      q < 0 ||
      r < 0 ||
      q >= width.value ||
      r >= height.value
    ) {
      return false
    }

    if (!terrainById[terrainId]) {
      return false
    }

    const key = getCellKey(q, r)

    cells.value[key] = {
      terrainId
    }

    return true
  }

  const eraseTerrain = (q, r) => {
    if (
      q < 0 ||
      r < 0 ||
      q >= width.value ||
      r >= height.value
    ) {
      return false
    }

    delete cells.value[
      getCellKey(q, r)
    ]

    return true
  }

  const clearTerrain = () => {
    cells.value = {}
  }

  const clearTokens = () => {
    tokens.value = []
    selectedTokenId.value = null
  }

  const clearObjects = () => {
    objects.value = []
    selectedObjectId.value = null
  }

  const clearBattlefield = () => {
    cells.value = {}
    objects.value = []
    tokens.value = []
    selectedObjectId.value = null
    selectedTokenId.value = null
    selectedHex.value = null
    hoveredHex.value = null
  }

  const getTerrain = terrainId => {
    return (
      terrainById[terrainId] ??
      terrainById[defaultTerrainId]
    )
  }

  const getObjectType = objectTypeId => {
    return (
      battlefieldObjectById[objectTypeId] ??
      battlefieldObjectById[defaultObjectTypeId]
    )
  }

  const getHexDistance = (from, to) => {
    if (!from || !to) {
      return 0
    }

    return getHexDistanceRaw(from, to)
  }

  const getCellBlockerInfo = (q, r) => {
    const cell = getCell(q, r)

    if (!cell) {
      return {
        blocksLineOfSight: true,
        cover: 'total',
        source: 'outside-map'
      }
    }

    const terrainBlocks =
      Boolean(cell.blocksLineOfSight)

    let cover = cell.cover ?? null
    let source =
      terrainBlocks
        ? 'terrain'
        : null

    for (const object of getObjectsAt(q, r)) {
      if (object.blocksLineOfSight) {
        source = object.id
      }

      if (object.cover) {
        const rank = value => {
          if (value === 'total') return 3
          if (value === 'three-quarters') return 2
          if (value === 'half') return 1
          return 0
        }

        if (
          rank(object.cover) >
          rank(cover)
        ) {
          cover = object.cover
        }
      }
    }

    return {
      blocksLineOfSight:
        terrainBlocks ||
        getObjectsAt(q, r).some(
          object =>
            object.blocksLineOfSight
        ),
      cover,
      source
    }
  }

  const getLineOfSight = (from, to) => {
    if (!from || !to) {
      return {
        visible: false,
        distanceHexes: 0,
        distanceFeet: 0,
        path: [],
        blockers: [],
        cover: null
      }
    }

    const path =
      getHexLine(from, to)

    const blockers = []
    let cover = null

    const coverRank = value => {
      if (value === 'total') return 3
      if (value === 'three-quarters') return 2
      if (value === 'half') return 1
      return 0
    }

    for (
      let index = 1;
      index < path.length - 1;
      index += 1
    ) {
      const cell = path[index]

      const info =
        getCellBlockerInfo(
          cell.q,
          cell.r
        )

      if (info.blocksLineOfSight) {
        blockers.push({
          ...cell,
          source: info.source
        })
      }

      if (
        coverRank(info.cover) >
        coverRank(cover)
      ) {
        cover = info.cover
      }
    }

    return {
      visible:
        blockers.length === 0,
      distanceHexes:
        getHexDistanceRaw(
          from,
          to
        ),
      distanceFeet:
        getHexDistanceRaw(
          from,
          to
        ) * cellSizeFeet.value,
      path,
      blockers,
      cover
    }
  }

  const getTokenTacticalInfo = (
    tokenId,
    target
  ) => {
    const token =
      tokens.value.find(
        item => item.id === tokenId
      )

    if (!token || !target) {
      return null
    }

    const line =
      getLineOfSight(
        token.position,
        target
      )

    return {
      ...line,
      from: {
        ...token.position
      },
      to: {
        q: target.q,
        r: target.r
      }
    }
  }

  const getObjectsAt = (q, r) => {
    return objects.value.filter(
      object => {
        return getObjectCells(
          object
        ).some(position => {
          return (
            position.q === q &&
            position.r === r
          )
        })
      }
    )
  }

  const getObjectAt = (q, r) => {
    return (
      getObjectsAt(q, r)[0] ??
      null
    )
  }

  const getTokensAt = (q, r) => {
    return tokens.value.filter(
      token => {
        return getTokenCells(
          token
        ).some(position => {
          return (
            position.q === q &&
            position.r === r
          )
        })
      }
    )
  }

  const getTokenAt = (q, r) => {
    return (
      getTokensAt(q, r)[0] ??
      null
    )
  }

  const isFootprintFree = (
    objectType,
    position,
    objectId = null
  ) => {
    const footprint =
      objectType.footprint ??
      [{ q: 0, r: 0 }]

    for (const offset of footprint) {
      const q =
        position.q + offset.q
      const r =
        position.r + offset.r

      if (!isInside(q, r)) {
        return false
      }

      const cell =
        getCell(q, r)

      if (cell?.blocked) {
        return false
      }

      const blockingObject =
        objects.value.find(
          object => {
            if (
              object.id === objectId
            ) {
              return false
            }

            return getObjectCells(
              object
            ).some(cell => {
              return (
                cell.q === q &&
                cell.r === r
              )
            })
          }
        )

      if (blockingObject) {
        return false
      }
    }

    return true
  }

  const isTokenFootprintFree = (
    tokenType,
    position,
    tokenId = null
  ) => {
    const footprint =
      tokenType.footprint ??
      [{ q: 0, r: 0 }]

    for (const offset of footprint) {
      const q =
        position.q + offset.q
      const r =
        position.r + offset.r

      if (!isInside(q, r)) {
        return false
      }

      const cell =
        getCell(q, r)

      if (cell?.blocked) {
        return false
      }

      const blockingObject =
        objects.value.find(
          object => {
            if (
              !object.blocksMovement ||
              object.id === tokenId
            ) {
              return false
            }

            return getObjectCells(
              object
            ).some(cell => {
              return (
                cell.q === q &&
                cell.r === r
              )
            })
          }
        )

      if (blockingObject) {
        return false
      }

      const blockingToken =
        tokens.value.find(
          token => {
            if (
              token.id === tokenId
            ) {
              return false
            }

            return getTokenCells(
              token
            ).some(cell => {
              return (
                cell.q === q &&
                cell.r === r
              )
            })
          }
        )

      if (blockingToken) {
        return false
      }
    }

    return true
  }

  const findFirstFreeTokenPosition = (
    tokenType,
    startQ = 0,
    startR = 0
  ) => {
    for (
      let r = startR;
      r < height.value;
      r += 1
    ) {
      for (
        let q =
          r === startR
            ? startQ
            : 0;
        q < width.value;
        q += 1
      ) {
        if (
          isTokenFootprintFree(
            tokenType,
            { q, r }
          )
        ) {
          return { q, r }
        }
      }
    }

    return null
  }

  const normalizeCombatToken = (
    participant,
    position
  ) => {
    const participantType =
      participant.type === 'player'
        ? 'player'
        : participant.type === 'enemy' ||
            participant.type === 'monster'
          ? 'enemy'
          : 'npc'

    const tokenType =
      battlefieldTokenTypeById[
        participantType
      ]

    const maxHp = Number(
      participant.maxHP ??
      participant.maxHp ??
      tokenType.defaultHp
    )

    const hp = Number(
      participant.currentHP ??
      participant.hp ??
      maxHp
    )

    return {
      id:
        `token-combat-${participant.id}`,
      tokenType: tokenType.id,
      type: tokenType.id,
      name:
        participant.name ??
        tokenType.name,
      faction: tokenType.faction,
      icon: tokenType.icon,
      color: tokenType.color,
      rimColor: tokenType.rimColor,
      footprint:
        tokenType.footprint.map(
          offset => ({ ...offset })
        ),
      position,
      hp,
      maxHp,
      ac: Number(
        participant.armorClass ??
        participant.ac ??
        tokenType.defaultAc
      ),
      speed: Number(
        participant.speed ??
        tokenType.defaultSpeed
      ),
      movementMode:
        normalizeMovementMode(
          participant.movementMode ??
          tokenType.movementMode ??
          defaultMovementMode
        ),
      lastMovementCostFeet: 0,
      lastMovementPath: [],
      level: Number(
        participant.level ?? 1
      ),
      combatParticipantId:
        participant.id,
      characterId:
        participant.characterId ??
        null,
      classId:
        participant.classId ??
        null,
      raceId:
        participant.raceId ??
        null,
      state:
        participant.currentHP <= 0
          ? 'defeated'
          : 'active'
    }
  }

  const placeToken = (
    q,
    r,
    tokenTypeId =
      selectedTokenTypeId.value,
    payload = {}
  ) => {
    if (!isInside(q, r)) {
      return false
    }

    const tokenType =
      battlefieldTokenTypeById[
        tokenTypeId
      ]

    if (!tokenType) {
      return false
    }

    if (
      !isTokenFootprintFree(
        tokenType,
        { q, r }
      )
    ) {
      return false
    }

    const maxHp = Number(
      payload.maxHp ??
      tokenType.defaultHp
    )

    const hp = Math.max(
      0,
      Math.min(
        Number(
          payload.hp ?? maxHp
        ),
        maxHp
      )
    )

    const token = {
      id:
        payload.id ??
        `token-${Date.now()}-${tokenSequence += 1}`,
      tokenType: tokenType.id,
      type: tokenType.id,
      name:
        payload.name ??
        `${tokenType.name} ${tokens.value.filter(
          item =>
            item.tokenType ===
            tokenType.id
        ).length + 1}`,
      faction:
        payload.faction ??
        tokenType.faction,
      icon:
        payload.icon ??
        tokenType.icon,
      color:
        payload.color ??
        tokenType.color,
      rimColor:
        payload.rimColor ??
        tokenType.rimColor,
      footprint:
        payload.footprint?.map(
          offset => ({ ...offset })
        ) ??
        tokenType.footprint.map(
          offset => ({ ...offset })
        ),
      position: { q, r },
      hp,
      maxHp,
      ac: Number(
        payload.ac ??
        tokenType.defaultAc
      ),
      speed: Number(
        payload.speed ??
        tokenType.defaultSpeed
      ),
      movementMode:
        normalizeMovementMode(
          payload.movementMode ??
          tokenType.movementMode ??
          defaultMovementMode
        ),
      lastMovementCostFeet: 0,
      lastMovementPath: [],
      level: Number(
        payload.level ?? 1
      ),
      combatParticipantId:
        payload.combatParticipantId ??
        null,
      characterId:
        payload.characterId ??
        null,
      classId:
        payload.classId ??
        null,
      raceId:
        payload.raceId ??
        null,
      state:
        payload.state ??
        'active'
    }

    tokens.value.push(token)
    selectedTokenId.value = token.id
    selectedHex.value = { q, r }

    return token
  }

  const syncLinkedCombatState = () => {
    const combatStore =
      useCombatStore()

    let updated = 0

    for (const token of tokens.value) {
      if (!token.combatParticipantId) {
        continue
      }

      const participant =
        combatStore.participants.find(
          item =>
            item.id ===
            token.combatParticipantId
        )

      if (!participant) {
        continue
      }

      const maxHp = Number(
        participant.maxHP ??
        participant.maxHp ??
        token.maxHp
      )

      const hp = Number(
        participant.currentHP ??
        participant.hp ??
        token.hp
      )

      token.hp = Math.max(
        0,
        Math.min(
          hp,
          maxHp
        )
      )

      token.maxHp =
        Math.max(
          0,
          maxHp
        )

      token.ac = Number(
        participant.armorClass ??
        participant.ac ??
        token.ac
      )

      token.speed = Number(
        participant.speed ??
        token.speed
      )

      token.movementMode =
        normalizeMovementMode(
          participant.movementMode ??
          token.movementMode ??
          defaultMovementMode
        )

      token.level = Number(
        participant.level ??
        token.level ??
        1
      )

      token.state =
        token.hp <= 0
          ? 'defeated'
          : 'active'

      updated += 1
    }

    return updated
  }

  const addSavedCharacterToCombat = characterId => {
    const charactersStore =
      useCharactersStore()

    const character =
      charactersStore.getCharacterById(
        characterId
      )

    if (!character) {
      return null
    }

    const combatStore =
      useCombatStore()

    const participant =
      combatStore.addCharacter(
        character
      )

    if (!participant) {
      return null
    }

    let token =
      tokens.value.find(
        item =>
          item.characterId ===
          character.id
      )

    if (!token) {
      const tokenType =
        battlefieldTokenTypeById.player

      const position =
        findFirstFreeTokenPosition(
          tokenType
        )

      if (!position) {
        return participant
      }

      token =
        normalizeCombatToken(
          participant,
          position
        )

      tokens.value.push(token)
    } else {
      token.combatParticipantId =
        participant.id

      token.characterId =
        character.id

      Object.assign(
        token,
        normalizeCombatToken(
          participant,
          token.position
        )
      )
    }

    return participant
  }

  const syncCombatParticipants = () => {
    const combatStore =
      useCombatStore()

    let added = 0
    let updated = 0
    let failed = 0

    const charactersStore =
      useCharactersStore()

    for (const token of tokens.value) {
      if (
        token.combatParticipantId ||
        !token.characterId
      ) {
        continue
      }

      const character =
        charactersStore.getCharacterById(
          token.characterId
        )

      if (!character) {
        continue
      }

      combatStore.addCharacter(
        character
      )
    }

    for (const token of tokens.value) {
      if (token.combatParticipantId) {
        continue
      }

      const linked =
        combatStore.participants.find(
          participant => {
            if (
              token.characterId &&
              participant.characterId
            ) {
              return (
                token.characterId ===
                participant.characterId
              )
            }

            return (
              token.id ===
              participant.id
            )
          }
        )

      if (linked) {
        token.combatParticipantId =
          linked.id
      }
    }

    for (
      const participant of
      combatStore.participants
    ) {
      const existing =
        tokens.value.find(
          token =>
            token.combatParticipantId ===
            participant.id
        )

      if (existing) {
        const normalized =
          normalizeCombatToken(
            participant,
            existing.position
          )

        Object.assign(
          existing,
          normalized
        )

        updated += 1
        continue
      }

      const participantType =
        participant.type === 'player'
          ? 'player'
          : participant.type === 'enemy' ||
              participant.type === 'monster'
            ? 'enemy'
            : 'npc'

      const tokenType =
        battlefieldTokenTypeById[
          participantType
        ]

      const position =
        findFirstFreeTokenPosition(
          tokenType
        )

      if (!position) {
        failed += 1
        continue
      }

      const token =
        normalizeCombatToken(
          participant,
          position
        )

      if (
        tokens.value.some(
          item =>
            item.id === token.id
        )
      ) {
        failed += 1
        continue
      }

      tokens.value.push(token)
      added += 1
    }

    for (const token of tokens.value) {
      if (
        token.combatParticipantId ||
        token.type !== 'player'
      ) {
        continue
      }

      const participant =
        combatStore.addParticipant({
          id:
            `token-player-${token.id}`,
          name:
            token.name ?? 'Игрок',
          type: 'player',
          faction:
            token.faction ??
            'friendly',
          maxHP:
            token.maxHp ?? 10,
          currentHP:
            token.hp ??
            token.maxHp ??
            10,
          armorClass:
            token.ac ?? 10,
          speed:
            token.speed ?? 30,
          initiativeModifier: 2,
          attackBonus: 5,
          damageDice: '1d8',
          damageBonus: 3
        })

      if (participant) {
        token.combatParticipantId =
          participant.id

        updated += 1
      }
    }

    return {
      added,
      updated,
      failed,
      total:
        combatStore.participants.length
    }
  }

  const getTokenMovementStatus = tokenId => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (!token) {
      return null
    }

    const combatStore =
      useCombatStore()

    const participant =
      token.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              token.combatParticipantId
          )
        : null

    const combatMovement =
      Boolean(
        participant &&
        combatStore.combatStarted
      )

    if (!combatMovement) {
      return {
        enforced: false,
        speed: Math.max(
          0,
          Number(
            token.speed ?? 0
          )
        ),
        remainingFeet: null,
        usedFeet: 0,
        dashUsed: false,
        currentTurn: false,
        movementMode:
          normalizeMovementMode(
            token.movementMode ??
            defaultMovementMode
          )
      }
    }

    const speed = Math.max(
      0,
      Number(
        participant.speed ??
        token.speed ??
        30
      )
    )

    const allowance =
      combatStore.getMovementAllowance(
        token.combatParticipantId
      )

    const usedFeet =
      combatStore.getMovementUsed(
        token.combatParticipantId
      )

    const remainingFeet =
      combatStore.getRemainingMovement(
        token.combatParticipantId
      )

    return {
      enforced: true,
      speed,
      allowanceFeet:
        allowance,
      remainingFeet,
      usedFeet,
      dashUsed:
        Boolean(
          participant.dashUsed
        ),
      currentTurn:
        combatStore.currentTurn ===
        token.combatParticipantId,
      movementMode:
        normalizeMovementMode(
          token.movementMode ??
          defaultMovementMode
        )
    }
  }

  const getTokenPositionMovementCost = (
    token,
    position
  ) => {
    const movementMode =
      normalizeMovementMode(
        token.movementMode ??
        defaultMovementMode
      )

    let maximumCost = 1

    for (
      const offset of
      token.footprint
    ) {
      const q =
        position.q + offset.q
      const r =
        position.r + offset.r

      const cell =
        getCell(q, r)

      if (!cell) {
        return null
      }

      if (cell.blocked) {
        return null
      }

      const multiplier =
        getTerrainMovementMultiplier(
          cell,
          movementMode
        )

      if (multiplier === null) {
        return null
      }

      maximumCost =
        Math.max(
          maximumCost,
          multiplier
        )
    }

    if (
      !isTokenFootprintFree(
        battlefieldTokenTypeById[
          token.tokenType
        ] ??
          battlefieldTokenTypeById[
            defaultTokenTypeId
          ],
        position,
        token.id
      )
    ) {
      return null
    }

    return (
      maximumCost *
      cellSizeFeet.value
    )
  }

  const getTokenMoveInfo = (
    tokenId,
    target
  ) => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (!token) {
      return {
        allowed: false,
        reason: 'token-not-found',
        costFeet: null,
        path: []
      }
    }

    if (
      !isInside(
        target.q,
        target.r
      )
    ) {
      return {
        allowed: false,
        reason: 'outside-map',
        costFeet: null,
        path: []
      }
    }

    const start = {
      q: token.position.q,
      r: token.position.r
    }

    if (
      start.q === target.q &&
      start.r === target.r
    ) {
      return {
        allowed: true,
        reason: null,
        costFeet: 0,
        path: [start]
      }
    }

    const status =
      getTokenMovementStatus(
        tokenId
      )

    if (
      status?.enforced &&
      !status.currentTurn
    ) {
      return {
        allowed: false,
        reason: 'not-current-turn',
        costFeet: null,
        path: []
      }
    }

    const budget =
      status?.enforced
        ? status.remainingFeet
        : Infinity

    const costs = new Map()
    const previous = new Map()

    const queue = [
      {
        q: start.q,
        r: start.r,
        cost: 0
      }
    ]

    const makeKey = (q, r) =>
      `${q}:${r}`

    costs.set(
      makeKey(
        start.q,
        start.r
      ),
      0
    )

    while (queue.length) {
      queue.sort(
        (a, b) =>
          a.cost - b.cost
      )

      const current =
        queue.shift()

      if (!current) {
        break
      }

      const currentKey =
        makeKey(
          current.q,
          current.r
        )

      if (
        current.cost !==
        costs.get(
          currentKey
        )
      ) {
        continue
      }

      if (
        current.q === target.q &&
        current.r === target.r
      ) {
        break
      }

      for (
        const neighbor of
        getHexNeighbors(
          current
        )
      ) {
        if (
          !isInside(
            neighbor.q,
            neighbor.r
          )
        ) {
          continue
        }

        const neighborCost =
          getTokenPositionMovementCost(
            token,
            neighbor
          )

        if (
          neighborCost === null
        ) {
          continue
        }

        const nextCost =
          current.cost +
          neighborCost

        if (
          nextCost > budget
        ) {
          continue
        }

        const neighborKey =
          makeKey(
            neighbor.q,
            neighbor.r
          )

        const knownCost =
          costs.get(
            neighborKey
          )

        if (
          knownCost !== undefined &&
          knownCost <= nextCost
        ) {
          continue
        }

        costs.set(
          neighborKey,
          nextCost
        )

        previous.set(
          neighborKey,
          currentKey
        )

        queue.push({
          q: neighbor.q,
          r: neighbor.r,
          cost: nextCost
        })
      }
    }

    const targetKey =
      makeKey(
        target.q,
        target.r
      )

    if (!costs.has(targetKey)) {
      return {
        allowed: false,
        reason:
          status?.enforced
            ? 'movement-unavailable'
            : 'path-blocked',
        costFeet: null,
        path: []
      }
    }

    const path = []
    let currentKey =
      targetKey

    while (currentKey) {
      const [q, r] =
        currentKey
          .split(':')
          .map(Number)

      path.unshift({
        q,
        r
      })

      if (
        currentKey ===
        makeKey(
          start.q,
          start.r
        )
      ) {
        break
      }

      currentKey =
        previous.get(
          currentKey
        )
    }

    return {
      allowed: true,
      reason: null,
      costFeet:
        costs.get(
          targetKey
        ),
      path
    }
  }

  const getReachableTokenCells = tokenId => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (!token) {
      return []
    }

    const status =
      getTokenMovementStatus(
        tokenId
      )

    if (
      !status?.enforced ||
      !status.currentTurn
    ) {
      return []
    }

    const budget =
      status.remainingFeet

    const start = {
      q: token.position.q,
      r: token.position.r
    }

    const costs = new Map()

    const queue = [
      {
        q: start.q,
        r: start.r,
        cost: 0
      }
    ]

    const makeKey = (q, r) =>
      `${q}:${r}`

    costs.set(
      makeKey(
        start.q,
        start.r
      ),
      0
    )

    while (queue.length) {
      queue.sort(
        (a, b) =>
          a.cost - b.cost
      )

      const current =
        queue.shift()

      if (!current) {
        break
      }

      const currentKey =
        makeKey(
          current.q,
          current.r
        )

      if (
        current.cost !==
        costs.get(
          currentKey
        )
      ) {
        continue
      }

      for (
        const neighbor of
        getHexNeighbors(
          current
        )
      ) {
        if (
          !isInside(
            neighbor.q,
            neighbor.r
          )
        ) {
          continue
        }

        const stepCost =
          getTokenPositionMovementCost(
            token,
            neighbor
          )

        if (
          stepCost === null
        ) {
          continue
        }

        const nextCost =
          current.cost +
          stepCost

        if (
          nextCost > budget
        ) {
          continue
        }

        const neighborKey =
          makeKey(
            neighbor.q,
            neighbor.r
          )

        const knownCost =
          costs.get(
            neighborKey
          )

        if (
          knownCost !== undefined &&
          knownCost <= nextCost
        ) {
          continue
        }

        costs.set(
          neighborKey,
          nextCost
        )

        queue.push({
          q: neighbor.q,
          r: neighbor.r,
          cost: nextCost
        })
      }
    }

    return [
      ...costs.entries()
    ].map(
      ([key, costFeet]) => {
        const [q, r] =
          key
            .split(':')
            .map(Number)

        const cell =
          getCell(q, r)

        return {
          q,
          r,
          costFeet,
          terrainId:
            cell?.terrainId ??
            defaultTerrainId,
          difficult:
            Boolean(
              cell?.difficult
            ),
          remainingFeet:
            Math.max(
              0,
              budget -
                costFeet
            )
        }
      }
    )
  }

  const getTokenOccupiedCells = (
    token,
    position
  ) => {
    const footprint =
      token.footprint?.length
        ? token.footprint
        : [{ q: 0, r: 0 }]

    return footprint.map(
      offset => ({
        q:
          position.q +
          offset.q,
        r:
          position.r +
          offset.r
      })
    )
  }

  const isTokenWithinReach = (
    sourceToken,
    targetToken,
    targetPosition
  ) => {
    const reach = Math.max(
      5,
      Number(
        sourceToken.reach ??
        5
      )
    )

    const sourceCells =
      getTokenOccupiedCells(
        sourceToken,
        sourceToken.position
      )

    const targetCells =
      getTokenOccupiedCells(
        targetToken,
        targetPosition
      )

    return sourceCells.some(
      sourceCell =>
        targetCells.some(
          targetCell => {
            return (
              getHexDistanceRaw(
                sourceCell,
                targetCell
              ) *
                cellSizeFeet.value <=
              reach
            )
          }
        )
    )
  }

  const getOpportunityAttackers = (
    tokenId,
    path
  ) => {
    const movingToken =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (
      !movingToken ||
      !Array.isArray(path) ||
      path.length < 2
    ) {
      return []
    }

    if (
      !movingToken.combatParticipantId
    ) {
      return []
    }

    const combatStore =
      useCombatStore()

    const movingParticipant =
      combatStore.participants.find(
        item =>
          item.id ===
          movingToken.combatParticipantId
      )

    if (
      !movingParticipant ||
      movingParticipant.currentHP <= 0
    ) {
      return []
    }

    if (
      movingParticipant.disengageActive
    ) {
      return []
    }

    const attackers = []

    for (
      const enemyToken of
      tokens.value
    ) {
      if (
        enemyToken.id ===
        movingToken.id
      ) {
        continue
      }

      if (
        !enemyToken.combatParticipantId
      ) {
        continue
      }

      if (
        (
          enemyToken.faction ??
          'friendly'
        ) ===
        (
          movingToken.faction ??
          'friendly'
        )
      ) {
        continue
      }

      if (
        (
          enemyToken.faction ??
          'friendly'
        ) === 'neutral'
      ) {
        continue
      }

      const enemyParticipant =
        combatStore.participants.find(
          item =>
            item.id ===
            enemyToken.combatParticipantId
        )

      if (
        !enemyParticipant ||
        enemyParticipant.currentHP <= 0
      ) {
        continue
      }

      if (
        enemyParticipant.reactionUsed
      ) {
        continue
      }

      let wasInReach =
        isTokenWithinReach(
          enemyToken,
          movingToken,
          path[0]
        )

      let provoked = false

      for (
        let index = 1;
        index < path.length;
        index += 1
      ) {
        const currentPosition =
          path[index]

        const isInReach =
          isTokenWithinReach(
            enemyToken,
            movingToken,
            currentPosition
          )

        if (
          wasInReach &&
          !isInReach
        ) {
          provoked = true
          break
        }

        wasInReach =
          isInReach
      }

      if (provoked) {
        attackers.push({
          token: enemyToken,
          participant:
            enemyParticipant
        })
      }
    }

    return attackers
  }

  const canMoveToken = (
    tokenId,
    q,
    r
  ) => {
    return getTokenMoveInfo(
      tokenId,
      { q, r }
    ).allowed
  }

  const moveToken = (
    tokenId,
    q,
    r
  ) => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (!token) {
      return false
    }

    const moveInfo =
      getTokenMoveInfo(
        token.id,
        { q, r }
      )

    if (!moveInfo.allowed) {
      return false
    }

    const combatStore =
      useCombatStore()

    const participant =
      token.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              token.combatParticipantId
          )
        : null

    const combatMovement =
      Boolean(
        participant &&
        combatStore.combatStarted
      )

    if (
      combatMovement &&
      moveInfo.costFeet > 0 &&
      !combatStore.moveParticipant(
        token.combatParticipantId,
        moveInfo.costFeet
      )
    ) {
      return false
    }

    token.position = {
      q,
      r
    }

    token.lastMovementCostFeet =
      moveInfo.costFeet ?? 0

    token.lastMovementPath =
      moveInfo.path.map(
        position => ({
          q: position.q,
          r: position.r
        })
      )

    const opportunityAttackers =
      getOpportunityAttackers(
        token.id,
        token.lastMovementPath
      )

    for (
      const attacker of
      opportunityAttackers
    ) {
      combatStore.queueOpportunityAttack({
        attackerId:
          attacker.participant.id,
        targetId:
          token.combatParticipantId
      })
    }

    selectedHex.value = {
      q,
      r
    }

    selectedTokenId.value = token.id

    return true
  }

  const moveSelectedToken = (
    q,
    r
  ) => {
    const token =
      selectedToken.value

    if (!token) {
      return false
    }

    return moveToken(
      token.id,
      q,
      r
    )
  }

  const canDashToken = tokenId => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (
      !token?.combatParticipantId
    ) {
      return false
    }

    return useCombatStore().canDash(
      token.combatParticipantId
    )
  }

  const useDashToken = tokenId => {
    const token =
      tokens.value.find(
        item =>
          item.id === tokenId
      )

    if (
      !token?.combatParticipantId
    ) {
      return false
    }

    return useCombatStore().useDash(
      token.combatParticipantId
    )
  }

  const removeToken = tokenId => {
    const index =
      tokens.value.findIndex(
        token =>
          token.id === tokenId
      )

    if (index < 0) {
      return false
    }

    tokens.value.splice(
      index,
      1
    )

    if (
      selectedTokenId.value ===
      tokenId
    ) {
      selectedTokenId.value = null
    }

    return true
  }

  const removeTokenAt = (
    q,
    r
  ) => {
    const token =
      getTokenAt(q, r)

    if (!token) {
      return false
    }

    return removeToken(
      token.id
    )
  }

  const placeObject = (
    q,
    r,
    objectTypeId =
      selectedObjectTypeId.value
  ) => {
    if (!isInside(q, r)) {
      return false
    }

    const objectType =
      getObjectType(
        objectTypeId
      )

    if (
      !isFootprintFree(
        objectType,
        { q, r }
      )
    ) {
      return false
    }

    const object = {
      id:
        `object-${Date.now()}-${objectSequence += 1}`,
      type: objectType.id,
      name: objectType.name,
      icon: objectType.icon,
      texture: objectType.texture,
      color: objectType.color,
      size: objectType.size,
      footprint:
        objectType.footprint.map(
          offset => ({ ...offset })
        ),
      position: { q, r },
      blocksMovement:
        objectType.blocksMovement,
      blocksLineOfSight:
        objectType.blocksLineOfSight,
      cover: objectType.cover,
      height: objectType.height,
      destructible:
        objectType.destructible,
      hp: objectType.hp,
      maxHp: objectType.hp,
      state:
        objectType.state ?? null
    }

    objects.value.push(object)

    selectedObjectId.value =
      object.id

    selectedHex.value = {
      q,
      r
    }

    return object
  }

  const canMoveObject = (
    objectId,
    q,
    r
  ) => {
    const object =
      objects.value.find(
        item =>
          item.id === objectId
      )

    if (!object) {
      return false
    }

    const objectType =
      getObjectType(
        object.type
      )

    return isFootprintFree(
      objectType,
      { q, r },
      object.id
    )
  }

  const moveObject = (
    objectId,
    q,
    r
  ) => {
    const object =
      objects.value.find(
        item =>
          item.id === objectId
      )

    if (!object) {
      return false
    }

    if (
      !canMoveObject(
        object.id,
        q,
        r
      )
    ) {
      return false
    }

    object.position = {
      q,
      r
    }

    selectedObjectId.value = object.id
    selectedHex.value = {
      q,
      r
    }

    return true
  }

  const moveSelectedObject = (
    q,
    r
  ) => {
    const object =
      selectedObject.value

    if (!object) {
      return false
    }

    return moveObject(
      object.id,
      q,
      r
    )
  }

  const removeObject = objectId => {
    const index =
      objects.value.findIndex(
        object =>
          object.id === objectId
      )

    if (index < 0) {
      return false
    }

    objects.value.splice(
      index,
      1
    )

    if (
      selectedObjectId.value ===
      objectId
    ) {
      selectedObjectId.value = null
    }

    return true
  }

  const removeObjectAt = (
    q,
    r
  ) => {
    const object =
      getObjectAt(q, r)

    if (!object) {
      return false
    }

    return removeObject(
      object.id
    )
  }

  const toggleCoordinates = () => {
    showCoordinates.value =
      !showCoordinates.value
  }

  const getTokenCenterDistanceFeet = (
    fromToken,
    toToken
  ) => {
    if (
      !fromToken ||
      !toToken
    ) {
      return null
    }

    return (
      getHexDistanceRaw(
        fromToken.position,
        toToken.position
      ) *
      cellSizeFeet.value
    )
  }

  const getSpellTargetContext = (
    casterTokenId,
    targetTokenId
  ) => {
    const caster =
      tokens.value.find(
        token =>
          token.id ===
          casterTokenId
      )

    const target =
      tokens.value.find(
        token =>
          token.id ===
          targetTokenId
      )

    if (
      !caster ||
      !target
    ) {
      return null
    }

    const combatStore =
      useCombatStore()

    const casterParticipant =
      caster.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              caster.combatParticipantId
          )
        : null

    const targetParticipant =
      target.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              target.combatParticipantId
          )
        : null

    if (!casterParticipant) {
      return null
    }

    const distanceFeet =
      getTokenCenterDistanceFeet(
        caster,
        target
      )

    const lineOfSight =
      getLineOfSight(
        caster.position,
        target.position
      )

    const targetCellInfo =
      getCellBlockerInfo(
        target.position.q,
        target.position.r
      )

    const coverRank = value => {
      if (value === 'total') return 3
      if (
        value ===
        'three-quarters'
      ) {
        return 2
      }
      if (value === 'half') {
        return 1
      }
      return 0
    }

    const effectiveCover =
      coverRank(
        targetCellInfo.cover
      ) >
      coverRank(
        lineOfSight.cover
      )
        ? targetCellInfo.cover
        : lineOfSight.cover

    const casterFaction =
      caster.faction ??
      casterParticipant.faction ??
      'friendly'

    const hostileTokensNearCaster =
      tokens.value.some(
        token => {
          if (
            token.id === caster.id ||
            token.hp <= 0
          ) {
            return false
          }

          if (
            (
              token.faction ??
              'friendly'
            ) === 'neutral'
          ) {
            return false
          }

          if (
            (
              token.faction ??
              'friendly'
            ) ===
            casterFaction
          ) {
            return false
          }

          return (
            getHexDistanceRaw(
              token.position,
              caster.position
            ) <= 1
          )
        }
      )

    return {
      casterId:
        casterTokenId,
      targetId:
        targetTokenId,
      casterParticipantId:
        casterParticipant.id,
      targetParticipantId:
        targetParticipant?.id ??
        null,
      distanceFeet,
      lineOfSight:
        lineOfSight.visible,
      cover:
        effectiveCover,
      targetAC:
        targetParticipant
          ? combatStore.getEffectiveArmorClass(
              targetParticipant.id
            )
          : target.ac,
      withinFiveFeetOfHostile:
        hostileTokensNearCaster,
      path:
        lineOfSight.path,
      blockers:
        lineOfSight.blockers
    }
  }

  const getSpellAreaContext = ({
    casterTokenId,
    direction,
    sizeFeet
  }) => {
    const casterToken =
      tokens.value.find(
        token =>
          token.id ===
          casterTokenId
      )

    if (!casterToken) {
      return null
    }

    const cells =
      getAreaCells({
        origin:
          casterToken.position,
        direction,
        sizeFeet,
        cellSizeFeet:
          cellSizeFeet.value
      })

    const cellKeys =
      new Set(
        cells.map(
          cell =>
            `${cell.q}:${cell.r}`
        )
      )

    const affectedTokens =
      tokens.value.filter(
        token => {
          if (
            Number(
              token.hp ?? 0
            ) <= 0
          ) {
            return false
          }

          return token.footprint?.some(
            offset => {
              const q =
                token.position.q +
                offset.q

              const r =
                token.position.r +
                offset.r

              return cellKeys.has(
                `${q}:${r}`
              )
            }
          )
        }
      )

    return {
      casterTokenId,
      origin: {
        ...casterToken.position
      },
      direction,
      sizeFeet,
      cells,
      affectedTokens:
        affectedTokens.map(
          token => ({
            tokenId:
              token.id,
            combatParticipantId:
              token.combatParticipantId ??
              null,
            characterId:
              token.characterId ??
              null,
            faction:
              token.faction ??
              'neutral',
            position: {
              ...token.position
            }
          })
        )
    }
  }

  const getSpellAreaDirection = (
    casterTokenId,
    targetHex
  ) => {
    const casterToken =
      tokens.value.find(
        token =>
          token.id ===
          casterTokenId
      )

    if (
      !casterToken ||
      !targetHex
    ) {
      return null
    }

    return getAreaDirection(
      casterToken.position,
      targetHex
    )
  }

  const getSpellPushDestination = ({
    casterTokenId,
    targetTokenId,
    distanceFeet
  }) => {
    const casterToken =
      tokens.value.find(
        token =>
          token.id ===
          casterTokenId
      )

    const targetToken =
      tokens.value.find(
        token =>
          token.id ===
          targetTokenId
      )

    if (
      !casterToken ||
      !targetToken
    ) {
      return null
    }

    return getPushDestination({
      origin:
        casterToken.position,
      target:
        targetToken.position,
      distanceFeet,
      cellSizeFeet:
        cellSizeFeet.value
    })
  }

  const pushToken = (
  tokenId,
  casterTokenId,
  distanceFeet = 10
) => {
  const token = tokens.value.find(
    item => item.id === tokenId
  )

  const casterToken = tokens.value.find(
    item => item.id === casterTokenId
  )

  if (!token || !casterToken) {
    return {
      success: false,
      movedFeet: 0,
      position: token?.position ?? null
    }
  }

  const destination = getPushDestination({
    origin: casterToken.position,
    target: token.position,
    distanceFeet,
    cellSizeFeet: cellSizeFeet.value
  })

  if (!destination) {
    return {
      success: false,
      movedFeet: 0,
      position: {
        ...token.position
      }
    }
  }

  const tokenType =
    battlefieldTokenTypeById[
      token.tokenType
    ] ??
    battlefieldTokenTypeById[
      token.type
    ] ??
    battlefieldTokenTypeById[
      defaultTokenTypeId
    ]

  if (!tokenType) {
    return {
      success: false,
      movedFeet: 0,
      position: {
        ...token.position
      }
    }
  }

  let current = {
    q: token.position.q,
    r: token.position.r
  }

  const target = {
    q: destination.q,
    r: destination.r
  }

  const path = [
    {
      ...current
    }
  ]

  const maxSteps = Math.ceil(
    distanceFeet /
      cellSizeFeet.value
  )

  for (
    let step = 0;
    step < maxSteps;
    step += 1
  ) {
    if (
      current.q === target.q &&
      current.r === target.r
    ) {
      break
    }

    const nextCandidates =
      getHexNeighbors(current)

    const next = nextCandidates
      .filter(position =>
        isTokenFootprintFree(
          tokenType,
          position,
          token.id
        )
      )
      .sort(
        (a, b) =>
          getHexDistanceRaw(
            a,
            target
          ) -
          getHexDistanceRaw(
            b,
            target
          )
      )[0]

    if (!next) {
      break
    }

    current = {
      q: next.q,
      r: next.r
    }

    path.push({
      ...current
    })
  }

  const movedFeet =
    getHexDistanceRaw(
      token.position,
      current
    ) *
    cellSizeFeet.value

  if (movedFeet <= 0) {
    return {
      success: false,
      movedFeet: 0,
      position: {
        ...token.position
      }
    }
  }

  token.position = {
    ...current
  }

  token.lastMovementCostFeet =
    movedFeet

  token.lastMovementPath =
    path.map(position => ({
      q: position.q,
      r: position.r
    }))

  return {
    success: true,
    movedFeet,
    position: {
      ...current
    },
    path
  }
}

  const getCombatAttackContext = (
    attackerTokenId,
    targetTokenId
  ) => {
    const attacker =
      tokens.value.find(
        token =>
          token.id ===
          attackerTokenId
      )

    const target =
      tokens.value.find(
        token =>
          token.id ===
          targetTokenId
      )

    if (
      !attacker ||
      !target
    ) {
      return null
    }

    const combatStore =
      useCombatStore()

    const attackerParticipant =
      attacker.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              attacker.combatParticipantId
          )
        : null

    if (!attackerParticipant) {
      return null
    }

    const targetParticipant =
      target.combatParticipantId
        ? combatStore.participants.find(
            item =>
              item.id ===
              target.combatParticipantId
          )
        : null

    const distanceFeet =
      getTokenCenterDistanceFeet(
        attacker,
        target
      )

    const attackProfile =
      combatStore.getAttackProfile(
        attackerParticipant.id
      )

    const lineOfSight =
      getLineOfSight(
        attacker.position,
        target.position
      )

    const targetCellInfo =
      getCellBlockerInfo(
        target.position.q,
        target.position.r
      )

    const coverRank = value => {
      if (value === 'total') return 3
      if (
        value ===
        'three-quarters'
      ) {
        return 2
      }
      if (value === 'half') {
        return 1
      }
      return 0
    }

    const effectiveCover =
      coverRank(
        targetCellInfo.cover
      ) >
      coverRank(
        lineOfSight.cover
      )
        ? targetCellInfo.cover
        : lineOfSight.cover

    const adjacent =
      distanceFeet <=
      cellSizeFeet.value

    const attackerFaction =
      attacker.faction ??
      attackerParticipant.faction ??
      'friendly'

    const hostileTokensNearAttacker =
      tokens.value.some(
        token => {
          if (
            token.id === attacker.id ||
            token.hp <= 0
          ) {
            return false
          }

          if (
            (
              token.faction ??
              'friendly'
            ) === 'neutral'
          ) {
            return false
          }

          if (
            (
              token.faction ??
              'friendly'
            ) ===
            attackerFaction
          ) {
            return false
          }

          return (
            getHexDistanceRaw(
              token.position,
              attacker.position
            ) <= 1
          )
        }
      )

    const enemyTokens =
      tokens.value.filter(
        token =>
          token.id !== target.id &&
          token.id !== attacker.id &&
          token.hp > 0 &&
          token.faction ===
            attackerFaction &&
          token.faction !==
            'neutral'
      )

    const axial =
      offsetToAxial(
        target.position.q,
        target.position.r
      )

    const direction =
      position => {
        const a =
          offsetToAxial(
            position.q,
            position.r
          )

        const dq =
          a.q - axial.q

        const dr =
          a.r - axial.r

        const ds =
          -dq - dr

        return {
          dq,
          dr,
          ds
        }
      }

    let flanked = false

    if (
      adjacent &&
      combatRules.flankingEnabled
    ) {
      const dirs =
        enemyTokens
          .filter(
            enemy =>
              getHexDistanceRaw(
                enemy.position,
                target.position
              ) === 1
          )
          .map(
            enemy =>
              direction(
                enemy.position
              )
          )

      const ad =
        direction(
          attacker.position
        )

      flanked =
        dirs.some(
          other =>
            other.dq === -ad.dq &&
            other.dr === -ad.dr &&
            other.ds === -ad.ds
        )
    }

    const attackMode =
      attackProfile?.isRanged ||
      (
        attackProfile?.isThrown &&
        distanceFeet >
          Number(
            attackProfile.reach ??
            5
          )
      )
        ? 'ranged'
        : 'melee'

    const advantageSources =
      flanked
        ? ['flanking']
        : []

    const disadvantageSources =
      []

    if (
      attackMode === 'ranged' &&
      hostileTokensNearAttacker
    ) {
      disadvantageSources.push(
        'hostile-within-5-feet'
      )
    }

    const normalRange =
      Number(
        attackProfile?.normalRange ??
        5
      )

    const longRange =
      Number(
        attackProfile?.longRange ??
        normalRange
      )

    if (
      attackMode === 'ranged' &&
      distanceFeet >
        normalRange
    ) {
      disadvantageSources.push(
        'long-range'
      )
    }

    const baseContext = {
      attackerId:
        attackerTokenId,
      targetId:
        targetTokenId,
      distanceFeet,
      adjacent,
      attackMode,
      weaponName:
        attackProfile?.weapon?.name ??
        'Без оружия',
      attackModifier:
        attackProfile?.attackModifier ??
        0,
      attackCount:
        attackProfile?.attackCount ??
        1,
      reachFeet:
        attackProfile?.reach ??
        5,
      normalRangeFeet:
        normalRange,
      longRangeFeet:
        longRange,
      targetAC:
        targetParticipant
          ? combatStore.getEffectiveArmorClass(
              targetParticipant.id
            )
          : target.ac,
      cover:
        effectiveCover,
      lineOfSight:
        lineOfSight.visible,
      flankingEnabled:
        combatRules.flankingEnabled,
      flanked,
      advantageSources,
      disadvantageSources,
      withinFiveFeetOfHostile:
        hostileTokensNearAttacker,
      notes: []
    }

    if (
      effectiveCover === 'half'
    ) {
      baseContext.notes.push(
        'Укрытие: +2 к AC цели (D&D 5e 2014).'
      )
    } else if (
      effectiveCover ===
      'three-quarters'
    ) {
      baseContext.notes.push(
        'Укрытие: +5 к AC цели (D&D 5e 2014).'
      )
    } else if (
      effectiveCover === 'total'
    ) {
      baseContext.notes.push(
        'Полное укрытие: цель нельзя выбрать напрямую для этой атаки.'
      )
    }

    if (flanked) {
      baseContext.notes.push(
        'Фланкирование: преимущество (опциональное правило DMG 2014).'
      )
    }

    if (
      attackMode === 'ranged' &&
      hostileTokensNearAttacker
    ) {
      baseContext.notes.push(
        'В 5 ft от враждебного существа: помеха для дальней атаки.'
      )
    }

    if (
      attackMode === 'ranged' &&
      distanceFeet > normalRange
    ) {
      baseContext.notes.push(
        'Дальняя дистанция: помеха.'
      )
    }

    const validation =
      combatStore.canMakeWeaponAttack(
        attackerParticipant.id,
        targetParticipant?.id ??
          target.id,
        baseContext
      )

    return {
      ...baseContext,
      canAttack:
        validation.allowed,
      reason:
        validation.reason ??
        null
    }
  }

  const combatRules = {
    get flankingEnabled() {
      return useCombatStore()
        .flankingEnabled
    }
  }

  return {
    id,
    width,
    height,
    cellSizeFeet,
    selectedHex,
    hoveredHex,
    tokens,
    participants,
    objects,
    objectCells,
    tokenCells,
    editorMode,
    objectTool,
    tokenTool,
    selectedTerrainId,
    selectedObjectTypeId,
    selectedTokenTypeId,
    selectedObjectId,
    selectedTokenId,
    cells,
    terrainCells,
    showCoordinates,
    selectedParticipant,
    selectedToken,
    selectedObject,
    isInside,
    getCell,
    getTerrain,
    getObjectType,
    getHexDistance,
    getHexLine,
    getLineOfSight,
    getTokenTacticalInfo,
    getObjectsAt,
    getObjectAt,
    getTokensAt,
    getTokenAt,
    setSelectedHex,
    setHoveredHex,
    setParticipants,
    setParticipantPosition,
    setTokenTool,
    setSelectedTokenType,
    setSelectedToken,
    updateSelectedToken,
    setEditorMode,
    setObjectTool,
    setSelectedTerrain,
    setSelectedObjectType,
    setSelectedObject,
    paintTerrain,
    eraseTerrain,
    clearTerrain,
    clearTokens,
    clearObjects,
    clearBattlefield,
    placeToken,
    addSavedCharacterToCombat,
    syncCombatParticipants,
    getCombatAttackContext,
    syncLinkedCombatState,
    getTokenMovementStatus,
    getTokenMoveInfo,
    getReachableTokenCells,
    canMoveToken,
    getOpportunityAttackers,
    moveToken,
    moveSelectedToken,
    canDashToken,
    useDashToken,
    removeToken,
    removeTokenAt,
    placeObject,
    canMoveObject,
    moveObject,
    moveSelectedObject,
    removeObject,
    removeObjectAt,
    toggleCoordinates,
    getTokenCenterDistanceFeet,
    getSpellTargetContext,
    getSpellAreaContext,
    getSpellAreaDirection,
    pushToken,
    getSpellPushDestination
  }
})