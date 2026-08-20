<script setup>
const {
  spellcasting,
  spellcastingAbility,
  spellcastingAbilityModifier,
  spellAttackBonus,
  spellSaveDC
} = useCharacterSpellcasting()

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Заклинания
    </h2>

    <div
      v-if="!spellcasting"
      class="mt-4 text-sm text-gray-500"
    >
      Этот класс не использует заклинания.
    </div>

    <div
      v-else
      class="mt-4 space-y-3"
    >
      <div>
        <p class="text-sm text-gray-500">
          Характеристика заклинаний
        </p>

        <p class="font-semibold">
          {{ spellcastingAbility }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Модификатор характеристики
        </p>

        <p class="text-xl font-bold">
          {{ formatModifier(
            spellcastingAbilityModifier
          ) }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Бонус атаки заклинанием
        </p>

        <p class="text-xl font-bold">
          {{ formatModifier(spellAttackBonus) }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Сл спасброска заклинаний
        </p>

        <p class="text-xl font-bold">
          {{ spellSaveDC }}
        </p>
      </div>
    </div>
  </div>
</template>