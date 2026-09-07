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
const characterClassRef = toRef(
  props,
  'characterClass'
)

const {
  getAbilityCheckModifier,
  rollAbilityCheck
} = useSavedCharacterChecks(
  characterRef,
  characterClassRef
)

const lastAbilityCheck = ref(null)

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

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}

const getAbilityName = (abilityId) => {
  return (
    abilities.find(
      ability => ability.id === abilityId
    )?.name ?? abilityId
  )
}

const rollAbility = (
  ability,
  mode = 'normal'
) => {
  const result = rollAbilityCheck(
    ability,
    mode === 'advantage'
      ? 'advantage'
      : mode === 'disadvantage'
        ? 'disadvantage'
        : 'normal'
  )

  lastAbilityCheck.value = {
    ability,
    ...result
  }
}
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Проверки характеристик
    </h2>

    <div class="mt-4 space-y-3">
      <div
        v-for="ability in abilities"
        :key="ability.id"
        class="border rounded-lg p-3"
      >
        <div
          class="flex items-center justify-between"
        >
          <div>
            <p class="font-semibold">
              {{ ability.name }}
            </p>

            <p class="text-sm text-gray-500">
              Модификатор:
              {{
                formatModifier(
                  getAbilityCheckModifier(
                    ability.id
                  )
                )
              }}
            </p>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="border rounded px-3 py-1"
            @click="
              rollAbility(
                ability.id,
                'normal'
              )
            "
          >
            Обычный
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            @click="
              rollAbility(
                ability.id,
                'advantage'
              )
            "
          >
            Преимущество
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            @click="
              rollAbility(
                ability.id,
                'disadvantage'
              )
            "
          >
            Помеха
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="lastAbilityCheck"
      class="mt-4 border-t pt-4"
    >
      <p class="font-semibold">
        Последняя проверка:
        {{ getAbilityName(
          lastAbilityCheck.ability
        ) }}
      </p>

      <p class="mt-2">
        Режим:

        <strong
          v-if="
            lastAbilityCheck.mode ===
            'advantage'
          "
        >
          Преимущество
        </strong>

        <strong
          v-else-if="
            lastAbilityCheck.mode ===
            'disadvantage'
          "
        >
          Помеха
        </strong>

        <strong v-else>
          Обычный
        </strong>
      </p>

      <p class="mt-1">
        Бросок:

        <strong>
          {{ lastAbilityCheck.roll }}
        </strong>
      </p>

      <p>
        Модификатор:

        <strong>
          {{
            formatModifier(
              lastAbilityCheck.modifier
            )
          }}
        </strong>
      </p>

      <p>
        Итог:

        <strong>
          {{ lastAbilityCheck.total }}
        </strong>
      </p>

      <p
        v-if="
          lastAbilityCheck.rolls.length > 1
        "
        class="text-sm text-gray-500"
      >
        Броски:

        {{ lastAbilityCheck.rolls.join(', ') }}
      </p>
    </div>
  </div>
</template>