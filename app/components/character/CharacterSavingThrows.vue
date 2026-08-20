<script setup>
const {
  getSavingThrowModifier
} = useCharacterChecks()

const {
  hasSavingThrowProficiency
} = useCharacterProficiency()

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
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Спасброски
    </h2>

    <div class="mt-4 space-y-2">
      <div
        v-for="ability in abilities"
        :key="ability.id"
        class="flex items-center justify-between border rounded p-2"
      >
        <div>
          <p class="font-semibold">
            {{ ability.name }}
          </p>

          <p class="text-xs text-gray-500">
            Спасбросок
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="hasSavingThrowProficiency(ability.id)"
            class="text-sm"
          >
            ✓ Владение
          </span>

          <strong>
            {{ formatModifier(
              getSavingThrowModifier(ability.id)
            ) }}
          </strong>
        </div>
      </div>
    </div>
  </div>
</template>