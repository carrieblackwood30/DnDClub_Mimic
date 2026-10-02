<script setup>
const props = defineProps({
  attackContext: {
    type: Object,
    default: null
  },
  attackResult: {
    type: Object,
    default: null
  },
  targetName: {
    type: String,
    default: '—'
  }
})

const emit = defineEmits([
  'attack'
])

const getAttackReasonLabel = reason => {
  const labels = {
    'participant-not-found': 'Участник не найден',
    'target-unconscious': 'Цель недееспособна',
    'attacker-unconscious': 'Атакующий недееспособен',
    'attacker-incapacitated': 'Атакующий недееспособен',
    'not-current-turn': 'Сейчас не ход этого участника',
    'attack-action-unavailable': 'Атака действием недоступна',
    'out-of-range': 'Цель вне дальности оружия',
    'out-of-reach': 'Цель вне досягаемости оружия',
    'weapon-unavailable': 'Оружие недоступно',
    'line-of-sight-blocked': 'Линия обзора заблокирована',
    'total-cover': 'Цель полностью укрыта'
  }

  return labels[reason] ?? 'Атака недоступна'
}
</script>

<template>
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
          {{ targetName }}
        </div>

        <div
          class="mt-1 truncate text-[10px] text-[#b7aa94]"
        >
          {{ attackContext.weaponName }}
          ·
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
        v-if="attackContext.advantageSources.length"
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
        v-if="attackContext.disadvantageSources.length"
        class="rounded-full border border-[#a76767] bg-[#351c1c] px-2.5 py-1 text-[9px] text-[#efc1c1]"
      >
        Помеха ·
        {{ attackContext.disadvantageSources.join(', ') }}
      </span>

      <span
        v-if="
          !attackContext.advantageSources.length &&
          !attackContext.disadvantageSources.length
        "
        class="rounded-full border border-[#4c4337] bg-[#15120f] px-2.5 py-1 text-[9px] text-[#c6b89f]"
      >
        Обычный бросок
      </span>
    </div>

    <div
      v-if="attackContext.notes.length"
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
      :class="
        attackContext.canAttack
          ? 'border-[#a8844d] bg-[#2e2416] text-[#f2d796] hover:bg-[#3a2d1b]'
          : 'cursor-not-allowed border-[#4b4034] bg-[#15120f] text-[#756b5c]'
      "
      :disabled="!attackContext.canAttack"
      @click="emit('attack')"
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
      :class="
        attackResult.success
          ? 'border-[#4f6e4a] bg-[#142016] text-[#d8ead3]'
          : 'border-[#704b46] bg-[#241514] text-[#ecc1bb]'
      "
    >
      <template v-if="attackResult.success">
        <div class="font-semibold">
          {{ attackResult.weapon?.name }}
          · d20
          {{ attackResult.rolls.join(' / ') }}
        </div>

        <div class="mt-1">
          {{ attackResult.total }}
          против AC {{ attackResult.targetAC }}
          ·

          <span
            :class="
              attackResult.hit
                ? 'text-[#b7dbab]'
                : 'text-[#dda19a]'
            "
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
    Выбери токен, затем цель на карте.
    Боевые действия появятся здесь.
  </div>
</template>