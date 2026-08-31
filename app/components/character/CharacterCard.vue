<script setup>
const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const character = props.character

const {
  race,
  subrace,
  characterClass,
  subclass
} = useSavedCharacter(character)

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <!-- Имя -->
    <h2 class="text-xl font-bold">
      {{ character.name || 'Без имени' }}
    </h2>

    <!-- Класс и уровень -->
    <p class="mt-2">
      {{ characterClass?.name ?? 'Класс не выбран' }}
      ·
      {{ character.level }} уровень
    </p>

    <!-- Раса -->
    <p class="mt-1 text-sm text-gray-600">
      {{ race?.name ?? 'Раса не выбрана' }}

      <span v-if="subrace">
        — {{ subrace.name }}
      </span>
    </p>

    <!-- Основные характеристики -->
    <div class="mt-4 grid grid-cols-3 gap-2">
      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Сила
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.strength }}
        </p>
      </div>

      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Ловкость
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.dexterity }}
        </p>
      </div>

      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Телосложение
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.constitution }}
        </p>
      </div>

      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Интеллект
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.intelligence }}
        </p>
      </div>

      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Мудрость
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.wisdom }}
        </p>
      </div>

      <div class="border rounded p-2">
        <p class="text-xs text-gray-500">
          Харизма
        </p>

        <p class="font-semibold">
          {{ character.abilityScores.charisma }}
        </p>
      </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="mt-4 space-y-1 text-sm">
      <p>
        Подкласс:
        <strong>
          {{ subclass?.name ?? 'Не выбран' }}
        </strong>
      </p>

      <p>
        Оружие:
        <strong>
          {{ character.weaponId ?? 'Не выбрано' }}
        </strong>
      </p>

      <p>
        Навыков:
        <strong>
          {{ character.selectedSkills.length }}
        </strong>
      </p>
    </div>

    <!-- Кнопка -->
    <div class="mt-4">
      <NuxtLink
        :to="`/characters/${character.id}`"
        class="inline-block border rounded px-4 py-2"
      >
        Открыть персонажа
      </NuxtLink>
    </div>
  </div>
</template>