<script setup>
import { computed } from 'vue'
import { useCharacterCreatorStore } from '~/stores/characterCreator'
import { useCharacterSpellcasting } from '~/composables/useCharacterSpellcasting'

const characterCreator = useCharacterCreatorStore()

const {
  canCastSpells,
  availableCantrips,
  availableLevelledSpells,
  cantripsKnownLimit,
  spellbookExpectedSpells,
  knownCantrips,
  spellbookSpells,
  canLearnCantrip,
  canLearnSpell,
  learnCantrip,
  learnSpell,
  forgetCantrip,
  forgetSpell
} = useCharacterSpellcasting()

const isWizard = computed(() => {
  return canCastSpells.value &&
    spellbookExpectedSpells.value > 0
})

const cantripCount = computed(() => {
  return knownCantrips.value.length
})

const spellbookCount = computed(() => {
  return spellbookSpells.value.length
})

const toggleCantrip = (spell) => {
  if (knownCantrips.value.some(item => item.id === spell.id)) {
    forgetCantrip(spell.id)
    return
  }

  learnCantrip(spell)
}

const toggleSpell = (spell) => {
  if (spellbookSpells.value.some(item => item.id === spell.id)) {
    forgetSpell(spell.id)
    return
  }

  learnSpell(spell)
}

const isCantripSelected = (spellId) => {
  return knownCantrips.value.some(
    spell => spell.id === spellId
  )
}

const isSpellSelected = (spellId) => {
  return spellbookSpells.value.some(
    spell => spell.id === spellId
  )
}

const canSelectCantrip = (spell) => {
  if (isCantripSelected(spell.id)) {
    return true
  }

  return canLearnCantrip(spell)
}

const canSelectSpell = (spell) => {
  if (isSpellSelected(spell.id)) {
    return true
  }

  return canLearnSpell(spell)
}
</script>

<template>
  <section v-if="isWizard" class="space-y-8">
    <div>
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Заговоры
        </h2>

        <p class="text-sm opacity-70">
          Выбрано: {{ cantripCount }} / {{ cantripsKnownLimit }}
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
            'border-green-500': isCantripSelected(spell.id),
            'opacity-50 cursor-not-allowed': !canSelectCantrip(spell)
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

    <div>
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Заклинания в книге
        </h2>

        <p class="text-sm opacity-70">
          Выбрано: {{ spellbookCount }} / {{ spellbookExpectedSpells }}
        </p>
      </div>

      <div class="grid gap-3">
        <button
          v-for="spell in availableLevelledSpells"
          :key="spell.id"
          type="button"
          :disabled="!canSelectSpell(spell)"
          class="rounded-lg border p-4 text-left transition"
          :class="{
            'border-green-500': isSpellSelected(spell.id),
            'opacity-50 cursor-not-allowed': !canSelectSpell(spell)
          }"
          @click="toggleSpell(spell)"
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