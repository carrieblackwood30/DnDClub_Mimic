<script setup>
defineProps({
  armor: {
    type: Object,
    default: null
  },

  shield: {
    type: Object,
    default: null
  },

  weapon: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Экипировка
    </h2>

    <p class="mt-2">
      Броня:
      {{ armor?.name ?? 'Не выбрана' }}
    </p>

    <p>
      Щит:
      {{ shield?.name ?? 'Не используется' }}
    </p>

    <p>
      Оружие:
      {{ weapon?.name ?? 'Не выбрано' }}
    </p>
  </div>
</template>