<script setup>
const props = defineProps({
  character: {
    type: Object,
    required: true
  },

  armorClass: {
    type: Number,
    required: true
  },

  maxHitPoints: {
    type: Number,
    required: true
  },

  abilityModifiers: {
    type: Object,
    required: true
  },

  proficiencyBonus: {
    type: Number,
    required: true
  }
})

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Основные характеристики
    </h2>

    <!-- AC + HP -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-500">
          Класс доспеха
        </p>

        <p class="text-2xl font-bold">
          {{ armorClass }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Максимум HP
        </p>

        <p class="text-2xl font-bold">
          {{ maxHitPoints }}
        </p>
      </div>
    </div>

    <!-- Ability Scores -->
    <div class="mt-4 grid grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-gray-500">
          Сила
        </p>

        <p>
          {{ character.abilityScores.strength }}
          ({{
            formatModifier(
              abilityModifiers.strength
            )
          }})
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Ловкость
        </p>

        <p>
          {{ character.abilityScores.dexterity }}
          ({{
            formatModifier(
              abilityModifiers.dexterity
            )
          }})
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Телосложение
        </p>

        <p>
          {{ character.abilityScores.constitution }}
          ({{
            formatModifier(
              abilityModifiers.constitution
            )
          }})
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Интеллект
        </p>

        <p>
          {{ character.abilityScores.intelligence }}
          ({{
            formatModifier(
              abilityModifiers.intelligence
            )
          }})
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Мудрость
        </p>

        <p>
          {{ character.abilityScores.wisdom }}
          ({{
            formatModifier(
              abilityModifiers.wisdom
            )
          }})
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Харизма
        </p>

        <p>
          {{ character.abilityScores.charisma }}
          ({{
            formatModifier(
              abilityModifiers.charisma
            )
          }})
        </p>
      </div>
    </div>

    <!-- Proficiency -->
    <p class="mt-4">
      Бонус владения:

      <strong>
        {{ formatModifier(proficiencyBonus) }}
      </strong>
    </p>
  </div>
</template>