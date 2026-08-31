<script setup>
import { onMounted, computed } from 'vue'

const route = useRoute()
const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.loadCharacters()
})

const character = computed(() => {
  return charactersStore.getCharacterById(route.params.id)
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <div
      v-if="!character"
      class="text-gray-500"
    >
      Персонаж не найден.
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold">
        {{ character.name || 'Без имени' }}
      </h1>

      <p class="mt-2">
        Уровень:
        {{ character.level }}
      </p>

      <div class="mt-6 border rounded-lg p-4">
        <h2 class="text-xl font-bold">
          Основные характеристики
        </h2>

        <div class="mt-4 grid grid-cols-3 gap-4">
          <div>
            Сила:
            <strong>
              {{ character.abilityScores.strength }}
            </strong>
          </div>

          <div>
            Ловкость:
            <strong>
              {{ character.abilityScores.dexterity }}
            </strong>
          </div>

          <div>
            Телосложение:
            <strong>
              {{ character.abilityScores.constitution }}
            </strong>
          </div>

          <div>
            Интеллект:
            <strong>
              {{ character.abilityScores.intelligence }}
            </strong>
          </div>

          <div>
            Мудрость:
            <strong>
              {{ character.abilityScores.wisdom }}
            </strong>
          </div>

          <div>
            Харизма:
            <strong>
              {{ character.abilityScores.charisma }}
            </strong>
          </div>
        </div>
      </div>

      <div class="mt-6 border rounded-lg p-4">
        <h2 class="text-xl font-bold">
          Выбор персонажа
        </h2>

        <p class="mt-2">
          Раса: {{ character.raceId }}
        </p>

        <p>
          Подраса: {{ character.subraceId }}
        </p>

        <p>
          Класс: {{ character.classId }}
        </p>

        <p>
          Подкласс:
          {{ character.subclassId ?? 'Не выбран' }}
        </p>
      </div>

      <div class="mt-6 border rounded-lg p-4">
        <h2 class="text-xl font-bold">
          Экипировка
        </h2>

        <p class="mt-2">
          Броня:
          {{ character.armorId ?? 'Не выбрана' }}
        </p>

        <p>
          Щит:
          {{ character.shieldId ?? 'Не используется' }}
        </p>

        <p>
          Оружие:
          {{ character.weaponId ?? 'Не выбрано' }}
        </p>
      </div>

      <div class="mt-6 border rounded-lg p-4">
        <h2 class="text-xl font-bold">
          Навыки
        </h2>

        <div
          v-if="character.selectedSkills.length === 0"
          class="mt-2 text-gray-500"
        >
          Навыки не выбраны.
        </div>

        <div
          v-else
          class="mt-2"
        >
          <span
            v-for="skill in character.selectedSkills"
            :key="skill"
            class="inline-block border rounded px-2 py-1 mr-2 mb-2"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink
          to="/characters"
          class="border rounded px-4 py-2"
        >
          ← Назад к персонажам
        </NuxtLink>
      </div>
    </div>
  </div>
</template>