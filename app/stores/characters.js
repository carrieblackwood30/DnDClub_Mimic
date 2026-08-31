import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref([])

  const loadCharacters = () => {
    if (!import.meta.client) {
      return
    }

    const savedCharacters =
      localStorage.getItem('characters')

    if (!savedCharacters) {
      return
    }

    try {
      characters.value = JSON.parse(savedCharacters)
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
      JSON.stringify(characters.value)
    )
  }

  const addCharacter = (character) => {
    characters.value.push(character)

    saveCharacters()
  }

  const getCharacterById = (id) => {
    return characters.value.find(
      character => character.id === id
    )
  }

  const removeCharacter = (id) => {
    characters.value = characters.value.filter(
      character => character.id !== id
    )

    saveCharacters()
  }

  loadCharacters()

  return {
    characters,

    loadCharacters,
    addCharacter,
    getCharacterById,
    removeCharacter
  }
})