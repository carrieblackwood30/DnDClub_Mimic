<script setup>
const characterCreator = useCharacterCreatorStore()
const armorsStore = useArmorsStore()
const shieldsStore = useShieldsStore()

const {
  hasArmorProficiency
} = useCharacterArmor()

const {
  meetsStrengthRequirement
} = useCharacterAC()

const {
  hasShieldProficiency
} = useCharacterShield()

const selectArmor = (armorId) => {
  characterCreator.setArmor(armorId)
}

const selectShield = (shieldId) => {
  characterCreator.setShield(shieldId)
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      Экипировка
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Без брони -->
      <button
        type="button"
        class="border rounded-lg p-4 text-left hover:bg-gray-100"
        :class="{
          'border-black bg-gray-100':
            characterCreator.armorId === null
        }"
        @click="selectArmor(null)"
      >
        <h3 class="text-lg font-semibold">
          Без брони
        </h3>

        <p class="text-sm text-gray-500 mt-2">
          AC: 10 + DEX
        </p>
      </button>

      <!-- Броня -->
      <button
        v-for="armor in armorsStore.allArmors"
        :key="armor.id"
        type="button"
        class="border rounded-lg p-4 text-left hover:bg-gray-100"
        :class="{
          'border-black bg-gray-100':
            characterCreator.armorId === armor.id
        }"
        @click="selectArmor(armor.id)"
      >
        <h3 class="text-lg font-semibold">
          {{ armor.name }}
        </h3>

        <p class="text-sm text-gray-500 mt-2">
          Базовый AC: {{ armor.baseAC }}
        </p>

        <p class="text-sm text-gray-500">
          Тип: {{ armor.type }}
        </p>

        <p
          v-if="characterCreator.armorId === armor.id"
          class="text-sm mt-2"
        >
          <span v-if="hasArmorProficiency">
            ✓ Есть владение
          </span>

          <span v-else>
            ⚠ Нет владения
          </span>
        </p>

        <p
          v-if="armor.strengthRequirement > 0"
          class="text-sm mt-2"
        >
          Требуется Сила:
          <strong>{{ armor.strengthRequirement }}</strong>
        </p>

        <p
          v-if="
            characterCreator.armorId === armor.id &&
            armor.strengthRequirement > 0 &&
            !meetsStrengthRequirement
          "
          class="text-sm mt-1"
        >
          ⚠ Недостаточно Силы
        </p>
      </button>
    </div>

    <div class="mt-10">
  <h2 class="text-2xl font-bold mb-4">
    Щит
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Без щита -->
    <button
      type="button"
      class="border rounded-lg p-4 text-left hover:bg-gray-100"
      :class="{
        'border-black bg-gray-100':
          characterCreator.shieldId === null
      }"
      @click="selectShield(null)"
    >
      <h3 class="text-lg font-semibold">
        Без щита
      </h3>

      <p class="text-sm text-gray-500 mt-2">
        Бонус к AC: +0
      </p>
    </button>

    <!-- Щиты -->
    <button
      v-for="shield in shieldsStore.allShields"
      :key="shield.id"
      type="button"
      class="border rounded-lg p-4 text-left hover:bg-gray-100"
      :class="{
        'border-black bg-gray-100':
          characterCreator.shieldId === shield.id
      }"
      @click="selectShield(shield.id)"
    >
        <h3 class="text-lg font-semibold">
          {{ shield.name }}
        </h3>

        <p class="text-sm text-gray-500 mt-2">
          Бонус к AC: +{{ shield.armorBonus }}
        </p>

        <p
          v-if="characterCreator.shieldId === shield.id"
          class="text-sm mt-2"
        >
          <span v-if="hasShieldProficiency">
            ✓ Есть владение
          </span>

          <span v-else>
            ⚠ Нет владения
          </span>
        </p>
      </button>
    </div>
  </div>
  </div>
</template>