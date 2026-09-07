<script setup>
const props = defineProps({
  character: {
    type: Object,
    required: true
  },

  selectedSkills: {
    type: Array,
    default: () => []
  }
})

const {
  getSkillModifier
} = useSavedCharacterStats(
  toRef(props, 'character')
)

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Навыки
    </h2>

    <div
      v-if="selectedSkills.length === 0"
      class="mt-2 text-gray-500"
    >
      Навыки не выбраны.
    </div>

    <div
      v-else
      class="mt-2 space-y-2"
    >
      <div
        v-for="skill in selectedSkills"
        :key="skill.id"
        class="flex items-center justify-between border rounded px-3 py-2"
      >
        <span>
          {{ skill.name }}
        </span>

        <strong>
          {{
            formatModifier(
              getSkillModifier(skill)
            )
          }}
        </strong>
      </div>
    </div>
  </div>
</template>