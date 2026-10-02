<script setup>
import BattlefieldTokenPanel from './BattlefieldTokenPanel.vue'

defineProps({
  editorMode: {
    type: String,
    default: 'select'
  },
  selectedTerrainId: {
    type: String,
    default: null
  },
  selectedObjectTypeId: {
    type: String,
    default: null
  },
  selectedTokenTypeId: {
    type: String,
    default: null
  },
  selectedObject: {
    type: Object,
    default: null
  },
  selectedToken: {
    type: Object,
    default: null
  },
  terrainTypes: {
    type: Array,
    default: () => []
  },
  objectTypes: {
    type: Array,
    default: () => []
  },
  tokenTypes: {
    type: Array,
    default: () => []
  },
  movementModes: {
    type: Array,
    default: () => []
  },
  movementStatus: {
    type: Object,
    default: null
  },
  movementMode: {
    type: String,
    default: 'walk'
  },
  canDash: {
    type: Boolean,
    default: false
  },
  combatSyncMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'close',
  'clear',
  'set-editor-mode',
  'select-terrain',
  'select-object-type',
  'select-token-type',
  'remove-object',
  'sync-combat',
  'update-token',
  'remove-token',
  'dash-token'
])

const setEditorMode = mode => {
  emit('set-editor-mode', mode)
}

const selectTerrain = id => {
  emit('select-terrain', id)
}

const selectObjectType = id => {
  emit('select-object-type', id)
}

const selectTokenType = id => {
  emit('select-token-type', id)
}

const removeObject = id => {
  emit('remove-object', id)
}

const syncCombat = () => {
  emit('sync-combat')
}

const updateToken = (field, value) => {
  emit('update-token', field, value)
}

const removeToken = id => {
  emit('remove-token', id)
}

const dashToken = id => {
  emit('dash-token', id)
}
</script>

<template>
  <div
    class="absolute bottom-3 left-3 top-[76px] z-30 w-[min(300px,calc(100vw-24px))] overflow-y-auto rounded-3xl border border-[#665238] bg-[#14110d]/88 p-3 text-[#efe5d2] shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl"
  >
    <div class="flex items-center justify-between">
      <div>
        <div
          class="text-[10px] font-semibold tracking-[0.22em] text-[#a58a59]"
        >
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
          @click="emit('clear')"
        >
          Очистить поле
        </button>

        <button
          type="button"
          class="rounded-lg border border-[#5e4c34] px-2 py-1 text-[10px] text-[#cbb78c] transition hover:border-[#9d7c46] hover:bg-[#241c14]"
          @click="emit('close')"
        >
          ×
        </button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-5 gap-2">
      <button
        type="button"
        class="rounded-lg border px-2 py-2 text-[11px] transition"
        :class="editorMode === 'select'
          ? 'border-[#c9a95f] bg-[#2a2115] text-[#f2d78e]'
          : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
        @click="setEditorMode('select')"
      >
        Выбор
      </button>

      <button
        type="button"
        class="rounded-lg border px-2 py-2 text-[11px] transition"
        :class="editorMode === 'terrain'
          ? 'border-[#80a66b] bg-[#203020] text-[#d4e6c9]'
          : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
        @click="setEditorMode('terrain')"
      >
        Terrain
      </button>

      <button
        type="button"
        class="rounded-lg border px-2 py-2 text-[11px] transition"
        :class="editorMode === 'objects'
          ? 'border-[#a9844f] bg-[#292015] text-[#efd398]'
          : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
        @click="setEditorMode('objects')"
      >
        Объекты
      </button>

      <button
        type="button"
        class="rounded-lg border px-2 py-2 text-[11px] transition"
        :class="editorMode === 'tokens'
          ? 'border-[#5f8f9e] bg-[#1e3038] text-[#cdeffc]'
          : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
        @click="setEditorMode('tokens')"
      >
        Токены
      </button>

      <button
        type="button"
        class="rounded-lg border px-2 py-2 text-[11px] transition"
        :class="editorMode === 'erase'
          ? 'border-[#a66b61] bg-[#30201d] text-[#f1c2bb]'
          : 'border-[#4f4230] bg-[#17130f] text-[#d2c4ad] hover:bg-[#211b15]'"
        @click="setEditorMode('erase')"
      >
        Ластик
      </button>
    </div>

    <div
      v-if="editorMode === 'terrain'"
      class="mt-3"
    >
      <div
        class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]"
      >
        Тип поверхности
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="terrain in terrainTypes"
          :key="terrain.id"
          type="button"
          class="flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] transition"
          :class="selectedTerrainId === terrain.id
            ? 'border-[#c8a45b] bg-[#2b2217] text-[#f1d995]'
            : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
          @click="selectTerrain(terrain.id)"
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
      v-if="editorMode === 'objects'"
      class="mt-3"
    >
      <div
        class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]"
      >
        Объекты
      </div>

      <div
        class="rounded-lg border border-[#40382c] bg-[#15110e] px-3 py-2 text-[9px] leading-4 text-[#c9bca9]"
      >
        Пустой hex — поставить выбранный объект. Клик по объекту — выбрать.
        Потяните объект — переместить. Пустое поле + drag — передвинуть карту.
      </div>

      <div
        class="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]"
      >
        Объект
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="objectType in objectTypes"
          :key="objectType.id"
          type="button"
          class="flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[11px] transition"
          :class="selectedObjectTypeId === objectType.id
            ? 'border-[#c8a45b] bg-[#2b2217] text-[#f1d995]'
            : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
          @click="selectObjectType(objectType.id)"
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
        v-if="selectedObject"
        class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-[#ddcda9]">
            {{ selectedObject.name }}
          </span>

          <button
            type="button"
            class="rounded-md border border-[#60433a] px-2 py-1 text-[9px] text-[#d99b90]"
            @click="removeObject(selectedObject.id)"
          >
            Удалить
          </button>
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-if="selectedObject.blocksMovement"
            class="rounded-full border border-[#705c39] bg-[#271f14] px-2 py-1 text-[9px] text-[#d7bd80]"
          >
            Блокирует движение
          </span>

          <span
            v-if="selectedObject.blocksLineOfSight"
            class="rounded-full border border-[#5c4a3a] bg-[#211a15] px-2 py-1 text-[9px] text-[#cfbca1]"
          >
            Блокирует обзор
          </span>

          <span
            v-if="selectedObject.cover"
            class="rounded-full border border-[#536146] bg-[#1c261a] px-2 py-1 text-[9px] text-[#b9cfaa]"
          >
            Cover: {{ selectedObject.cover }}
          </span>

          <span
            v-if="selectedObject.destructible"
            class="rounded-full border border-[#5b4b3d] bg-[#211913] px-2 py-1 text-[9px] text-[#cdb59a]"
          >
            HP: {{ selectedObject.hp }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="editorMode === 'tokens'"
      class="mt-3"
    >
      <div class="flex items-center justify-between gap-2">
        <div
          class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b0a084]"
        >
          Токены
        </div>

        <button
          type="button"
          class="rounded-lg border border-[#5f8f9e] bg-[#1d3038] px-2 py-1 text-[9px] text-[#c9ecf5] transition hover:bg-[#25404a]"
          @click="syncCombat"
        >
          Синхронизировать бой
        </button>
      </div>

      <div
        class="mt-2 rounded-lg border border-[#40382c] bg-[#15110e] px-3 py-2 text-[9px] leading-4 text-[#c9bca9]"
      >
        Пустой hex — поставить выбранный токен.
        Клик по токену — выбрать. Потяните токен — переместить.
        Потяните пустое поле — передвинуть карту.
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2">
        <button
          v-for="tokenType in tokenTypes"
          :key="tokenType.id"
          type="button"
          class="rounded-lg border px-2 py-2 text-[10px] transition"
          :class="selectedTokenTypeId === tokenType.id
            ? 'border-[#6f9fb0] bg-[#21343d] text-[#d8f2fa]'
            : 'border-[#40382c] bg-[#16130f] text-[#d5c7b4] hover:bg-[#201a14]'"
          @click="selectTokenType(tokenType.id)"
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

      <BattlefieldTokenPanel
        :token="selectedToken"
        :movement-modes="movementModes"
        :movement-status="movementStatus"
        :movement-mode="movementMode"
        :can-dash="canDash"
        @update="updateToken"
        @remove="removeToken"
        @dash="dashToken"
      />
    </div>

    <div
      v-if="editorMode === 'erase'"
      class="mt-3 rounded-xl border border-[#4b3934] bg-[#17110f] p-3 text-[11px] leading-5 text-[#bcaea0]"
    >
      Ластик удаляет объект с клетки. Если объекта нет, удаляется terrain.
    </div>

    <div
      v-if="editorMode === 'select'"
      class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3 text-[11px] leading-5 text-[#d0c4b3]"
    >
      Режим выбора. Клик по hex выбирает клетку или объект.
    </div>
  </div>
</template>