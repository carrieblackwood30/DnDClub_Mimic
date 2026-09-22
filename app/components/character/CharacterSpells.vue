<script setup>
import { computed } from 'vue'

import { useCharacterSpellcasting } from '~/composables/useCharacterSpellcasting'

const {
  canCastSpells,
  spellcasting,
  availableCantrips,
  availableLevelledSpells,
  cantripsKnownLimit,
  spellsKnownLimit,
  preparedSpellLimit,
  spellbookLimit,
  knownCantrips,
  knownSpells,
  spellbookSpells,
  preparedSpells,
  canLearnCantrip,
  canLearnSpell,
  canPrepareSpell,
  learnCantrip,
  learnSpell,
  forgetCantrip,
  forgetSpell,
  prepareSpell,
  unprepareSpell
} = useCharacterSpellcasting()

const isWizard = computed(() => {
  return spellcasting.value?.spellbook?.enabled === true
})

const isKnownCaster = computed(() => {
  return spellcasting.value?.type === 'known' ||
    spellcasting.value?.type === 'pact'
})

const isPreparedCaster = computed(() => {
  return spellcasting.value?.type === 'prepared'
})

const hasCantrips = computed(() => {
  return cantripsKnownLimit.value > 0
})

const hasLevelledSpells = computed(() => {
  return availableLevelledSpells.value.length > 0
})

const cantripCount = computed(() => {
  return knownCantrips.value.length
})

const knownSpellCount = computed(() => {
  return knownSpells.value.length
})

const spellbookCount = computed(() => {
  return spellbookSpells.value.length
})

const preparedSpellCount = computed(() => {
  return preparedSpells.value.filter(
    spell => spell.level > 0
  ).length
})

const toggleCantrip = (spell) => {
  if (knownCantrips.value.some(
    item => item.id === spell.id
  )) {
    forgetCantrip(spell)
    return
  }

  learnCantrip(spell)
}

const toggleKnownSpell = (spell) => {
  if (knownSpells.value.some(
    item => item.id === spell.id
  )) {
    forgetSpell(spell)
    return
  }

  learnSpell(spell)
}

const toggleSpellbookSpell = (spell) => {
  if (spellbookSpells.value.some(
    item => item.id === spell.id
  )) {
    forgetSpell(spell)
    return
  }

  learnSpell(spell)
}

const togglePreparedSpell = (spell) => {
  if (preparedSpells.value.some(
    item => item.id === spell.id
  )) {
    unprepareSpell(spell)
    return
  }

  prepareSpell(spell)
}

const isCantripSelected = (spellId) => {
  return knownCantrips.value.some(
    spell => spell.id === spellId
  )
}

const isKnownSpellSelected = (spellId) => {
  return knownSpells.value.some(
    spell => spell.id === spellId
  )
}

const isSpellbookSelected = (spellId) => {
  return spellbookSpells.value.some(
    spell => spell.id === spellId
  )
}

const isPreparedSelected = (spellId) => {
  return preparedSpells.value.some(
    spell => spell.id === spellId
  )
}

const canSelectCantrip = (spell) => {
  if (isCantripSelected(spell.id)) {
    return true
  }

  return canLearnCantrip(spell)
}

const canSelectKnownSpell = (spell) => {
  if (isKnownSpellSelected(spell.id)) {
    return true
  }

  return canLearnSpell(spell)
}

const canSelectSpellbookSpell = (spell) => {
  if (isSpellbookSelected(spell.id)) {
    return true
  }

  return canLearnSpell(spell)
}

const canSelectPreparedSpell = (spell) => {
  if (isPreparedSelected(spell.id)) {
    return true
  }

  return canPrepareSpell(spell)
}
</script>

<template>
  <section
    v-if="canCastSpells"
    class="space-y-8"
  >
    <div v-if="hasCantrips">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Заговоры
        </h2>

        <p class="text-sm opacity-70">
          Выбрано:
          {{ cantripCount }}
          /
          {{ cantripsKnownLimit }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in availableCantrips"
          :key="spell.id"
          type="button"
          :disabled="!canSelectCantrip(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500':
              isCantripSelected(spell.id),
            'opacity-50 cursor-not-allowed':
              !canSelectCantrip(spell)
          }"
          @click="toggleCantrip(spell)"
        >
          <div class="font-medium">
            {{ spell.name }}
          </div>

          <div class="mt-1 text-sm opacity-70">
            {{ spell.school }}
          </div>

          <div class="mt-1 text-xs opacity-60">
            {{ spell.castingTime }} · {{ spell.range }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="isWizard">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Заклинания в книге
        </h2>

        <p class="text-sm opacity-70">
          Выбрано:
          {{ spellbookCount }}
          /
          {{ spellbookLimit }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in availableLevelledSpells"
          :key="spell.id"
          type="button"
          :disabled="!canSelectSpellbookSpell(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500':
              isSpellbookSelected(spell.id),
            'opacity-50 cursor-not-allowed':
              !canSelectSpellbookSpell(spell)
          }"
          @click="toggleSpellbookSpell(spell)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="font-medium">
              {{ spell.name }}
            </div>

            <div class="text-sm opacity-70">
              {{ spell.level }} уровень
            </div>
          </div>

          <div class="mt-1 text-sm opacity-70">
            {{ spell.school }}
          </div>

          <div class="mt-1 text-xs opacity-60">
            {{ spell.castingTime }} · {{ spell.range }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="isWizard">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Подготовленные заклинания
        </h2>

        <p class="text-sm opacity-70">
          Выбрано:
          {{ preparedSpellCount }}
          /
          {{ preparedSpellLimit }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in spellbookSpells"
          :key="spell.id"
          type="button"
          :disabled="!canSelectPreparedSpell(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500':
              isPreparedSelected(spell.id),
            'opacity-50 cursor-not-allowed':
              !canSelectPreparedSpell(spell)
          }"
          @click="togglePreparedSpell(spell)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="font-medium">
              {{ spell.name }}
            </div>

            <div class="text-sm opacity-70">
              {{ spell.level }} уровень
            </div>
          </div>

          <div class="mt-1 text-sm opacity-70">
            {{ spell.school }}
          </div>

          <div class="mt-1 text-xs opacity-60">
            {{ spell.castingTime }} · {{ spell.range }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="isKnownCaster && hasLevelledSpells">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Известные заклинания
        </h2>

        <p class="text-sm opacity-70">
          Выбрано:
          {{ knownSpellCount }}
          /
          {{ spellsKnownLimit }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in availableLevelledSpells"
          :key="spell.id"
          type="button"
          :disabled="!canSelectKnownSpell(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500':
              isKnownSpellSelected(spell.id),
            'opacity-50 cursor-not-allowed':
              !canSelectKnownSpell(spell)
          }"
          @click="toggleKnownSpell(spell)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="font-medium">
              {{ spell.name }}
            </div>

            <div class="text-sm opacity-70">
              {{ spell.level }} уровень
            </div>
          </div>

          <div class="mt-1 text-sm opacity-70">
            {{ spell.school }}
          </div>

          <div class="mt-1 text-xs opacity-60">
            {{ spell.castingTime }} · {{ spell.range }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="isPreparedCaster && !isWizard && hasLevelledSpells">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Подготовленные заклинания
        </h2>

        <p class="text-sm opacity-70">
          Выбрано:
          {{ preparedSpellCount }}
          /
          {{ preparedSpellLimit }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in availableLevelledSpells"
          :key="spell.id"
          type="button"
          :disabled="!canSelectPreparedSpell(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500':
              isPreparedSelected(spell.id),
            'opacity-50 cursor-not-allowed':
              !canSelectPreparedSpell(spell)
          }"
          @click="togglePreparedSpell(spell)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="font-medium">
              {{ spell.name }}
            </div>

            <div class="text-sm opacity-70">
              {{ spell.level }} уровень
            </div>
          </div>

          <div class="mt-1 text-sm opacity-70">
            {{ spell.school }}
          </div>

          <div class="mt-1 text-xs opacity-60">
            {{ spell.castingTime }} · {{ spell.range }}
          </div>
        </button>
      </div>
    </div>
  </section>
</template>