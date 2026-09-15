<script setup>
import { computed } from 'vue'
import { spells } from '~/data/spells'

const characterCreator = useCharacterCreatorStore()

const reactionSpells = computed(() => {
  return spells.filter(spell =>
    spell.castingTime === 'reaction' &&
    spell.reactionTrigger
  )
})

const isSelected = (spellId) => {
  return characterCreator.knownSpellIds.includes(spellId)
}

const toggleSpell = (spellId) => {
  if (isSelected(spellId)) {
    characterCreator.forgetSpell(spellId)
    return
  }

  characterCreator.learnSpell(spellId)
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Реакции
    </h2>

    <div class="mt-4 space-y-3">
      <div
        v-if="reactionSpells.length === 0"
        class="border rounded-lg p-3"
      >
        Реакций пока нет.
      </div>

      <button
        v-for="spell in reactionSpells"
        :key="spell.id"
        type="button"
        class="w-full border rounded-lg p-3 text-left"
        :class="
          isSelected(spell.id)
            ? 'border-blue-500'
            : 'border-gray-300'
        "
        @click="toggleSpell(spell.id)"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold">
            {{ spell.name }}
          </span>

          <span>
            {{ isSelected(spell.id) ? '✓' : '○' }}
          </span>
        </div>

        <div class="mt-1 text-sm">
          Заклинание {{ spell.level }} уровня
        </div>

        <div class="text-sm">
          Время накладывания: {{ spell.castingTime }}
        </div>
      </button>
    </div>
  </div>
</template>