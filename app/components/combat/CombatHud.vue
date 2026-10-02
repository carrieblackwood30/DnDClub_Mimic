<script setup>
import { computed } from 'vue'

const props = defineProps({
  participant: {
    type: Object,
    default: null
  },
  movementUsed: {
    type: Number,
    default: 0
  },
  movementAllowance: {
    type: Number,
    default: 0
  },
  events: {
    type: Array,
    default: () => []
  }
})

const recentEvents = computed(() => {
  return props.events
    .filter(event => event.participantId === props.participant?.id)
    .slice(-3)
    .reverse()
})

const effects = computed(() => {
  const participant = props.participant

  if (!participant) {
    return []
  }

  const result = []

  if (
    participant.sleepState?.stage ===
    'incapacitated'
  ) {
    result.push({
      id: 'sleep',
      icon: '💤',
      label: 'Сон',
      detail: 'Недееспособен'
    })
  }

  if (
    participant.sleepState?.stage ===
    'unconscious'
  ) {
    result.push({
      id: 'unconscious',
      icon: '💤',
      label: 'Сон',
      detail: 'Бессознателен'
    })
  }

  return result
})

const hp = computed(() => {
  return Math.max(
    0,
    Number(
      props.participant?.currentHP ??
      props.participant?.hp ??
      0
    )
  )
})

const maxHp = computed(() => {
  return Math.max(
    1,
    Number(
      props.participant?.maxHP ??
      props.participant?.maxHp ??
      1
    )
  )
})

const hpPercent = computed(() => {
  return Math.max(
    0,
    Math.min(
      100,
      (hp.value / maxHp.value) * 100
    )
  )
})

const actionAvailable = computed(() => {
  return !props.participant?.actionUsed
})

const bonusActionAvailable = computed(() => {
  return !props.participant?.bonusActionUsed
})

const reactionAvailable = computed(() => {
  return !props.participant?.reactionUsed
})

const getEventIcon = event => {
  if (event.type === 'sleep') {
    return '💤'
  }

  if (event.type === 'success') {
    return '✓'
  }

  if (event.type === 'failure') {
    return '✕'
  }

  if (event.type === 'damage') {
    return '⚔'
  }

  if (event.type === 'roll') {
    return '🎲'
  }

  if (event.type === 'condition') {
    return '◈'
  }

  return '◆'
}

const getEventClass = event => {
  if (event.type === 'success') {
    return 'text-emerald-300'
  }

  if (event.type === 'failure') {
    return 'text-red-300'
  }

  if (event.type === 'sleep') {
    return 'text-violet-300'
  }

  if (event.type === 'damage') {
    return 'text-orange-300'
  }

  return 'text-[#d5c39a]'
}
</script>

<template>
  <div
    v-if="participant"
    class="pointer-events-none fixed bottom-4 left-1/2 z-[45] w-[min(620px,calc(100vw-32px))] -translate-x-1/2"
  >
    <div
      class="rounded-2xl border border-[#665437] bg-[#120f0c]/94 px-4 py-3 text-[#eee3cd] shadow-2xl backdrop-blur-xl"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#75613e] bg-[#211a12] text-sm font-bold"
        >
          {{ participant.type === 'enemy' ? '☠' : '✦' }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <div class="truncate text-sm font-semibold text-[#f1e5cf]">
              {{ participant.name }}
            </div>

            <div class="text-[9px] uppercase tracking-[0.14em] text-[#9f8c6a]">
              Ур. {{ participant.level ?? 1 }}
            </div>
          </div>

          <div class="mt-1 flex items-center gap-3 text-[10px] text-[#aa9c84]">
            <span>
              HP {{ hp }} / {{ maxHp }}
            </span>

            <span>
              AC {{ participant.armorClass ?? participant.ac ?? 10 }}
            </span>

            <span>
              {{ movementUsed }} / {{ movementAllowance }} ft
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1.5">
          <span
            class="rounded-md border px-2 py-1 text-[9px] font-semibold"
            :class="
              actionAvailable
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-red-500/20 text-red-300/60'
            "
          >
            A
          </span>

          <span
            class="rounded-md border px-2 py-1 text-[9px] font-semibold"
            :class="
              bonusActionAvailable
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-red-500/20 text-red-300/60'
            "
          >
            B
          </span>

          <span
            class="rounded-md border px-2 py-1 text-[9px] font-semibold"
            :class="
              reactionAvailable
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-red-500/20 text-red-300/60'
            "
          >
            R
          </span>
        </div>
      </div>

      <div
        class="mt-2 h-1 overflow-hidden rounded-full bg-black/50"
      >
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{ width: `${hpPercent}%` }"
        />
      </div>

      <div
        v-if="recentEvents.length"
        class="mt-2 border-t border-white/5 pt-2"
      >
        <div
          v-for="event in recentEvents"
          :key="event.id"
          class="flex items-center gap-2 py-0.5 text-[10px]"
        >
          <span
            class="w-4 text-center"
            :class="getEventClass(event)"
          >
            {{ getEventIcon(event) }}
          </span>

          <span class="font-medium text-[#d8cbb5]">
            {{ event.message }}
          </span>

          <span
            v-if="event.detail"
            class="truncate text-[#8f826e]"
          >
            {{ event.detail }}
          </span>
        </div>
      </div>

      <div
        v-if="effects.length"
        class="mt-2 flex flex-wrap gap-1.5 border-t border-white/5 pt-2"
      >
        <div
          v-for="effect in effects"
          :key="effect.id"
          class="rounded-md border border-violet-400/25 bg-violet-400/5 px-2 py-1 text-[9px] text-violet-200"
        >
          {{ effect.icon }}
          {{ effect.label }}
          <span class="text-violet-300/60">
            · {{ effect.detail }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>