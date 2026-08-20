<script setup>
const {
  availableSkills,
  maxSelectedSkills,
  selectedSkillsCount,
  canSelectMoreSkills,
  isSkillSelected,
  toggleSkill,
  getSkillModifier
} = useCharacterSkills()

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        Навыки
      </h2>

      <p class="text-sm text-gray-500">
        Выбрано:
        {{ selectedSkillsCount }} / {{ maxSelectedSkills }}
      </p>
    </div>

    <div
      v-if="availableSkills.length === 0"
      class="mt-4 text-sm text-gray-500"
    >
      Сначала выберите класс.
    </div>

    <div
      v-else
      class="mt-4 space-y-2"
    >
      <button
        v-for="skill in availableSkills"
        :key="skill.id"
        type="button"
        class="w-full border rounded-lg p-3 text-left"
        :class="{
          'bg-gray-100 border-gray-400': isSkillSelected(skill.id),
          'opacity-50 cursor-not-allowed':
            !isSkillSelected(skill.id) &&
            !canSelectMoreSkills
        }"
        :disabled="
          !isSkillSelected(skill.id) &&
          !canSelectMoreSkills
        "
        @click="toggleSkill(skill.id)"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">
              {{ skill.name }}
            </p>

            <p class="text-xs text-gray-500">
              {{ skill.ability }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <strong>
              {{ formatModifier(
                getSkillModifier(skill)
              ) }}
            </strong>

            <span v-if="isSkillSelected(skill.id)">
              ✓
            </span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>