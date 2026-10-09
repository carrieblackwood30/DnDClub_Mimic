import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  EXPERIENCE_THRESHOLDS
} from '~/data/levelProgression'

const normalizeCharacter = character => {
  const level = Math.min(
    20,
    Math.max(
      1,
      Number(character?.level ?? 1)
    )
  )

  const fallbackXP =
    EXPERIENCE_THRESHOLDS[level] ??
    EXPERIENCE_THRESHOLDS[1]

  return {
    ...character,

    level,

    experiencePoints:
      Number.isFinite(
        Number(character?.experiencePoints)
      )
        ? Number(character.experiencePoints)
        : fallbackXP,

    hitPointRolls: {
      ...(character?.hitPointRolls ?? {})
    },

    feats: [
      ...(character?.feats ?? [])
    ],

    levelHistory: [
      ...(character?.levelHistory ?? [])
    ],

    selectedSkills: [
      ...(character?.selectedSkills ?? [])
    ],

    spellbookSpellIds: [
      ...(character?.spellbookSpellIds ?? [])
    ],

    knownSpellIds: [
      ...(character?.knownSpellIds ?? [])
    ],

    preparedSpellIds: [
      ...(character?.preparedSpellIds ?? [])
    ],

    knownCantripIds: [
      ...(character?.knownCantripIds ?? [])
    ],

    spellSlots: [
      ...(character?.spellSlots ?? [])
    ]
  }
}

export const useCharactersStore = defineStore(
  'characters',
  () => {
    const characters = ref([])

    const loadCharacters = () => {
      if (!import.meta.client) {
        return
      }

      const savedCharacters =
        localStorage.getItem(
          'characters'
        )

      if (!savedCharacters) {
        return
      }

      try {
        const parsed =
          JSON.parse(
            savedCharacters
          )

        characters.value =
          Array.isArray(parsed)
            ? parsed.map(
                normalizeCharacter
              )
            : []
      } catch (error) {
        console.error(
          'Ошибка загрузки персонажей:',
          error
        )
      }
    }

    const saveCharacters = () => {
      if (!import.meta.client) {
        return
      }

      localStorage.setItem(
        'characters',
        JSON.stringify(
          characters.value
        )
      )
    }

    const addCharacter = character => {
      const normalized =
        normalizeCharacter(
          character
        )

      characters.value.push(
        normalized
      )

      saveCharacters()

      return normalized
    }

    const updateCharacter = (
      id,
      patch
    ) => {
      const index =
        characters.value.findIndex(
          character =>
            character.id === id
        )

      if (index === -1) {
        return null
      }

      characters.value[index] =
        normalizeCharacter({
          ...characters.value[index],
          ...patch
        })

      saveCharacters()

      return characters.value[index]
    }

    const getCharacterById = id => {
      return characters.value.find(
        character =>
          character.id === id
      )
    }

    const removeCharacter = id => {
      characters.value =
        characters.value.filter(
          character =>
            character.id !== id
        )

      saveCharacters()
    }

    loadCharacters()

    return {
      characters,

      loadCharacters,
      addCharacter,
      updateCharacter,
      getCharacterById,
      removeCharacter
    }
  }
)