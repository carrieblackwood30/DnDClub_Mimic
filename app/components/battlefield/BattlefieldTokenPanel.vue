<script setup>
import { computed } from 'vue'

const props = defineProps({
  token: {
    type: Object,
    default: null
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
    default: null
  },
  canDash: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update',
  'remove',
  'dash'
])

const token = computed(() => props.token)

const movementStatus = computed(() => {
  return props.movementStatus
})

const movementMode = computed(() => {
  return (
    props.movementModes.find(
      mode => mode.id === props.movementMode
    ) ??
    props.movementModes[0] ??
    null
  )
})

const updateField = (field, value) => {
  emit('update', field, value)
}
</script>

<template>
  <div
    v-if="token"
    class="mt-3 rounded-xl border border-[#40382c] bg-[#100e0c]/90 p-3"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="truncate text-xs font-semibold text-[#ddcda9]">
        {{ token.name }}
      </span>

      <button
        type="button"
        class="rounded-md border border-[#60433a] px-2 py-1 text-[9px] text-[#d99b90] transition hover:bg-[#301c19]"
        @click="emit('remove', token.id)"
      >
        Удалить
      </button>
    </div>

    <div class="mt-3 space-y-2">
      <label class="block">
        <span
          class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
        >
          Имя
        </span>

        <input
          :value="token.name"
          type="text"
          class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
          @input="updateField('name', $event.target.value)"
        >
      </label>

      <div class="grid grid-cols-2 gap-2">
        <label>
          <span
            class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
          >
            HP
          </span>

          <input
            :value="token.hp"
            type="number"
            min="0"
            :max="token.maxHp"
            class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
            @input="updateField('hp', $event.target.value)"
          >
        </label>

        <label>
          <span
            class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
          >
            Max HP
          </span>

          <input
            :value="token.maxHp"
            type="number"
            min="0"
            class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
            @input="updateField('maxHp', $event.target.value)"
          >
        </label>

        <label>
          <span
            class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
          >
            AC
          </span>

          <input
            :value="token.ac"
            type="number"
            min="0"
            class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
            @input="updateField('ac', $event.target.value)"
          >
        </label>

        <label>
          <span
            class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
          >
            Speed
          </span>

          <input
            :value="token.speed"
            type="number"
            min="0"
            class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
            @input="updateField('speed', $event.target.value)"
          >
        </label>
      </div>

      <label class="block">
        <span
          class="mb-1 block text-[9px] uppercase tracking-[0.12em] text-[#a89983]"
        >
          Режим движения
        </span>

        <select
          :value="token.movementMode"
          class="w-full rounded-lg border border-[#40382c] bg-[#15110e] px-2 py-2 text-[11px] text-[#e9dfcc] outline-none focus:border-[#6f9fb0]"
          @change="updateField('movementMode', $event.target.value)"
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

      <div
        class="mt-3 rounded-lg border border-[#3c4f4a] bg-[#13201d] p-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="text-[9px] uppercase tracking-[0.12em] text-[#8daaa2]"
          >
            Движение
          </span>

          <span
            class="text-[10px] font-semibold text-[#d8e9df]"
          >
            {{ movementMode?.icon }}
            {{ movementMode?.name }}
          </span>
        </div>

        <div
          v-if="movementStatus?.enforced"
          class="mt-2 space-y-1.5 text-[10px]"
        >
          <div class="flex items-center justify-between">
            <span class="text-[#b6c9c0]">
              Пройдено за ход
            </span>

            <span class="font-semibold text-[#e6f5ea]">
              {{ movementStatus.usedFeet }} ft
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[#b6c9c0]">
              Осталось
            </span>

            <span class="font-semibold text-[#e6f5ea]">
              {{ movementStatus.remainingFeet }} /
              {{ movementStatus.allowanceFeet }} ft
            </span>
          </div>

          <div
            v-if="movementStatus.dashUsed"
            class="rounded-md border border-[#5c4f31] bg-[#211b12] px-2 py-1 text-[9px] text-[#d8bd7d]"
          >
            Рывок активен · доступно
            {{ movementStatus.allowanceFeet }} ft
          </div>
        </div>

        <div
          v-else
          class="mt-2 text-[10px] text-[#a9bcb3]"
        >
          Свободное перемещение вне боя
        </div>

        <div
          v-if="
            movementStatus?.enforced &&
            !movementStatus?.currentTurn
          "
          class="mt-2 rounded-md border border-[#564239] bg-[#211714] px-2 py-1.5 text-[9px] text-[#dfc5b7]"
        >
          Сейчас ход другого участника.
        </div>

        <button
          v-if="
            movementStatus?.enforced &&
            movementStatus?.currentTurn
          "
          type="button"
          class="mt-2 w-full rounded-md border px-2 py-1.5 text-[10px] transition"
          :class="canDash
            ? 'border-[#8a7040] bg-[#2a2115] text-[#eed59a] hover:bg-[#352817]'
            : 'border-[#40382c] bg-[#17130f] text-[#6f675b]'"
          :disabled="!canDash"
          @click="emit('dash', token.id)"
        >
          Рывок · +{{ token.speed }} ft движения
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-1">
      <span
        class="rounded-full border border-[#42515b] bg-[#172027] px-2 py-1 text-[9px] text-[#b9ced9]"
      >
        {{ token.tokenType }}
      </span>

      <span
        v-if="token.combatParticipantId"
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
</template>