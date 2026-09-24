import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { battlefieldDefaults } from '~/data/battlefield/battlefieldDefaults'
import {
  terrainById,
  defaultTerrainId
} from '~/data/battlefield/terrain'

const getCellKey = (q, r) => `${q}:${r}`

export const useBattlefieldStore = defineStore('battlefield', () => {
  const id = ref(battlefieldDefaults.id)
  const width = ref(battlefieldDefaults.width)
  const height = ref(battlefieldDefaults.height)
  const cellSizeFeet = ref(battlefieldDefaults.cellSizeFeet)
  const selectedHex = ref(null)
  const hoveredHex = ref(null)
  const participants = ref([])
  const editorMode = ref('select')
  const selectedTerrainId = ref(defaultTerrainId)
  const cells = ref({})
  const showCoordinates = ref(false)

  const selectedParticipant = computed(() => {
    if (!selectedHex.value) {
      return null
    }

    return participants.value.find(participant => {
      return (
        participant.position.q === selectedHex.value.q &&
        participant.position.r === selectedHex.value.r
      )
    }) ?? null
  })

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

  const setSelectedHex = (hex) => {
    selectedHex.value = hex
  }

  const setHoveredHex = (hex) => {
    hoveredHex.value = hex
  }

  const setParticipants = (items) => {
    participants.value = items.map(item => ({
      ...item,
      position: {
        q: item.position.q,
        r: item.position.r
      }
    }))
  }

  const setParticipantPosition = (participantId, position) => {
    const participant = participants.value.find(
      item => item.id === participantId
    )

    if (!participant) {
      return false
    }

    participant.position = {
      q: position.q,
      r: position.r
    }

    return true
  }

  const setEditorMode = (mode) => {
    editorMode.value = mode
  }

  const setSelectedTerrain = (terrainId) => {
    if (!terrainById[terrainId]) {
      return false
    }

    selectedTerrainId.value = terrainId
    return true
  }

  const paintTerrain = (q, r, terrainId = selectedTerrainId.value) => {
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

    delete cells.value[getCellKey(q, r)]
    return true
  }

  const clearTerrain = () => {
    cells.value = {}
  }

  const getTerrain = terrainId => {
    return terrainById[terrainId] ?? terrainById[defaultTerrainId]
  }

  const toggleCoordinates = () => {
    showCoordinates.value = !showCoordinates.value
  }

  return {
    id,
    width,
    height,
    cellSizeFeet,
    selectedHex,
    hoveredHex,
    participants,
    editorMode,
    selectedTerrainId,
    cells,
    terrainCells,
    showCoordinates,
    selectedParticipant,
    getCell,
    getTerrain,
    setSelectedHex,
    setHoveredHex,
    setParticipants,
    setParticipantPosition,
    setEditorMode,
    setSelectedTerrain,
    paintTerrain,
    eraseTerrain,
    clearTerrain,
    toggleCoordinates
  }
})
