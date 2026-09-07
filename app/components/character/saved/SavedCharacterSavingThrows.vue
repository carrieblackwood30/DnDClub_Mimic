<script setup>
import { ref, toRef } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },

  characterClass: {
    type: Object,
    default: null
  }
})

const characterRef = toRef(props, 'character')
const characterClassRef = toRef(props, 'characterClass')

const {
  savingThrows
} = useSavedCharacterSaves(
  characterRef,
  characterClassRef
)

const {
  rollSavingThrow
} = useSavedCharacterChecks(
  characterRef,
  characterClassRef
)

const lastSavingThrow = ref(null)

const abilities = [
  {
    id: 'strength',
    name: 'Сила'
  },
  {
    id: 'dexterity',
    name: 'Ловкость'
  },
  {
    id: 'constitution',
    name: 'Телосложение'
  },
  {
    id: 'intelligence',
    name: 'Интеллект'
  },
  {
    id: 'wisdom',
    name: 'Мудрость'
  },
  {
    id: 'charisma',
    name: 'Харизма'
  }
]

const getAbilityName = (abilityId) => {
  return (
    abilities.find(
      ability => ability.id === abilityId
    )?.name ?? abilityId
  )
}

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}

const rollSave = (ability) => {
  const result = rollSavingThrow(ability)

  lastSavingThrow.value = {
    ability,
    ...result
  }
}
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Спасброски
    </h2>

    <div class="mt-4 space-y-2">
      <div
        v-for="save in savingThrows"
        :key="save.ability"
        class="flex items-center justify-between border rounded-lg px-3 py-2"
      >
        <div>
          <div class="flex items-center gap-2">
            <span class="font-semibold">
              {{ getAbilityName(save.ability) }}
            </span>

            <span
              v-if="save.isProficient"
              class="text-sm"
              title="Владение"
            >
              ✓
            </span>
          </div>

          <p class="text-sm text-gray-500">
            Модификатор:
            {{ formatModifier(save.modifier) }}
          </p>
        </div>

        <button
          type="button"
          class="border rounded px-3 py-1"
          @click="rollSave(save.ability)"
        >
          Бросить d20
        </button>
      </div>
    </div>

    <div
      v-if="lastSavingThrow"
      class="mt-4 border-t pt-4"
    >
      <p class="font-semibold">
        Последний спасбросок:
        {{ getAbilityName(lastSavingThrow.ability) }}
      </p>

      <p class="mt-2">
        Бросок:
        <strong>
          {{ lastSavingThrow.roll }}
        </strong>
      </p>

      <p>
        Модификатор:
        <strong>
          {{ formatModifier(lastSavingThrow.modifier) }}
        </strong>
      </p>

      <p>
        Итог:
        <strong>
          {{ lastSavingThrow.total }}
        </strong>
      </p>

      <p
        v-if="lastSavingThrow.rolls.length > 1"
        class="text-sm text-gray-500"
      >
        Броски:
        {{ lastSavingThrow.rolls.join(', ') }}
      </p>

      <p
        v-if="lastSavingThrow.mode === 'advantage'"
        class="mt-1"
      >
        ✓ Преимущество
      </p>

      <p
        v-if="lastSavingThrow.mode === 'disadvantage'"
        class="mt-1"
      >
        ⚠ Помеха
      </p>
    </div>
  </div>
</template>