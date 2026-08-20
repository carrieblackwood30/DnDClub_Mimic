<script setup>
import {
  weaponAbilityNames,
  weaponDamageTypeNames,
  weaponPropertyNames,
  weaponTypeNames
} from '~/data/weaponTranslations'

const {
  attack,
  hasWeapon
} = useCharacterAttacks()

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}

const getAbilityName = (ability) => {
  return weaponAbilityNames[ability] ?? ability
}

const getDamageTypeName = (damageType) => {
  return weaponDamageTypeNames[damageType] ?? damageType
}

const getPropertyName = (property) => {
  return weaponPropertyNames[property] ?? property
}

const getWeaponTypeName = (type) => {
  return weaponTypeNames[type] ?? type
}

const getWeaponRange = (weapon) => {
  if (!weapon.range) {
    return null
  }

  return {
    normal: `${weapon.range.normal} футов`,
    long: `${weapon.range.long} футов`
  }
}
</script>

<template>
  <div class="border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Атаки
    </h2>

    <div
      v-if="!hasWeapon"
      class="mt-4 text-sm text-gray-500"
    >
      Оружие не выбрано.
    </div>

    <div
      v-else
      class="mt-4 border rounded-lg p-3"
    >
      <!-- Название -->
      <h3 class="text-lg font-semibold">
        {{ attack.weapon.name }}
      </h3>

      <p class="mt-1 text-sm text-gray-500">
        Тип:
    {{ getWeaponTypeName(attack.weapon.type) }}
    </p>
    
    <div
      v-if="attack.weapon.range"
      class="mt-1 text-sm text-gray-500"
    >
      <p>
        Дистанция:
        {{ getWeaponRange(attack.weapon).normal }}
      </p>

      <p>
        Дальняя дистанция:
        {{ getWeaponRange(attack.weapon).long }}
      </p>
    </div>

      <!-- Бонус атаки -->
      <p class="mt-2 text-sm">
        Бонус атаки:
        <strong>
          {{ formatModifier(attack.attackModifier) }}
        </strong>
      </p>

      <!-- Урон -->
      <p class="mt-2 text-sm">
        Урон:
        <strong>
          {{ attack.weapon.damage }}
          {{ formatModifier(attack.damageModifier) }}
        </strong>

        {{ getDamageTypeName(attack.weapon.damageType) }}
      </p>

      <!-- Характеристика -->
      <p class="mt-2 text-sm">
        Характеристика:
        <strong>
          {{ getAbilityName(attack.attackAbility) }}
        </strong>
      </p>

      <!-- Владение -->
      <p class="mt-2 text-sm">
        Владение:

        <span v-if="attack.hasProficiency">
          ✓ Есть
        </span>

        <span v-else>
          ⚠ Нет
        </span>
      </p>

      <!-- Свойства -->
      <div
        v-if="attack.weapon.properties?.length"
        class="mt-3"
      >
        <p class="text-sm text-gray-500">
          Свойства:
        </p>

        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="property in attack.weapon.properties"
            :key="property"
            class="text-xs border rounded px-2 py-1"
            >
            {{ getPropertyName(property) }}
            </span>
        </div>
      </div>
    </div>
  </div>
</template>