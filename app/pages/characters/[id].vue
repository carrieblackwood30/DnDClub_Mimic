<script setup>
import {
  onMounted,
  computed,
  watch
} from 'vue'

import SavedCharacterProgression
  from '~/components/character/saved/SavedCharacterProgression.vue'

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

import CombatMovement
  from '~/components/combat/CombatMovement.vue'

import CombatSpellcasting
  from '~/components/combat/CombatSpellcasting.vue'

import CombatIncomingAttack
  from '~/components/combat/CombatIncomingAttack.vue'

const route = useRoute()

const charactersStore =
  useCharactersStore()

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
} = useSavedCharacterData(
  character
)

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
} = useSavedCharacterStats(
  character
)

const {
  addCharacter
} = useCombat()

const pageTitle = computed(() => {
  return (
    character.value?.name ||
    'Без имени'
  )
})

const classTitle = computed(() => {
  return (
    characterClass.value?.name ||
    'Класс не выбран'
  )
})

const levelTitle = computed(() => {
  return Number(
    character.value?.level ?? 1
  )
})

const hasSpellcasting =
  computed(() => {
    return Boolean(
      character.value?.spellcasting ??
      character.value?.knownSpellIds?.length ??
      character.value?.preparedSpellIds?.length ??
      character.value?.spellbookSpellIds?.length ??
      character.value?.knownCantripIds?.length
    )
  })

const characterSummary =
  computed(() => {
    const parts = []

    if (
      race.value?.name
    ) {
      parts.push(
        race.value.name
      )
    }

    if (
      subrace.value?.name
    ) {
      parts.push(
        subrace.value.name
      )
    }

    if (
      characterClass.value?.name
    ) {
      parts.push(
        characterClass.value.name
      )
    }

    return parts.join(' · ')
  })

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

onMounted(() => {
  charactersStore.loadCharacters()
})
</script>

<template>
  <div
    class="min-h-screen overflow-x-clip bg-[#080604] text-[#dfd0b4]"
  >
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(54,77,42,0.20),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(104,73,36,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(61,39,20,0.18),transparent_38%)]"
    />

    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-20 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_24px,rgba(136,99,54,0.035)_25px,transparent_26px)]"
    />

    <header
      class="sticky top-0 z-50 border-b border-[#4a3520] bg-[#100b07]/95 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <div
          class="flex min-w-0 items-center gap-3"
        >
          <div
            class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#80603a] bg-[radial-gradient(circle,#382716,#130c07)] text-xl text-[#d7b26d] shadow-[inset_0_1px_rgba(255,255,255,0.06),0_5px_18px_rgba(0,0,0,0.3)]"
          >
            ✦
          </div>

          <div class="min-w-0">
            <div
              class="text-[9px] font-black uppercase tracking-[0.24em] text-[#8e6b3d]"
            >
              КНИГА ГЕРОЯ
            </div>

            <h1
              class="truncate font-serif text-xl font-black text-[#e9dcc2] sm:text-2xl"
            >
              {{ pageTitle }}
            </h1>

            <p
              class="truncate text-xs text-[#78664f]"
            >
              {{ characterSummary || 'Персонаж' }}
              · Уровень {{ levelTitle }}
            </p>
          </div>
        </div>

        <div
          class="flex shrink-0 items-center gap-2"
        >
          <NuxtLink
            to="/characters"
            class="hidden min-h-11 items-center gap-2 rounded-xl border border-[#5b4328] bg-[#171008] px-4 text-sm font-black text-[#b99663] transition hover:border-[#8a6738] hover:bg-[#24170c] hover:text-[#e3c17f] sm:inline-flex"
          >
            ← Персонажи
          </NuxtLink>

          <NuxtLink
            to="/battlefield"
            class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#a8783f] bg-[linear-gradient(180deg,#8a5c2d,#573617)] px-4 text-sm font-black text-[#f1d49a] shadow-[0_8px_22px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 sm:px-5"
          >
            <span>
              ⚔
            </span>

            <span>
              Battlefield
            </span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main
      v-if="!character"
      class="relative z-10 mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:px-8"
    >
      <section
        class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
      >
        <div
          class="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] text-3xl text-[#c99b50]"
        >
          ?
        </div>

        <div
          class="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8e6b3d]"
        >
          Книга пуста
        </div>

        <h2
          class="mt-2 font-serif text-3xl font-black text-[#e2d0ad]"
        >
          Персонаж не найден
        </h2>

        <p
          class="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#78664e]"
        >
          Этот персонаж больше не существует
          или ещё не был загружен из сохранения.
        </p>

        <NuxtLink
          to="/characters"
          class="mt-7 inline-flex min-h-12 items-center rounded-xl border border-[#8a6738] bg-[#6f4925] px-6 text-sm font-black text-[#eed39b] transition hover:brightness-110"
        >
          Вернуться к героям
        </NuxtLink>
      </section>
    </main>

    <main
      v-else
      class="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <section
        class="mb-6 rounded-2xl border border-[#4d3822] bg-[radial-gradient(circle_at_50%_0%,rgba(113,81,41,0.15),transparent_38%),linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-7"
      >
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div
              class="text-[10px] font-black uppercase tracking-[0.24em] text-[#8e6b3d]"
            >
              Лист персонажа
            </div>

            <h2
              class="mt-1 font-serif text-3xl font-black text-[#ead9b8] sm:text-4xl"
            >
              {{ pageTitle }}
            </h2>

            <p
              class="mt-2 text-sm font-semibold text-[#a38a68] sm:text-base"
            >
              {{ classTitle }}

              <span
                class="mx-1 text-[#614628]"
              >
                ·
              </span>

              {{ levelTitle }} уровень

              <span
                v-if="subclass?.name"
                class="mx-1 text-[#614628]"
              >
                ·
              </span>

              <span
                v-if="subclass?.name"
              >
                {{ subclass.name }}
              </span>
            </p>
          </div>

          <div
            class="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            <div
              class="rounded-xl border border-[#44311f] bg-[#100a06]/65 px-4 py-3"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.14em] text-[#705b42]"
              >
                Уровень
              </div>

              <div
                class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
              >
                {{ levelTitle }}
              </div>
            </div>

            <div
              class="rounded-xl border border-[#44311f] bg-[#100a06]/65 px-4 py-3"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.14em] text-[#705b42]"
              >
                КД
              </div>

              <div
                class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
              >
                {{ armorClass }}
              </div>
            </div>

            <div
              class="rounded-xl border border-[#44311f] bg-[#100a06]/65 px-4 py-3"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.14em] text-[#705b42]"
              >
                HP
              </div>

              <div
                class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
              >
                {{ maxHitPoints }}
              </div>
            </div>

            <div
              class="rounded-xl border border-[#44311f] bg-[#100a06]/65 px-4 py-3"
            >
              <div
                class="text-[9px] font-black uppercase tracking-[0.14em] text-[#705b42]"
              >
                Бонус
              </div>

              <div
                class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
              >
                +{{ proficiencyBonus }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        class="grid gap-6"
      >
        <section
          id="progression"
          class="scroll-mt-28"
        >
          <SavedCharacterProgression
            :character="character"
            :character-class="characterClass"
          />
        </section>

        <section
          id="overview"
          class="scroll-mt-28"
        >
          <SavedCharacterOverview
            :character="character"
            :armor-class="armorClass"
            :max-hit-points="maxHitPoints"
            :ability-modifiers="abilityModifiers"
            :proficiency-bonus="proficiencyBonus"
          />
        </section>

        <section
          id="abilities"
          class="scroll-mt-28"
        >
          <SavedCharacterAbilityChecks
            :character="character"
            :character-class="characterClass"
          />
        </section>

        <section
          id="saving-throws"
          class="scroll-mt-28"
        >
          <SavedCharacterSavingThrows
            :character="character"
            :character-class="characterClass"
          />
        </section>

        <section
          id="identity"
          class="scroll-mt-28"
        >
          <SavedCharacterIdentity
            :race="race"
            :subrace="subrace"
            :character-class="characterClass"
            :subclass="subclass"
          />
        </section>

        <section
          id="equipment"
          class="scroll-mt-28"
        >
          <SavedCharacterEquipment
            :armor="armor"
            :shield="shield"
            :weapon="weapon"
          />
        </section>

        <section
          id="attacks"
          class="scroll-mt-28"
        >
          <SavedCharacterAttacks
            :character="character"
            :weapon="weapon"
            :character-class="characterClass"
          />
        </section>

        <section
          v-if="hasSpellcasting"
          id="spells"
          class="scroll-mt-28"
        >
          <div
            class="mb-4 flex items-center gap-3"
          >
            <div
              class="h-px flex-1 bg-[#392819]"
            />

            <span
              class="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
            >
              Магия
            </span>

            <div
              class="h-px flex-1 bg-[#392819]"
            />
          </div>

          <CombatSpellcasting
            :character-id="character.id"
          />
        </section>

        <section
          id="skills"
          class="scroll-mt-28"
        >
          <SavedCharacterSkills
            :character="character"
            :selected-skills="selectedSkills"
          />
        </section>

        <section
          id="combat"
          class="scroll-mt-28 rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] text-lg text-[#d5ae68]"
            >
              ⚔
            </div>

            <div>
              <div
                class="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Боевая книга
              </div>

              <h2
                class="mt-1 font-serif text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Бой
              </h2>
            </div>
          </div>

          <div class="mt-6 grid gap-5">
            <CombatInitiative />

            <CombatActions
              :character-id="character.id"
            />

            <CombatMovement
              :character-id="character.id"
            />

            <CombatSpellcasting
              :character-id="character.id"
            />

            <CombatIncomingAttack />
          </div>
        </section>
      </div>

      <div
        class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <NuxtLink
          to="/characters"
          class="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#5b4328] bg-[#171008] px-5 text-sm font-black text-[#b99663] transition hover:border-[#8a6738] hover:bg-[#24170c] hover:text-[#e3c17f]"
        >
          ← Назад к персонажам
        </NuxtLink>

        <NuxtLink
          to="/battlefield"
          class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#a8783f] bg-[linear-gradient(180deg,#8a5c2d,#573617)] px-6 text-sm font-black text-[#f1d49a] shadow-[0_8px_22px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <span>
            ⚔
          </span>

          Перейти на Battlefield
        </NuxtLink>
      </div>
    </main>
  </div>
</template>