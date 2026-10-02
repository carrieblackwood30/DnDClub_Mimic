<script setup>
const props = defineProps({
  battleMode: {
    type: Boolean,
    default: false
  },
  showBattlePanel: {
    type: Boolean,
    default: true
  },
  playerControlMode: {
    type: Boolean,
    default: false
  },
  combatSyncMessage: {
    type: String,
    default: ''
  },
  currentParticipant: {
    type: Object,
    default: null
  },
  roundNumber: {
    type: Number,
    default: 1
  },
  turnOrder: {
    type: Array,
    default: () => []
  },
  participants: {
    type: Array,
    default: () => []
  },
  currentTurn: {
    type: [String, Number],
    default: null
  },
  flankingEnabled: {
    type: Boolean,
    default: false
  },
  characters: {
    type: Array,
    default: () => []
  },
  attackContext: {
    type: Object,
    default: null
  },
  attackResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close',
  'open',
  'start-battle',
  'previous-turn',
  'next-turn',
  'end-battle',
  'toggle-player-control',
  'toggle-flanking',
  'add-test-player',
  'add-enemy',
  'add-character',
  'perform-attack'
])

const getParticipant = id => {
  return props.participants.find(
    participant => participant.id === id
  ) ?? null
}

const labels = {
  'participant-not-found': 'Участник не найден',
  'no-attacker': 'Нет атакующего персонажа',
  'no-target': 'Нет цели атаки',
  'target-unconscious': 'Цель недееспособна',
  'attacker-unconscious': 'Атакующий недееспособен',
  'attacker-incapacitated': 'Атакующий недееспособен',
  'not-current-turn': 'Сейчас не ход этого участника',
  'attack-action-unavailable': 'Атака действием недоступна',
  'no-action': 'Действие уже использовано',
  'no-attacks': 'Атаки уже использованы',
  'out-of-range': 'Цель вне дальности оружия',
  'out-of-reach': 'Цель вне досягаемости оружия',
  'weapon-unavailable': 'Оружие недоступно',
  'line-of-sight-blocked': 'Линия обзора заблокирована',
  'total-cover': 'Цель полностью укрыта',
  dead: 'Участник недееспособен',
  incapacitated: 'Участник недееспособен',
  blocked: 'Атака недоступна'
}

const getAttackReasonLabel = reason => {
  return labels[reason] ?? 'Атака недоступна'
}

</script>

<template>
  <aside
    v-if="showBattlePanel"
    class="absolute bottom-3 right-3 top-[76px] z-30 flex w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-[#6d5735] bg-[#17130f]/95 text-[#efe5d2] shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
  >
    <div class="shrink-0 border-b border-white/10 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
              :class="battleMode
                ? 'border-[#7da77c] bg-[#1d2c1b] text-[#cfe5c5]'
                : 'border-[#5b4b34] bg-[#15110d] text-[#cbb78c]'"
            >
              {{ battleMode ? 'БОЙ' : 'ПОДГОТОВКА' }}
            </span>

            <span
              class="truncate text-sm font-semibold text-[#f0e5ce]"
            >
              {{ battleMode ? `Раунд ${roundNumber}` : 'Battle Mode' }}
            </span>
          </div>

          <div
            class="mt-1 truncate text-[10px] text-[#a89983]"
          >
            {{
              battleMode
                ? `Ход: ${currentParticipant?.name ?? '—'}`
                : 'Карта готова к запуску боя'
            }}
          </div>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-lg border border-[#5e4c34] px-2 py-1.5 text-[11px] text-[#cbb78c] transition hover:border-[#9d7c46] hover:bg-[#241c14]"
          title="Скрыть панель боя"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2">
        <button
          v-if="!battleMode"
          type="button"
          class="col-span-3 rounded-xl border border-[#75996d] bg-[#22331f] px-3 py-2.5 text-[11px] font-semibold text-[#d7e8d0] transition hover:bg-[#2a4026]"
          @click="emit('start-battle')"
        >
          ⚔ Начать бой
        </button>

        <template v-else>
          <button
            type="button"
            class="rounded-xl border border-[#5f4d36] bg-[#1a1510] px-2 py-2 text-[10px] text-[#dfcfaa] hover:bg-[#261d14]"
            @click="emit('previous-turn')"
          >
            ← Ход
          </button>

          <button
            type="button"
            class="rounded-xl border border-[#8a6d42] bg-[#2a2116] px-2 py-2 text-[10px] font-semibold text-[#f0d99e] hover:bg-[#382b1b]"
            @click="emit('next-turn')"
          >
            Следующий
          </button>

          <button
            type="button"
            class="rounded-xl border border-[#7b5048] bg-[#2b1b18] px-2 py-2 text-[10px] text-[#e4b1a9] hover:bg-[#3a2420]"
            @click="emit('end-battle')"
          >
            Завершить
          </button>
        </template>
      </div>
    </div>

    <div
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin]"
    >
      <div
        v-if="battleMode && currentParticipant"
        class="mb-3 rounded-xl border border-[#5f7f8c]/70 bg-[#10191d]/90 px-3 py-2.5"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div
              class="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#83a9b5]"
            >
              Сейчас ход
            </div>

            <div
              class="mt-0.5 truncate text-sm font-semibold text-[#e4f1f4]"
            >
              {{ currentParticipant.name }}
            </div>
          </div>

          <div class="shrink-0 text-right">
            <div
              class="text-[8px] uppercase tracking-[0.12em] text-[#718992]"
            >
              Движение
            </div>

            <div
              class="mt-0.5 text-sm font-semibold text-[#e4f1f4]"
            >
              {{ currentParticipant.movementUsed ?? 0 }} /
              {{ currentParticipant.movementAllowance ?? 0 }} ft
            </div>
          </div>
        </div>
      </div>

      <details
        class="group"
        :open="!battleMode"
      >
        <summary
          class="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-[10px] font-semibold text-[#cbb78c] transition hover:bg-white/5"
        >
          <span>Управление боем</span>
          <span
            class="text-[9px] text-[#8f806c] transition group-open:rotate-180"
          >
            ⌄
          </span>
        </summary>

        <div
          class="mt-2 rounded-xl border border-white/10 bg-[#110e0b]/80 p-3"
        >
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-[10px] transition"
              :class="playerControlMode
                ? 'border-[#6e9fbd] bg-[#1e3440] text-[#d8f2fa]'
                : 'border-[#4d4233] bg-[#15120f] text-[#b9aa93]'"
              @click="emit('toggle-player-control')"
            >
              {{ playerControlMode ? '✓ Режим игрока' : 'Режим DM' }}
            </button>

            <button
              type="button"
              class="rounded-full border border-[#9d7a47] bg-[#352817] px-3 py-1.5 text-[10px] text-[#efd39a]"
              @click="emit('toggle-flanking')"
            >
              {{ flankingEnabled ? '✓ Фланг' : 'Фланг выкл.' }}
            </button>
          </div>

          <div
            class="mt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8f806c]"
          >
            Добавить участника
          </div>

          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-lg border border-[#6f9b68] bg-[#1c2a19] px-2 py-2 text-[10px] text-[#d3e8cd]"
              @click="emit('add-test-player')"
            >
              + Тестовый игрок
            </button>

            <button
              type="button"
              class="rounded-lg border border-[#8b6252] bg-[#2a1b16] px-2 py-2 text-[10px] text-[#e7c1b4]"
              @click="emit('add-enemy', 'goblin')"
            >
              + Гоблин
            </button>

            <button
              type="button"
              class="rounded-lg border border-[#8b6252] bg-[#2a1b16] px-2 py-2 text-[10px] text-[#e7c1b4]"
              @click="emit('add-enemy', 'orc')"
            >
              + Орк
            </button>

            <button
              type="button"
              class="rounded-lg border border-[#8b6252] bg-[#2a1b16] px-2 py-2 text-[10px] text-[#e7c1b4]"
              @click="emit('add-enemy', 'skeleton')"
            >
              + Скелет
            </button>
          </div>

          <div
            v-if="characters.length"
            class="mt-2 grid grid-cols-2 gap-2"
          >
            <button
              v-for="character in characters"
              :key="`saved-${character.id}`"
              type="button"
              class="truncate rounded-lg border border-[#6e9fbd] bg-[#1d3039] px-2 py-2 text-[10px] text-[#d7eef6]"
              @click="emit('add-character', character.id)"
            >
              + {{ character.name || 'Персонаж' }}
            </button>
          </div>

          <div
            v-if="combatSyncMessage"
            class="mt-2 rounded-lg border border-[#3b5e68] bg-[#142127] px-2 py-2 text-[9px] text-[#b9dce7]"
          >
            {{ combatSyncMessage }}
          </div>
        </div>
      </details>

      <div
        v-if="battleMode"
        class="mt-3"
      >
        <div class="mb-2 flex items-center justify-between">
          <div
            class="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8f806c]"
          >
            Порядок хода
          </div>

          <div class="text-[9px] text-[#746858]">
            {{ turnOrder.length }} участников
          </div>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="id in turnOrder"
            :key="id"
            class="flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left"
            :class="id === currentTurn
              ? 'border-[#c9a95f] bg-[#302515] text-[#f3dfaa]'
              : 'border-white/10 bg-[#12100d] text-[#b8ab98]'"
          >
            <div class="min-w-0">
              <div
                class="truncate text-[11px] font-semibold"
              >
                {{ getParticipant(id)?.name ?? '—' }}
              </div>

              <div
                class="mt-0.5 text-[8px] opacity-65"
              >
                Инициатива {{ getParticipant(id)?.initiative ?? 0 }}
              </div>
            </div>

            <div
              class="shrink-0 text-[9px] opacity-70"
            >
              {{ id === currentTurn ? 'ХОД' : 'ожидание' }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="attackContext"
        class="mt-3 rounded-2xl border border-[#725a35] bg-[#17130f] p-3.5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div
              class="text-[9px] uppercase tracking-[0.18em] text-[#a58a59]"
            >
              Цель атаки
            </div>

            <div
              class="mt-1 truncate text-base font-semibold text-[#f0e5ce]"
            >
              {{ attackContext.targetName ?? '—' }}
            </div>

            <div
              class="mt-1 truncate text-[10px] text-[#b7aa94]"
            >
              {{ attackContext.weaponName }} ·
              {{
                attackContext.attackMode === 'ranged'
                  ? 'Дальняя'
                  : 'Ближняя'
              }}
            </div>
          </div>

          <div
            class="shrink-0 text-right text-[11px] text-[#d1c3a9]"
          >
            <div>
              {{ attackContext.distanceFeet }} ft
            </div>

            <div
              class="mt-0.5 text-[10px] text-[#a99b84]"
            >
              AC {{ attackContext.targetAC }}
            </div>
          </div>
        </div>

        <div
          class="mt-3 grid grid-cols-2 gap-2 text-[10px]"
        >
          <div
            class="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2"
          >
            Бонус атаки
            <strong>
              +{{ attackContext.attackModifier }}
            </strong>
          </div>

          <div
            class="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2"
          >
            Атак
            <strong>
              {{ attackContext.attackCount }}
            </strong>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-if="attackContext.advantageSources?.length"
            class="rounded-full border border-[#c49a57] bg-[#332514] px-2.5 py-1 text-[9px] text-[#f1d28f]"
          >
            Преимущество ·
            {{
              attackContext.advantageSources.join(', ') === 'flanking'
                ? 'фланг'
                : attackContext.advantageSources.join(', ')
            }}
          </span>

          <span
            v-if="attackContext.disadvantageSources?.length"
            class="rounded-full border border-[#a76767] bg-[#351c1c] px-2.5 py-1 text-[9px] text-[#efc1c1]"
          >
            Помеха ·
            {{ attackContext.disadvantageSources.join(', ') }}
          </span>

          <span
            v-if="
              !attackContext.advantageSources?.length &&
              !attackContext.disadvantageSources?.length
            "
            class="rounded-full border border-[#4c4337] bg-[#15120f] px-2.5 py-1 text-[9px] text-[#c6b89f]"
          >
            Обычный бросок
          </span>
        </div>

        <div
          v-if="attackContext.notes?.length"
          class="mt-2 space-y-1 text-[10px] leading-4 text-[#a99b84]"
        >
          <div
            v-for="note in attackContext.notes"
            :key="note"
          >
            {{ note }}
          </div>
        </div>

        <button
          type="button"
          class="mt-3 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition"
          :class="attackContext.canAttack
            ? 'border-[#a8844d] bg-[#2e2416] text-[#f2d796] hover:bg-[#3a2d1b]'
            : 'cursor-not-allowed border-[#4b4034] bg-[#15120f] text-[#756b5c]'"
          :disabled="!attackContext.canAttack"
          @click="emit('perform-attack')"
        >
          ⚔ Атаковать
        </button>

        <div
          v-if="!attackContext.canAttack"
          class="mt-2 text-center text-[10px] text-[#d8a29c]"
        >
          {{ getAttackReasonLabel(attackContext.reason) }}
        </div>

        <div
          v-if="attackResult"
          class="mt-3 rounded-xl border px-3 py-2.5 text-[11px]"
          :class="attackResult.success
            ? 'border-[#4f6e4a] bg-[#142016] text-[#d8ead3]'
            : 'border-[#704b46] bg-[#241514] text-[#ecc1bb]'"
        >
          <template v-if="attackResult.success">
            <div class="font-semibold">
              {{ attackResult.weapon?.name }}
              · d20
              {{ attackResult.rolls?.join(' / ') }}
            </div>

            <div class="mt-1">
              {{ attackResult.total }}
              против AC {{ attackResult.targetAC }}

              ·

              <span
                :class="attackResult.hit
                  ? 'text-[#b7dbab]'
                  : 'text-[#dda19a]'"
              >
                {{
                  attackResult.hit
                    ? `Попадание · ${attackResult.damage} урона`
                    : 'Промах'
                }}
              </span>
            </div>

            <div
              class="mt-1 text-[10px] text-[#a9b59f]"
            >
              Использовано атак:
              {{ attackResult.attacksUsed }}
              · осталось:
              {{ attackResult.attacksRemaining }}
            </div>
          </template>

          <template v-else>
            {{ getAttackReasonLabel(attackResult.reason) }}
          </template>
        </div>
      </div>

      <div
        v-else
        class="mt-3 rounded-xl border border-white/10 bg-[#100e0c]/80 p-3 text-[10px] leading-5 text-[#b9aa93]"
      >
        Выбери токен, затем цель на карте. Боевые действия появятся здесь.
      </div>
    </div>
  </aside>

  <button
    v-else
    type="button"
    class="absolute right-3 top-[76px] z-30 rounded-xl border border-[#725a35] bg-[#17130f]/95 px-3 py-2 text-[10px] font-semibold text-[#f0dfb2] shadow-xl backdrop-blur-xl transition hover:border-[#ad8a4c] hover:bg-[#231b12]"
    @click="emit('open')"
  >
    ⚔ Бой
  </button>
</template>