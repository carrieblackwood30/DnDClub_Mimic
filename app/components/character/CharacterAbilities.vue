<script setup>
const characterCreator = useCharacterCreatorStore()

const {
  abilityScoreIncrease,
  abilityScores,
  abilityModifiers
} = useCharacterStats()

const decreaseAbility = (ability) => {
  const currentValue = characterCreator.abilityScores[ability]

  characterCreator.setAbilityScore(
    ability,
    currentValue - 1
  )
}

const increaseAbility = (ability) => {
  const currentValue = characterCreator.abilityScores[ability]

  characterCreator.setAbilityScore(
    ability,
    currentValue + 1
  )
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <div
      v-for="(value, ability) in abilityScores"
      :key="ability"
      class="border rounded-lg p-4"
    >
      <p class="font-semibold uppercase">
        {{ ability }}
      </p>

      <div class="flex items-center gap-3 mt-3">
        <button
          type="button"
          class="w-8 h-8 border rounded"
          @click="decreaseAbility(ability)"
        >
          -
        </button>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            База
          </p>

          <p class="text-xl font-bold">
            {{ characterCreator.abilityScores[ability] }}
          </p>
        </div>

        <button
          type="button"
          class="w-8 h-8 border rounded"
          @click="increaseAbility(ability)"
        >
          +
        </button>
      </div>

      <div class="mt-3">
        <p class="text-sm text-gray-500">
          Расовый бонус:
          {{ abilityScoreIncrease[ability] >= 0 ? '+' : '' }}{{ abilityScoreIncrease[ability] }}
        </p>

        <p class="text-sm">
          Итог:
          <strong>{{ value }}</strong>
        </p>

        <p class="text-sm">
          Модификатор:
          <strong>{{ abilityModifiers[ability] >= 0 ? '+' : '' }}{{ abilityModifiers[ability] }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>