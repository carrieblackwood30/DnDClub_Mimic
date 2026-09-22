<script setup>
import {
  onMounted,
  computed,
  watch
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

import CombatInitiative
  from '~/components/combat/CombatInitiative.vue'

import CombatActions
  from '~/components/combat/CombatActions.vue'

import CombatSpellcasting
  from '~/components/combat/CombatSpellcasting.vue'

import CombatIncomingAttack
  from '~/components/combat/CombatIncomingAttack.vue'

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

const {
  maxHitPoints
} = useSavedCharacterHP(
  character,
  characterClass
)

const {
  armorClass
} = useSavedCharacterAC(
  character,
  armor,
  shield
)

const {
  abilityModifiers,
  proficiencyBonus
} = useSavedCharacterStats(character)

const {
  addCharacter
} = useCombat()

watch(
  character,
  value => {
    if (!value) {
      return
    }

    addCharacter(
      value,
      armorClass.value,
      maxHitPoints.value
    )
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <div
      v-if="!character"
      class="text-gray-500"
    >
      Персонаж не найден.
    </div>

    <div v-else>
      <div class="mb-6">
        <h1 class="text-3xl font-bold">
          {{ character.name || 'Без имени' }}
        </h1>

        <p class="mt-1 text-gray-500">
          {{ characterClass?.name || 'Класс не выбран' }}
          · Уровень {{ character.level }}
        </p>
      </div>

      <div class="grid gap-6">
        <SavedCharacterOverview
          :character="character"
          :armor-class="armorClass"
          :max-hit-points="maxHitPoints"
          :ability-modifiers="abilityModifiers"
          :proficiency-bonus="proficiencyBonus"
        />

        <SavedCharacterAbilityChecks
          :character="character"
          :character-class="characterClass"
        />

        <SavedCharacterSavingThrows
          :character="character"
          :character-class="characterClass"
        />

        <SavedCharacterIdentity
          :race="race"
          :subrace="subrace"
          :character-class="characterClass"
          :subclass="subclass"
        />

        <SavedCharacterEquipment
          :armor="armor"
          :shield="shield"
          :weapon="weapon"
        />

        <SavedCharacterAttacks
          :character="character"
          :weapon="weapon"
          :character-class="characterClass"
        />

        <section class="border rounded-xl p-4">
          <h2 class="text-xl font-bold">
            Бой
          </h2>

          <div class="mt-4 grid gap-4">
            <CombatInitiative />

            <CombatActions />

            <CombatSpellcasting />

            <CombatIncomingAttack />
          </div>
        </section>

        <SavedCharacterSkills
          :character="character"
          :selected-skills="selectedSkills"
        />
      </div>

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