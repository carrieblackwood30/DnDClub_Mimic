<script setup>
const characterCreator = useCharacterCreatorStore()

const {
  maxHitPoints
} = useCharacterHP()

const {
  armorClass
} = useCharacterAC()

const {
  hasArmor,
  hasShield,
  armorNonProficiency,
  shieldNonProficiency
} = useCharacterEquipment()

const {
  getAbilityCheckModifier,
  hasAbilityCheckDisadvantage,
  hasSavingThrowDisadvantage
} = useCharacterChecks()

const {
  getSavingThrowModifier
} = useCharacterSaves()

const abilities = [
  { id: 'strength', name: 'Сила' },
  { id: 'dexterity', name: 'Ловкость' },
  { id: 'constitution', name: 'Телосложение' },
  { id: 'intelligence', name: 'Интеллект' },
  { id: 'wisdom', name: 'Мудрость' },
  { id: 'charisma', name: 'Харизма' }
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
      Производные характеристики
    </h2>

    <div class="mt-4">
      <p class="text-sm text-gray-500">
        Уровень
      </p>

      <p class="text-2xl font-bold">
        {{ characterCreator.level }}
      </p>
    </div>

    <div class="mt-4">
      <p class="text-sm text-gray-500">
        Максимальное HP
      </p>

      <p class="text-2xl font-bold">
        {{ maxHitPoints }}
      </p>
    </div>

    <div class="mt-4">
      <p class="text-sm text-gray-500">
        Класс защиты (AC)
      </p>

      <p class="text-2xl font-bold">
        {{ armorClass }}
      </p>
    </div>

    <div class="mt-6">
      <p class="text-sm text-gray-500">
        Экипировка
      </p>

      <div class="mt-2 space-y-1">
        <p
          v-if="!hasArmor"
          class="text-sm"
        >
          Броня не надета
        </p>

        <p
          v-else-if="armorNonProficiency"
          class="text-sm"
        >
          ⚠ Нет владения бронёй
        </p>

        <p
          v-else
          class="text-sm"
        >
          ✓ Есть владение бронёй
        </p>

        <p
          v-if="!hasShield"
          class="text-sm"
        >
          Щит не используется
        </p>

        <p
          v-else-if="shieldNonProficiency"
          class="text-sm"
        >
          ⚠ Нет владения щитом
        </p>

        <p
          v-else
          class="text-sm"
        >
          ✓ Есть владение щитом
        </p>
      </div>
    </div>

    <div class="mt-6">
      <p class="text-sm text-gray-500">
        Проверки и спасброски
      </p>

      <div class="mt-2 space-y-2">
        <div
          v-for="ability in abilities"
          :key="ability.id"
          class="border rounded p-2"
        >
          <p class="font-semibold">
            {{ ability.name }}
          </p>

          <p class="text-sm">
            Проверка:

            <strong>
              {{ formatModifier(
                getAbilityCheckModifier(ability.id)
              ) }}
            </strong>

            <span
              v-if="hasAbilityCheckDisadvantage(ability.id)"
              class="ml-1"
            >
              ⚠ Помеха
            </span>
          </p>

          <p class="text-sm">
            Спасбросок:

            <strong>
              {{ formatModifier(
                getSavingThrowModifier(ability.id)
              ) }}
            </strong>

            <span
              v-if="hasSavingThrowDisadvantage(ability.id)"
              class="ml-1"
            >
              ⚠ Помеха
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>