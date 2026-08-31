<script setup>
import { onMounted } from 'vue'

const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.loadCharacters()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold">
      Персонажи
    </h1>

    <div
      v-if="charactersStore.characters.length === 0"
      class="mt-8 text-gray-500"
    >
      Персонажей пока нет.
    </div>

    <div
      v-else
      class="mt-8 space-y-4"
    >
      <CharacterCard
        v-for="character in charactersStore.characters"
        :key="character.id"
        :character="character"
      />
    </div>
  </div>
</template>