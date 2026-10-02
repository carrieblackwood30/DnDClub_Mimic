<script setup>

import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { useBattlefieldStore } from '~/stores/battlefield'

import { useCombatStore } from '~/stores/combat'

import { useCharactersStore } from '~/stores/characters'

import { useBattlefieldCanvas } from '~/composables/useBattlefieldCanvas'

import BattlefieldToolbar from '~/components/battlefield/BattlefieldToolbar.vue'

import BattlefieldCombatPanel from '~/components/battlefield/BattlefieldCombatPanel.vue'

import BattlefieldEditorPanel from '~/components/battlefield/BattlefieldEditorPanel.vue'

import BattlefieldMovementPanel from '~/components/battlefield/BattlefieldMovementPanel.vue'

import BattlefieldTargetPanel from '~/components/battlefield/BattlefieldTargetPanel.vue'

import BattlefieldHud from '~/components/battlefield/BattlefieldHud.vue'

import BattlefieldCanvas from '~/components/battlefield/BattlefieldCanvas.vue'

import BattlefieldSpellPanel from '~/components/battlefield/BattlefieldSpellPanel.vue'

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

const store = useBattlefieldStore()

const combatStore = useCombatStore()

const charactersStore = useCharactersStore()

const canvasComponent = ref(null)

const host = () => {
  return canvasComponent.value?.getHost?.() ?? null
}

const combatSyncMessage = ref('')

const showEditorPanel = ref(true)

const showBattlePanel = ref(true)

const playerControlMode = ref(false)

const attackResult = ref(null)

const browserFullscreen = ref(false)

const attackContext = ref(null)

const showSpellPanel = ref(true)

const battleMode = computed(() => {

  return combatStore.combatStarted

})

const currentCombatParticipant = computed(() => {

  return combatStore.currentParticipant ?? null

})

const currentCombatCharacterId = computed(() => {

  return (

    currentCombatParticipant.value?.characterId ??

    null

  )

})

const currentCombatToken = computed(() => {

  const participantId =

    currentCombatParticipant.value?.id

  if (!participantId) {

    return null

  }

  return store.tokens.find(

    token =>

      token.combatParticipantId ===

      participantId

  ) ?? null

})

const selectedToken = computed(() => {

  return store.selectedToken ?? null

})

const pendingOpportunityAttacks = computed(() => {

  return combatStore.pendingOpportunityAttacks ?? []

})

const getParticipantName = id => {

  return (

    combatStore.participants.find(

      participant => participant.id === id

    )?.name ??

    'Участник'

  )

}

const loadCharacters = async () => {

  await charactersStore.loadCharacters()

}

const selectAttackTarget = token => {

  const attacker =

    currentCombatToken.value

  if (

    !attacker ||

    !token ||

    attacker.id === token.id ||

    token.hp <= 0

  ) {

    attackContext.value = null

    return

  }

  attackContext.value =

    store.getCombatAttackContext(

      attacker.id,

      token.id

    )

}

const {

  tacticalPreview,

  drawBattlefield,

  centerWorld,

  clearTacticalPreview,

  draggedTokenId

} = useBattlefieldCanvas({

  host,

  store,

  combatStore,

  battleMode,

  playerControlMode,

  selectAttackTarget,

  loadCharacters

})

const syncCombatParticipants = () => {

  const result =

    store.syncCombatParticipants()

  combatSyncMessage.value =

    `Добавлено: ${result.added} · обновлено: ${result.updated}` +

    (

      result.failed

        ? ` · не добавлено: ${result.failed}`

        : ''

    )

  store.syncLinkedCombatState()

  drawBattlefield()

}

const startBattle = () => {

  syncCombatParticipants()

  const started =

    combatStore.startCombat()

  attackResult.value = null

  if (started) {

    showBattlePanel.value = true

    store.syncLinkedCombatState()

    drawBattlefield()

  }

}

const endBattle = () => {

  combatStore.endCombat()

  attackContext.value = null

  attackResult.value = null

  store.syncLinkedCombatState()

  drawBattlefield()

}

const nextBattleTurn = () => {

  combatStore.nextTurn()

  store.syncLinkedCombatState()

  attackContext.value = null

  attackResult.value = null

  drawBattlefield()

}

const previousBattleTurn = () => {

  combatStore.previousTurn()

  store.syncLinkedCombatState()

  attackContext.value = null

  attackResult.value = null

  drawBattlefield()

}

const addTestPlayer = () => {

  combatStore.addTestPlayer()

  syncCombatParticipants()

}

const addEnemyPreset = presetId => {

  combatStore.addEnemyPreset(presetId)

  syncCombatParticipants()

}

const addSavedCharacter = characterId => {

  const participant =

    store.addSavedCharacterToCombat(

      characterId

    )

  if (!participant) {

    combatSyncMessage.value =

      'Персонаж не найден.'

    return

  }

  combatSyncMessage.value =

    `Добавлен персонаж: ${participant.name}`

  store.syncLinkedCombatState()

  drawBattlefield()

}

const togglePlayerControl = () => {

  playerControlMode.value =

    !playerControlMode.value

  attackResult.value = null

}

const toggleFlankingRule = () => {

  combatStore.toggleFlanking()

  if (attackContext.value) {

    attackContext.value =

      store.getCombatAttackContext(

        attackContext.value.attackerId,

        attackContext.value.targetId

      )

  }

  drawBattlefield()

}

const performBasicAttack = () => {

  if (!attackContext.value) {

    return

  }

  const attacker =

    currentCombatToken.value

  if (!attacker?.combatParticipantId) {

    return

  }

  const targetToken =

    store.tokens.find(

      token =>

        token.id ===

        attackContext.value.targetId

    )

  if (!targetToken?.combatParticipantId) {

    return

  }

  const result =

    combatStore.resolveWeaponAttack({

      attackerId:

        attacker.combatParticipantId,

      targetId:

        targetToken.combatParticipantId,

      attackContext:

        attackContext.value

    })

  attackResult.value = result

  store.syncLinkedCombatState()

  attackContext.value =

    store.getCombatAttackContext(

      attacker.id,

      targetToken.id

    )

  drawBattlefield()

}

const toggleBrowserFullscreen = async () => {

  if (!document.fullscreenElement) {

    await document.documentElement.requestFullscreen?.()

    return

  }

  await document.exitFullscreen?.()

}

const handleFullscreenChange = () => {

  browserFullscreen.value =

    Boolean(document.fullscreenElement)

}

onMounted(() => {

  document.addEventListener(

    'fullscreenchange',

    handleFullscreenChange

  )

  handleFullscreenChange()

})

onBeforeUnmount(() => {

  document.removeEventListener(

    'fullscreenchange',

    handleFullscreenChange

  )

})

const updateToken = (field, value) => {

  if (!store.selectedToken) {

    return

  }

  store.updateSelectedToken(

    field,

    value

  )

}

const removeSelectedToken = () => {

  if (!store.selectedToken) {

    return

  }

  store.removeToken(

    store.selectedToken.id

  )

}

const dashSelectedToken = () => {

  if (!store.selectedToken) {

    return

  }

  store.useDashToken(

    store.selectedToken.id

  )

  store.syncLinkedCombatState()

  drawBattlefield()

}

const removeSelectedObject = () => {

  if (!store.selectedObject) {

    return

  }

  store.removeObject(

    store.selectedObject.id

  )

  drawBattlefield()

}

const setEditorMode = mode => {

  store.setEditorMode(mode)

  clearTacticalPreview()

  drawBattlefield()

}

const selectTerrain = terrainId => {

  store.setSelectedTerrain(

    terrainId

  )

  drawBattlefield()

}

const selectObjectType = objectTypeId => {

  store.setSelectedObjectType(

    objectTypeId

  )

  drawBattlefield()

}

const selectTokenType = tokenTypeId => {

  store.setSelectedTokenType(

    tokenTypeId

  )

  drawBattlefield()

}

const clearBattlefield = () => {

  store.clearBattlefield()

  attackContext.value = null

  attackResult.value = null

  drawBattlefield()

}

watch(

  () => store.selectedTokenId,

  () => {

    if (

      combatStore.combatStarted &&

      store.selectedToken

    ) {

      selectAttackTarget(

        store.selectedToken

      )

    }


  }

)

watch(

  () => combatStore.currentTurn,

  () => {

    attackContext.value = null

    attackResult.value = null

    drawBattlefield()

  }

)

watch(

  () => combatStore.participants,

  () => {

    store.syncLinkedCombatState()

    drawBattlefield()

  },

  {

    deep: true

  }

)

watch(

  () => store.selectedObjectId,

  () => {

    drawBattlefield()

  }

)

</script>

<template>

  <section

    class="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden bg-[#090806] text-[#efe5d2]"

  >

<BattlefieldCanvas
      ref="canvasComponent"
      :height="props.height"
    />

    <BattlefieldHud
      :hovered-hex="store.hoveredHex"
      :selected-hex="store.selectedHex"
      :show-editor-panel="showEditorPanel"
    />

    <BattlefieldToolbar

      :show-editor-panel="showEditorPanel"

      :browser-fullscreen="browserFullscreen"

      :show-coordinates="store.showCoordinates"

      :combat-started="battleMode"

      :current-participant="currentCombatParticipant"

      :movement-used="currentCombatParticipant ? combatStore.getMovementUsed(currentCombatParticipant.id) : 0"

      :movement-allowance="currentCombatParticipant ? combatStore.getMovementAllowance(currentCombatParticipant.id) : 0"

      @toggle-editor="showEditorPanel = !showEditorPanel"

      @toggle-coordinates="store.toggleCoordinates"

      @toggle-fullscreen="toggleBrowserFullscreen"

    />

    <BattlefieldCombatPanel

      v-if="showBattlePanel"

      :battle-mode="battleMode"

      :show-battle-panel="showBattlePanel"

      :player-control-mode="playerControlMode"

      :combat-sync-message="combatSyncMessage"

      :current-participant="currentCombatParticipant"

      :round-number="combatStore.roundNumber"

      :turn-order="combatStore.turnOrder"

      :participants="combatStore.participants"

      :current-turn="combatStore.currentTurn"

      :flanking-enabled="combatStore.flankingEnabled"

      :characters="charactersStore.characters"

      :attack-context="attackContext"

      :attack-result="attackResult"

      @close="showBattlePanel = false"

      @open="showBattlePanel = true"

      @start-battle="startBattle"

      @previous-turn="previousBattleTurn"

      @next-turn="nextBattleTurn"

      @end-battle="endBattle"

      @toggle-player-control="togglePlayerControl"

      @toggle-flanking="toggleFlankingRule"

      @add-test-player="addTestPlayer"

      @add-enemy="addEnemyPreset"

      @add-character="addSavedCharacter"

      @perform-attack="performBasicAttack"

    />

    <button

      v-if="!showBattlePanel"

      type="button"

      class="absolute right-3 top-[76px] z-30 rounded-xl border border-[#725a35] bg-[#17130f]/95 px-3 py-2 text-[10px] font-semibold text-[#f0dfb2] shadow-xl backdrop-blur-xl"

      @click="showBattlePanel = true"

    >

      ⚔ Бой

    </button>

    <BattlefieldEditorPanel

      v-if="showEditorPanel"

      :editor-mode="store.editorMode"

      :terrain-types="terrainTypes"

      :object-types="battlefieldObjectTypes"

      :token-types="battlefieldTokenTypes"

      :selected-terrain-id="store.selectedTerrainId"

      :selected-object-type-id="store.selectedObjectTypeId"

      :selected-token-type-id="store.selectedTokenTypeId"

      :selected-object="store.selectedObject"

      :selected-token="store.selectedToken"

      :movement-modes="movementModes"

      :movement-status="store.selectedToken ? store.getTokenMovementStatus(store.selectedToken.id) : null"

      :movement-mode="store.selectedToken?.movementMode ?? movementModes[0]?.id"

      :can-dash="store.selectedToken ? store.canDashToken(store.selectedToken.id) : false"

      :combat-sync-message="combatSyncMessage"

      @close="showEditorPanel = false"

      @clear="clearBattlefield"

      @set-editor-mode="setEditorMode"

      @select-terrain="selectTerrain"

      @select-object-type="selectObjectType"

      @select-token-type="selectTokenType"

      @remove-object="removeSelectedObject"

      @sync-combat="syncCombatParticipants"

      @update-token="updateToken"

      @remove-token="removeSelectedToken"

      @dash-token="dashSelectedToken"

    />

    <BattlefieldMovementPanel
      :dragged-token-id="draggedTokenId"
      :tactical-preview="tacticalPreview"
    />

    <BattlefieldTargetPanel
      :attack-context="attackContext"
      :attack-result="attackResult"
      :target-name="store.tokens.find(token => token.id === attackContext?.targetId)?.name ?? '—'"
      @attack="performBasicAttack"
    />

    <div

      v-if="currentCombatCharacterId"

      class="absolute bottom-4 left-1/2 z-40 max-h-[calc(100vh-2rem)] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden"

    >

      <div class="rounded-2xl border border-[#675338] bg-[#14110d]/95 p-3 shadow-2xl backdrop-blur-xl">

        <div class="mb-2 flex items-center justify-between">

          <div class="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a58a59]">

            Боевые заклинания

          </div>

          <button

            type="button"

            class="rounded-lg border border-[#5d4c34] px-2 py-1 text-[9px] text-[#cdbd9f]"

            @click="showSpellPanel = !showSpellPanel"

          >

            {{ showSpellPanel ? 'Скрыть' : 'Заклинания' }}

          </button>

        </div>

        <div

          v-if="showSpellPanel"

          class="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1"

        >

          <BattlefieldSpellPanel />

        </div>

      </div>

    </div>

    <div

      v-if="pendingOpportunityAttacks.length"

      class="pointer-events-auto fixed left-1/2 top-20 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2 rounded-xl border border-red-400/50 bg-[#17120f]/95 p-4 text-[#f4e7c8] shadow-2xl backdrop-blur-md"

    >

      <div class="text-xs font-bold uppercase tracking-[0.2em] text-red-300">

        Провоцированная атака

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

              class="rounded-lg border border-red-300/50 bg-red-900/40 px-3 py-2 text-xs font-semibold"

              @click="combatStore.useOpportunityAttack(opportunity.id)"

            >

              Атаковать

            </button>

            <button

              type="button"

              class="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"

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