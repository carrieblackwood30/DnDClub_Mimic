<script setup>
const characterCreator = useCharacterCreatorStore()

const {
  weapon,
  hasWeapon,
  hasWeaponProficiency,
  attackAbility,
  attackModifier,
  damageModifier
} = useCharacterWeapon()

import { weapons } from '~/data/weapons'

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}

const selectWeapon = (id) => {
  characterCreator.setWeapon(id)
}

const setWeaponAbility = (ability) => {
  characterCreator.setWeaponAbility(ability)
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Оружие
    </h2>

    <!-- Выбор оружия -->
    <div class="mt-4">
      <label class="block mb-2 text-sm">
        Выберите оружие
      </label>

      <select
        :value="characterCreator.weaponId"
        class="border rounded px-3 py-2"
        @change="selectWeapon($event.target.value)"
      >
        <option value="">
          Не выбрано
        </option>

        <option
          v-for="item in weapons"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Оружие не выбрано -->
    <div
      v-if="!hasWeapon"
      class="mt-4 text-sm text-gray-500"
    >
      Оружие не выбрано.
    </div>

    <!-- Информация об оружии -->
    <div
      v-else
      class="mt-4 space-y-2"
    >
      <p>
        <strong>
          {{ weapon.name }}
        </strong>
      </p>

      <p class="text-sm">
        Урон:
        {{ weapon.damage }}
        {{ weapon.damageType }}
      </p>

      <!-- Характеристика -->
      <p class="text-sm">
        Характеристика:
        <strong>
          {{ attackAbility }}
        </strong>
      </p>

      <!-- Выбор характеристики для finesse -->
      <div
        v-if="weapon.properties?.includes('finesse')"
        class="mt-3"
      >
        <p class="text-sm text-gray-500">
          Характеристика атаки
        </p>

        <div class="mt-2 flex gap-2">
          <button
            type="button"
            class="border rounded px-3 py-2"
            :class="{
              'bg-gray-100 border-gray-400':
                attackAbility === 'strength'
            }"
            @click="setWeaponAbility('strength')"
          >
            Сила
          </button>

          <button
            type="button"
            class="border rounded px-3 py-2"
            :class="{
              'bg-gray-100 border-gray-400':
                attackAbility === 'dexterity'
            }"
            @click="setWeaponAbility('dexterity')"
          >
            Ловкость
          </button>
        </div>
      </div>

      <!-- Владение -->
      <p class="text-sm">
        Владение:

        <span v-if="hasWeaponProficiency">
          ✓ Есть
        </span>

        <span v-else>
          ⚠ Нет
        </span>
      </p>

      <!-- Бонус атаки -->
      <p class="text-sm">
        Бонус атаки:
        <strong>
          {{ formatModifier(attackModifier) }}
        </strong>
      </p>

      <!-- Бонус урона -->
      <p class="text-sm">
        Бонус урона:
        <strong>
          {{ formatModifier(damageModifier) }}
        </strong>
      </p>

      <!-- Свойства -->
      <div
        v-if="weapon.properties?.length"
        class="mt-3"
      >
        <p class="text-sm text-gray-500">
          Свойства:
        </p>

        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="property in weapon.properties"
            :key="property"
            class="text-xs border rounded px-2 py-1"
          >
            {{ property }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>