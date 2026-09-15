import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { spells } from '~/data/spells'

export const useSpellsStore = defineStore('spells', () => {
  const knownSpellIds = ref([])

  const knownSpells = computed(() => {
    return spells.filter(
      spell => knownSpellIds.value.includes(spell.id)
    )
  })

  const getSpellById = (id) => {
    return spells.find(
      spell => spell.id === id
    ) ?? null
  }

  const learnSpell = (spellId) => {
    if (knownSpellIds.value.includes(spellId)) {
      return
    }

    const spell = getSpellById(spellId)

    if (!spell) {
      return
    }

    knownSpellIds.value.push(spellId)
  }

  const forgetSpell = (spellId) => {
    knownSpellIds.value =
      knownSpellIds.value.filter(
        id => id !== spellId
      )
  }

  const hasSpell = (spellId) => {
    return knownSpellIds.value.includes(spellId)
  }

  return {
    knownSpellIds,
    knownSpells,
    getSpellById,
    learnSpell,
    forgetSpell,
    hasSpell
  }
})