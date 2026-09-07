<script setup>
defineProps({
  race: {
    type: Object,
    default: null
  },

  subrace: {
    type: Object,
    default: null
  },

  characterClass: {
    type: Object,
    default: null
  },

  subclass: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Выбор персонажа
    </h2>

    <p class="mt-2">
      Раса:
      {{ race?.name ?? 'Не выбрана' }}
    </p>

    <p>
      Подраса:
      {{ subrace?.name ?? 'Не выбрана' }}
    </p>

    <p>
      Класс:
      {{ characterClass?.name ?? 'Не выбран' }}
    </p>

    <p>
      Подкласс:
      {{ subclass?.name ?? 'Не выбран' }}
    </p>
  </div>
</template>