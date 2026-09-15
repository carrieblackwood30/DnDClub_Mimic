<script setup>
import { computed } from 'vue'
import { spells } from '~/data/spells'
import { useCharacterSpellcasting } from '~/composables/useCharacterSpellcasting'

const {
  canCastSpells,
  spellcastingAbility,
  spellcastingAbilityModifier,
  spellSaveDC,
  spellAttackBonus,
  spellSlots,
  highestSpellSlotLevel,
  preparedSpellLimit,
  spellbookSpells,
  preparedSpells,
  preparedCantrips,
  preparedLevelledSpells,
  isSpellInSpellbook,
  isSpellPrepared,
  canLearnSpell,
  canPrepareSpell,
  learnSpell,
  forgetSpell,
  prepareSpell,
  unprepareSpell
} = useCharacterSpellcasting()

const cantrips = computed(() => {
  return spells.filter(spell => spell.level === 0)
})

const levelledSpells = computed(() => {
  return spells.filter(spell => spell.level > 0)
})

const formatModifier = (value) => {
  if (value >= 0) {
    return `+${value}`
  }

  return `${value}`
}

const spellLevelName = (level) => {
  if (level === 0) {
    return 'Заговор'
  }

  return `${level} уровень`
}

const isSpellInBook = (spell) => {
  return isSpellInSpellbook(spell.id)
}

const isPrepared = (spell) => {
  return isSpellPrepared(spell.id)
}

const handleLearn = (spell) => {
  learnSpell(spell)
}

const handleForget = (spell) => {
  forgetSpell(spell)
}

const handlePrepare = (spell) => {
  prepareSpell(spell)
}

const handleUnprepare = (spell) => {
  unprepareSpell(spell)
}
</script>

<template>
  <section
    v-if="canCastSpells"
    class="space-y-6"
  >
    <div class="rounded-lg border p-4">
      <h2 class="text-xl font-bold">
        Заклинания
      </h2>

      <div class="mt-3 grid gap-2">
        <div>
          Характеристика:
          <strong>{{ spellcastingAbility }}</strong>
        </div>

        <div>
          Модификатор:
          <strong>
            {{ formatModifier(spellcastingAbilityModifier) }}
          </strong>
        </div>

        <div>
          СЛ спасброска:
          <strong>{{ spellSaveDC }}</strong>
        </div>

        <div>
          Бонус атаки заклинанием:
          <strong>
            {{ formatModifier(spellAttackBonus) }}
          </strong>
        </div>
      </div>
    </div>

    <div class="rounded-lg border p-4">
      <h2 class="text-xl font-bold">
        Ячейки заклинаний
      </h2>

      <div class="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
        <div
          v-for="(slots, index) in spellSlots"
          :key="index"
          v-show="slots > 0"
          class="rounded border p-3 text-center"
        >
          <div class="font-semibold">
            {{ index + 1 }} уровень
          </div>

          <div class="mt-1 text-2xl font-bold">
            {{ slots }}
          </div>

          <div class="text-sm">
            доступно
          </div>
        </div>
      </div>

      <div class="mt-3 text-sm">
        Максимальный уровень ячейки:
        <strong>{{ highestSpellSlotLevel }}</strong>
      </div>
    </div>

    <div
      v-if="preparedSpellLimit !== null"
      class="rounded-lg border p-4"
    >
      <h2 class="text-xl font-bold">
        Подготовленные заклинания
      </h2>

      <div class="mt-2">
        Подготовлено:
        <strong>{{ preparedLevelledSpells.length }}</strong>
        /
        <strong>{{ preparedSpellLimit }}</strong>
      </div>

      <div class="mt-4">
        <h3 class="font-semibold">
          Заговоры
        </h3>

        <div
          v-if="preparedCantrips.length"
          class="mt-2 space-y-2"
        >
          <div
            v-for="spell in preparedCantrips"
            :key="spell.id"
            class="flex items-center justify-between rounded border p-3"
          >
            <div>
              <div class="font-semibold">
                {{ spell.name }}
              </div>

              <div class="text-sm">
                {{ spellLevelName(spell.level) }}
              </div>
            </div>

            <button
              type="button"
              class="rounded border px-3 py-1"
              @click="handleUnprepare(spell)"
            >
              Убрать
            </button>
          </div>
        </div>

        <div
          v-else
          class="mt-2 text-sm"
        >
          Нет подготовленных заговоров
        </div>
      </div>

      <div class="mt-6">
        <h3 class="font-semibold">
          Заклинания
        </h3>

        <div
          v-if="preparedLevelledSpells.length"
          class="mt-2 space-y-2"
        >
          <div
            v-for="spell in preparedLevelledSpells"
            :key="spell.id"
            class="flex items-center justify-between rounded border p-3"
          >
            <div>
              <div class="font-semibold">
                {{ spell.name }}
              </div>

              <div class="text-sm">
                {{ spellLevelName(spell.level) }}
              </div>
            </div>

            <button
              type="button"
              class="rounded border px-3 py-1"
              @click="handleUnprepare(spell)"
            >
              Убрать
            </button>
          </div>
        </div>

        <div
          v-else
          class="mt-2 text-sm"
        >
          Нет подготовленных заклинаний
        </div>
      </div>
    </div>

    <div class="rounded-lg border p-4">
      <h2 class="text-xl font-bold">
        Книга заклинаний
      </h2>

      <div class="mt-4 space-y-3">
        <div
          v-for="spell in [...cantrips, ...levelledSpells]"
          :key="spell.id"
          class="rounded border p-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-semibold">
                {{ spell.name }}
              </div>

              <div class="text-sm">
                {{ spellLevelName(spell.level) }}
              </div>
            </div>

            <div class="flex gap-2">
              <button
                v-if="!isSpellInBook(spell)"
                type="button"
                class="rounded border px-3 py-1"
                :disabled="!canLearnSpell(spell)"
                @click="handleLearn(spell)"
              >
                Изучить
              </button>

              <button
                v-else
                type="button"
                class="rounded border px-3 py-1"
                @click="handleForget(spell)"
              >
                Забыть
              </button>
            </div>
          </div>

          <div
            v-if="isSpellInBook(spell)"
            class="mt-3 flex items-center justify-between"
          >
            <span class="text-sm">
              <span v-if="isPrepared(spell)">
                Подготовлено
              </span>

              <span v-else>
                Не подготовлено
              </span>
            </span>

            <div>
              <button
                v-if="!isPrepared(spell)"
                type="button"
                class="rounded border px-3 py-1"
                :disabled="!canPrepareSpell(spell)"
                @click="handlePrepare(spell)"
              >
                Подготовить
              </button>

              <button
                v-else
                type="button"
                class="rounded border px-3 py-1"
                @click="handleUnprepare(spell)"
              >
                Снять подготовку
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section
    v-else
    class="rounded-lg border p-4"
  >
    <div>
      Этот класс не имеет заклинаний.
    </div>
  </section>
</template>