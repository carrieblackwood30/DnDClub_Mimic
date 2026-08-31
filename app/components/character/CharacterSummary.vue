<script setup>
const characterCreator = useCharacterCreatorStore()

const {
  race,
  subrace
} = useCharacterRace()

const {
  characterClass,
  subclass
} = useCharacterClass()

const {
  maxHitPoints
} = useCharacterHP()

const {
  armorClass
} = useCharacterAC()

const {
  proficiencyBonus
} = useCharacterProficiency()

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Персонаж
    </h2>

    <!-- Имя -->
    <div class="mt-4">
      <p class="text-sm text-gray-500">
        Имя
      </p>

      <p class="text-xl font-bold">
        {{ characterCreator.name || 'Без имени' }}
      </p>
    </div>

    <!-- Основная информация -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-500">
          Уровень
        </p>

        <p class="font-semibold">
          {{ characterCreator.level }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Класс
        </p>

        <p class="font-semibold">
          {{ characterClass?.name ?? 'Не выбран' }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Подкласс
        </p>

        <p class="font-semibold">
          {{ subclass?.name ?? 'Не выбран' }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Раса
        </p>

        <p class="font-semibold">
          {{ race?.name ?? 'Не выбрана' }}
        </p>
      </div>

      <div>
        <p class="text-sm text-gray-500">
          Подраса
        </p>

        <p class="font-semibold">
          {{ subrace?.name ?? 'Не выбрана' }}
        </p>
      </div>
    </div>

    <!-- Производные характеристики -->
    <div class="mt-6 grid grid-cols-3 gap-4">
      <div class="border rounded p-3">
        <p class="text-sm text-gray-500">
          HP
        </p>

        <p class="text-2xl font-bold">
          {{ maxHitPoints }}
        </p>
      </div>

      <div class="border rounded p-3">
        <p class="text-sm text-gray-500">
          AC
        </p>

        <p class="text-2xl font-bold">
          {{ armorClass }}
        </p>
      </div>

      <div class="border rounded p-3">
        <p class="text-sm text-gray-500">
          Владение
        </p>

        <p class="text-2xl font-bold">
          {{ formatModifier(proficiencyBonus) }}
        </p>
      </div>
    </div>
  </div>
</template>