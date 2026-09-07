<script setup>
import {
  onMounted,
  computed
} from 'vue'

import SavedCharacterOverview
  from '~/components/character/saved/SavedCharacterOverview.vue'

import SavedCharacterAbilityChecks
  from '~/components/character/saved/SavedCharacterAbilityChecks.vue'

import SavedCharacterSavingThrows
  from '~/components/character/saved/SavedCharacterSavingThrows.vue'

import SavedCharacterIdentity
  from '~/components/character/saved/SavedCharacterIdentity.vue'

import SavedCharacterEquipment
  from '~/components/character/saved/SavedCharacterEquipment.vue'

import SavedCharacterAttacks
  from '~/components/character/saved/SavedCharacterAttacks.vue'

import SavedCharacterSkills
  from '~/components/character/saved/SavedCharacterSkills.vue'

const route = useRoute()

const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.loadCharacters()
})

const character = computed(() => {
  return charactersStore.getCharacterById(
    route.params.id
  )
})

/*
|--------------------------------------------------------------------------
| Данные персонажа
|--------------------------------------------------------------------------
*/

const {
  race,
  subrace,
  characterClass,
  subclass,
  armor,
  shield,
  weapon,
  selectedSkills
} = useSavedCharacterData(character)

/*
|--------------------------------------------------------------------------
| HP
|--------------------------------------------------------------------------
*/

const {
  maxHitPoints
} = useSavedCharacterHP(
  character,
  characterClass
)

/*
|--------------------------------------------------------------------------
| AC
|--------------------------------------------------------------------------
*/

const {
  armorClass
} = useSavedCharacterAC(
  character,
  armor,
  shield
)

/*
|--------------------------------------------------------------------------
| Основные характеристики
|--------------------------------------------------------------------------
*/

const {
  abilityModifiers,
  proficiencyBonus
} = useSavedCharacterStats(character)
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">

    <!-- ========================================================= -->
    <!-- ПЕРСОНАЖ НЕ НАЙДЕН -->
    <!-- ========================================================= -->

    <div
      v-if="!character"
      class="text-gray-500"
    >
      Персонаж не найден.
    </div>

    <!-- ========================================================= -->
    <!-- ПЕРСОНАЖ -->
    <!-- ========================================================= -->

    <div v-else>

      <!-- ======================================================= -->
      <!-- ИМЯ И УРОВЕНЬ -->
      <!-- ======================================================= -->

      <h1 class="text-3xl font-bold">
        {{ character.name || 'Без имени' }}
      </h1>

      <p class="mt-2">
        Уровень:
        {{ character.level }}
      </p>

      <!-- ======================================================= -->
      <!-- ОСНОВНЫЕ ХАРАКТЕРИСТИКИ -->
      <!-- ======================================================= -->

      <SavedCharacterOverview
        :character="character"
        :armor-class="armorClass"
        :max-hit-points="maxHitPoints"
        :ability-modifiers="abilityModifiers"
        :proficiency-bonus="proficiencyBonus"
      />

      <!-- ======================================================= -->
      <!-- ПРОВЕРКИ ХАРАКТЕРИСТИК -->
      <!-- ======================================================= -->

      <SavedCharacterAbilityChecks
        :character="character"
        :character-class="characterClass"
      />

      <!-- ======================================================= -->
      <!-- СПАСБРОСКИ -->
      <!-- ======================================================= -->

      <SavedCharacterSavingThrows
        :character="character"
        :character-class="characterClass"
      />

      <!-- ======================================================= -->
      <!-- ВЫБОР ПЕРСОНАЖА -->
      <!-- ======================================================= -->

      <SavedCharacterIdentity
        :race="race"
        :subrace="subrace"
        :character-class="characterClass"
        :subclass="subclass"
      />

      <!-- ======================================================= -->
      <!-- ЭКИПИРОВКА -->
      <!-- ======================================================= -->

      <SavedCharacterEquipment
        :armor="armor"
        :shield="shield"
        :weapon="weapon"
      />

      <!-- ======================================================= -->
      <!-- АТАКИ -->
      <!-- ======================================================= -->

      <SavedCharacterAttacks
        :character="character"
        :weapon="weapon"
        :character-class="characterClass"
      />

      <!-- ======================================================= -->
      <!-- НАВЫКИ -->
      <!-- ======================================================= -->

      <SavedCharacterSkills
        :character="character"
        :selected-skills="selectedSkills"
      />

      <!-- ======================================================= -->
      <!-- НАЗАД -->
      <!-- ======================================================= -->

      <div class="mt-6">
        <NuxtLink
          to="/characters"
          class="border rounded px-4 py-2"
        >
          ← Назад к персонажам
        </NuxtLink>
      </div>

    </div>
  </div>
</template>