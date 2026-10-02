<script setup>

import { computed, ref } from 'vue'

import { useCombatStore } from '~/stores/combat'

import { useCombat } from '~/composables/useCombat'

import { useCombatSpellcasting } from '~/composables/useCombatSpellcasting'

import { useBattlefieldStore } from '~/stores/battlefield'

const props = defineProps({

  characterId: {

    type: String,

    required: true

  }

})

const combatStore = useCombatStore()

const battlefieldStore = useBattlefieldStore()

const {

  currentParticipant,

  getEffectiveArmorClass

} = useCombat()

const {

  getAvailableCantrips,

  getAvailableLevelledSpells,

  getKnownSpells,

  getPreparedSpells,

  getSpellbookSpells,

  getCurrentSpellSlotCount,

  getMaxSpellSlotCount,

  canCastSpell,

  castSpell,

  resolveSpell,

  getSpellAttackBonus,

  getSpellSaveDC

} = useCombatSpellcasting()

const selectedSpell = ref(null)

const selectedTargetId = ref(null)

const selectedSlotLevel = ref(null)

const resultMessage = ref('')

const attackResult = ref(null)

const isResolving = ref(false)

const participant = computed(() => {

  return combatStore.participants.find(

    item => item.characterId === props.characterId

  ) ?? null

})

const participantId = computed(() => {

  return participant.value?.id ?? null

})

const isCurrentTurn = computed(() => {

  if (!participant.value) {

    return false

  }

  return (

    currentParticipant.value?.id ===

    participant.value.id

  )

})

const casterToken = computed(() => {

  if (!participantId.value) {

    return null

  }

  return battlefieldStore.tokens.find(

    token =>

      token.combatParticipantId ===

      participantId.value

  ) ?? null

})

const cantrips = computed(() => {

  if (!participantId.value) {

    return []

  }

  return getAvailableCantrips(

    participantId.value

  )

})

const levelledSpells = computed(() => {

  if (!participantId.value) {

    return []

  }

  return getAvailableLevelledSpells(

    participantId.value

  )

})

const knownSpells = computed(() => {

  if (!participantId.value) {

    return []

  }

  return getKnownSpells(

    participantId.value

  )

})

const preparedSpells = computed(() => {

  if (!participantId.value) {

    return []

  }

  return getPreparedSpells(

    participantId.value

  )

})

const spellbookSpells = computed(() => {

  if (!participantId.value) {

    return []

  }

  return getSpellbookSpells(

    participantId.value

  )

})

const targets = computed(() => {

  if (!participantId.value) {

    return []

  }

  return combatStore.participants.filter(

    item =>

      item.id !== participantId.value &&

      item.currentHP > 0

  )

})

const selectedTargetToken = computed(() => {

  if (!selectedTargetId.value) {

    return null

  }

  return battlefieldStore.tokens.find(

    token =>

      token.combatParticipantId ===

      selectedTargetId.value

  ) ?? null

})

const selectedSpellAreaContext = computed(() => {

  const spell = selectedSpell.value

  if (

    !spell ||

    spell.target?.type !== 'creatures-in-area'

  ) {

    return null

  }

  if (

    !casterToken.value ||

    !selectedTargetToken.value

  ) {

    return null

  }

  const direction =

    battlefieldStore.getSpellAreaDirection(

      casterToken.value.id,

      selectedTargetToken.value.position

    )

  if (!direction) {

    return null

  }

  return battlefieldStore.getSpellAreaContext({

    casterTokenId:

      casterToken.value.id,

    direction,

    sizeFeet:

      spell.area?.size ?? 15

  })

})

const groupedSpells = computed(() => {

  const groups = {}

  for (const spell of levelledSpells.value) {

    if (!groups[spell.level]) {

      groups[spell.level] = []

    }

    groups[spell.level].push(spell)

  }

  return groups

})

const availableSlotLevels = computed(() => {

  const result = []

  if (!participantId.value) {

    return result

  }

  for (

    let level = 1;

    level <= 9;

    level += 1

  ) {

    const current =

      getCurrentSpellSlotCount(

        participantId.value,

        level

      )

    const maximum =

      getMaxSpellSlotCount(

        participantId.value,

        level

      )

    if (maximum > 0) {

      result.push({

        level,

        current,

        maximum

      })

    }

  }

  return result

})

const castableSlotLevels = computed(() => {

  if (

    !participantId.value ||

    !selectedSpell.value ||

    selectedSpell.value.level === 0

  ) {

    return []

  }

  return availableSlotLevels.value.filter(

    slot =>

      slot.level >= selectedSpell.value.level &&

      slot.current > 0

  )

})

const isSpellAvailable = spell => {

  if (!participantId.value) {

    return false

  }

  return canCastSpell(

    participantId.value,

    spell

  )

}

const beginSpell = spell => {

  resultMessage.value = ''

  attackResult.value = null

  selectedTargetId.value = null

  selectedSlotLevel.value = null

  selectedSpell.value = spell

  if (spell.level > 0) {

    const firstAvailableSlot =

      availableSlotLevels.value.find(

        slot =>

          slot.level >= spell.level &&

          slot.current > 0

      )

    selectedSlotLevel.value =

      firstAvailableSlot?.level ?? null

  }

  if (

    spell.resolution?.type === 'effect' ||

    spell.resolution?.type === 'special' ||

    spell.resolution?.type === 'reaction'

  ) {

    useSpell(spell)

  }

}

const cancelSpell = () => {

  selectedSpell.value = null

  selectedTargetId.value = null

  selectedSlotLevel.value = null

  isResolving.value = false

}

const resolveSelectedSpell = () => {

  if (

    !selectedSpell.value ||

    !selectedTargetId.value ||

    !participantId.value

  ) {

    return

  }

  isResolving.value = true

  resultMessage.value = ''

  attackResult.value = null

  const spell = selectedSpell.value

  const targetId = selectedTargetId.value

  const castResult = castSpell(

    participantId.value,

    spell,

    {

      slotLevel:

        spell.level > 0

          ? selectedSlotLevel.value

          : 0

    }

  )

  if (!castResult.success) {

    resultMessage.value =

      getCastErrorMessage(

        castResult.reason

      )

    isResolving.value = false

    return

  }

  const resolution = resolveSpell(

    participantId.value,

    targetId,

    spell,

    {

      slotLevel:

        castResult.slotLevel,

      areaContext:

        selectedSpellAreaContext.value

    }

  )

  if (!resolution.success) {

    resultMessage.value =

      getResolutionErrorMessage(

        resolution.reason

      )

    isResolving.value = false

    return

  }

  attackResult.value = resolution

  applyResolutionDamage(

    resolution

  )

  resultMessage.value =

    getResolutionMessage(

      resolution

    )

  selectedSpell.value = null

  selectedTargetId.value = null

  selectedSlotLevel.value = null

  isResolving.value = false

}

const useSpell = spell => {

  if (!participantId.value) {

    return

  }

  const slotLevel =

    spell.level > 0

      ? (

          availableSlotLevels.value.find(

            slot =>

              slot.level >= spell.level &&

              slot.current > 0

          )?.level ?? null

        )

      : 0

  const result = castSpell(

    participantId.value,

    spell,

    {

      slotLevel

    }

  )

  if (!result.success) {

    resultMessage.value =

      getCastErrorMessage(

        result.reason

      )

    return

  }

  if (result.requiresResolution) {

    selectedSpell.value = spell

    selectedSlotLevel.value =

      result.slotLevel ?? slotLevel

    return

  }

  resultMessage.value =

    `${spell.name}: заклинание использовано`

  selectedSpell.value = null

  selectedTargetId.value = null

  selectedSlotLevel.value = null

}

const applyResolutionDamage = resolution => {

  if (!resolution) {

    return

  }

  if (

    resolution.type ===

    'area-saving-throw'

  ) {

    for (

      const result

      of resolution.results ?? []

    ) {

      if (

        result.damage?.success &&

        result.damage.total > 0 &&

        result.combatParticipantId

      ) {

        combatStore.applyDamage(

          result.combatParticipantId,

          result.damage.total

        )

      }

      if (

        result.push?.distanceFeet > 0 &&

        result.tokenId

      ) {

        battlefieldStore.pushToken(

          result.tokenId,

          resolution.area

            ?.casterTokenId,

          result.push.distanceFeet

        )

      }

    }

    return

  }

  if (!resolution.damage) {

    return

  }

  if (!resolution.damage.success) {

    return

  }

  if (resolution.damage.total <= 0) {

    return

  }

  if (!resolution.targetId) {

    return

  }

  combatStore.applyDamage(

    resolution.targetId,

    resolution.damage.total

  )

}

const getResolutionMessage = resolution => {

  if (resolution.type === 'attack') {

    const target =

      combatStore.participants.find(

        item =>

          item.id ===

          resolution.targetId

      )

    const targetName =

      target?.name ?? 'цель'

    const roll =

      resolution.roll

    const damageRolls =

      resolution.damage?.rolls ?? []

    const damageDice =

      resolution.damage?.dice ?? ''

    const damageText =

      damageRolls.length

        ? ` (${damageDice}: ${damageRolls.join(' + ')})`

        : ''

    if (resolution.critical) {

      return `${resolution.spell.name}: d20 = ${roll}. КРИТ! Попадание по ${targetName}. Урон: ${resolution.damage.total} ${resolution.damage.type}${damageText}`

    }

    if (resolution.criticalFailure) {

      return `${resolution.spell.name}: d20 = ${roll}. Критический промах по ${targetName}.`

    }

    if (!resolution.hit) {

      return `${resolution.spell.name}: d20 = ${roll}. Промах по ${targetName}.`

    }

    return `${resolution.spell.name}: d20 = ${roll}. Попадание по ${targetName}. Урон: ${resolution.damage.total} ${resolution.damage.type}${damageText}`

  }

  if (

    resolution.type ===

    'area-saving-throw'

  ) {

    const results =

      resolution.results ?? []

    if (!results.length) {

      return `${resolution.spell.name}: в области нет существ для спасброска.`

    }

    const messages =

      results.map(result => {

        const target =

          combatStore.participants.find(

            item =>

              item.id ===

              result.combatParticipantId

          )

        const targetName =

          target?.name ?? 'цель'

        const damage =

          result.damage?.total ?? 0

        const damageType =

          result.damage?.type ?? ''

        if (result.failed) {

          if (

            result.push?.distanceFeet > 0

          ) {

            return `${targetName}: провалил спасбросок, ${damage} ${damageType}, отброшен на ${result.push.distanceFeet} ft`

          }

          return `${targetName}: провалил спасбросок, ${damage} ${damageType}`

        }

        return `${targetName}: успешно прошёл спасбросок, ${damage} ${damageType}`

      })

    return `${resolution.spell.name}: ${messages.join('; ')}`

  }

  if (

    resolution.type ===

    'saving-throw'

  ) {

    const target =

      combatStore.participants.find(

        item =>

          item.id ===

          resolution.targetId

      )

    const targetName =

      target?.name ?? 'цель'

    if (resolution.passed) {

      return `${resolution.spell.name}: ${targetName} успешно прошёл спасбросок. Урон: ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''}`

    }

    if (

      resolution.push?.distanceFeet > 0

    ) {

      return `${resolution.spell.name}: ${targetName} провалил спасбросок. Урон: ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''}. Отброшен на ${resolution.push.distanceFeet} ft`

    }

    return `${resolution.spell.name}: ${targetName} провалил спасбросок. Урон: ${resolution.damage?.total ?? 0} ${resolution.damage?.type ?? ''}`

  }

  if (

    resolution.type ===

    'automatic-hit'

  ) {

    const target =

      combatStore.participants.find(

        item =>

          item.id ===

          resolution.targetId

      )

    const targetName =

      target?.name ?? 'цель'

    return `${resolution.spell.name}: автоматическое попадание по ${targetName}. Урон: ${resolution.damage.total} ${resolution.damage.type}`

  }

  return `${resolution.spell.name}: заклинание использовано`

}

const getCastErrorMessage = reason => {

  if (

    reason ===

    'spell-unavailable'

  ) {

    return 'Заклинание сейчас недоступно.'

  }

  if (

    reason ===

    'spell-slot-unavailable'

  ) {

    return 'Нет доступной ячейки заклинания.'

  }

  if (

    reason ===

    'casting-time-unavailable'

  ) {

    return 'Недоступно действие для накладывания заклинания.'

  }

  return 'Не удалось использовать заклинание.'

}

const getResolutionErrorMessage = reason => {

  if (

    reason ===

    'invalid-target'

  ) {

    return 'Недопустимая цель.'

  }

  if (

    reason ===

    'target-unconscious'

  ) {

    return 'Цель находится без сознания.'

  }

  if (

    reason ===

    'missing-saving-throw-ability'

  ) {

    return 'У заклинания не указан тип спасброска.'

  }

  if (

    reason ===

    'invalid-area-context'

  ) {

    return 'Не удалось определить область заклинания.'

  }

  return 'Не удалось разрешить заклинание.'

}

const getSpellStatus = spell => {

  if (!participantId.value) {

    return ''

  }

  if (!isSpellAvailable(spell)) {

    if (spell.level > 0) {

      return 'Нет доступной ячейки'

    }

    if (!isCurrentTurn.value) {

      return 'Не ваш ход'

    }

    return 'Недоступно'

  }

  if (!isCurrentTurn.value) {

    if (

      spell.resolution?.type ===

      'reaction'

    ) {

      return 'Реакция'

    }

    return 'Не ваш ход'

  }

  if (

    spell.resolution?.type ===

    'attack'

  ) {

    return 'Требуется атака'

  }

  if (

    spell.resolution?.type ===

    'saving-throw'

  ) {

    return 'Спасбросок'

  }

  if (

    spell.resolution?.type ===

    'automatic-hit'

  ) {

    return 'Автоматическое попадание'

  }

  if (

    spell.resolution?.type ===

    'reaction'

  ) {

    return 'Реакция'

  }

  return 'Готово'

}

const getAttackModifier = spell => {

  if (

    spell.resolution?.type !==

    'attack'

  ) {

    return null

  }

  return getSpellAttackBonus(

    participantId.value

  )

}

const getSaveDC = spell => {

  if (

    spell.resolution?.type !==

    'saving-throw'

  ) {

    return null

  }

  return getSpellSaveDC(

    participantId.value

  )

}

const getTargetAC = () => {

  if (!selectedTargetId.value) {

    return null

  }

  return getEffectiveArmorClass(

    selectedTargetId.value

  )

}

</script>

<template>

  <section class="space-y-4">

    <div>

      <div class="flex items-center justify-between">

        <h2 class="text-xl font-bold">

          Заклинания

        </h2>

        <span

          v-if="participant"

          class="text-sm opacity-70"

        >

          {{ participant.name }}

        </span>

      </div>

      <p

        v-if="!participant"

        class="mt-2 rounded border p-3"

      >

        Персонаж ещё не добавлен в бой.

      </p>

      <p

        v-else-if="!isCurrentTurn"

        class="mt-2 rounded border p-3 text-sm"

      >

        Сейчас ход:

        {{ currentParticipant?.name ?? '—' }}.

        Заклинания вашего хода будут доступны,

        когда наступит ваш ход.

      </p>

      <p

        v-if="resultMessage"

        class="mt-2 rounded border p-3"

      >

        {{ resultMessage }}

      </p>

    </div>

    <div

      v-if="selectedSpell"

      class="rounded border p-4 space-y-4"

    >

      <div>

        <h3 class="font-semibold">

          {{ selectedSpell.name }}

        </h3>

        <p class="text-sm opacity-70">

          {{ getSpellStatus(selectedSpell) }}

        </p>

      </div>

      <div

        v-if="selectedSpell.level > 0"

        class="space-y-2"

      >

        <label class="block text-sm font-medium">

          Ячейка заклинания

        </label>

        <select

          v-model="selectedSlotLevel"

          class="w-full rounded border px-3 py-2"

        >

          <option

            v-for="slot in castableSlotLevels"

            :key="slot.level"

            :value="slot.level"

          >

            {{ slot.level }} уровень — {{ slot.current }}/{{ slot.maximum }}

          </option>

        </select>

        <p

          v-if="!castableSlotLevels.length"

          class="text-sm text-red-500"

        >

          Нет подходящей ячейки для этого заклинания.

        </p>

      </div>

      <div

        v-if="

          selectedSpell.resolution?.type === 'attack'

        "

        class="space-y-2"

      >

        <p>

          Бонус атаки:

          <strong>

            {{ getAttackModifier(selectedSpell) >= 0 ? '+' : '' }}{{ getAttackModifier(selectedSpell) }}

          </strong>

        </p>

        <p v-if="selectedTargetId">

          AC цели:

          <strong>

            {{ getTargetAC() }}

          </strong>

        </p>

      </div>

      <div

        v-if="

          selectedSpell.resolution?.type === 'saving-throw'

        "

        class="space-y-2"

      >

        <p>

          Сл спасброска:

          <strong>

            {{ getSaveDC(selectedSpell) }}

          </strong>

        </p>

        <p>

          Характеристика:

          <strong>

            {{ selectedSpell.resolution.ability }}

          </strong>

        </p>

      </div>

      <div

        v-if="

          selectedSpell.resolution?.type === 'attack' ||

          selectedSpell.resolution?.type === 'saving-throw' ||

          selectedSpell.resolution?.type === 'automatic-hit'

        "

        class="space-y-2"

      >

        <label class="block text-sm font-medium">

          {{

            selectedSpell.target?.type === 'creatures-in-area'

              ? 'Направление'

              : 'Цель'

          }}

        </label>

        <select

          v-model="selectedTargetId"

          class="w-full rounded border px-3 py-2"

        >

          <option :value="null">

            {{

              selectedSpell.target?.type === 'creatures-in-area'

                ? 'Выберите направление'

                : 'Выберите цель'

            }}

          </option>

          <option

            v-for="target in targets"

            :key="target.id"

            :value="target.id"

          >

            {{ target.name }} — HP {{ target.currentHP }}/{{ target.maxHP }}

          </option>

        </select>

        <p

          v-if="

            selectedSpell.target?.type === 'creatures-in-area' &&

            selectedTargetId

          "

          class="text-sm opacity-70"

        >

          Все существа внутри области сделают

          {{ selectedSpell.resolution?.ability }}

          спасбросок.

        </p>

        <p

          v-if="

            selectedSpell.target?.type === 'creatures-in-area' &&

            selectedTargetId &&

            !selectedSpellAreaContext

          "

          class="text-sm text-red-500"

        >

          Не удалось определить область заклинания.

        </p>

        <p

          v-if="

            selectedSpellAreaContext &&

            selectedSpell.target?.type === 'creatures-in-area'

          "

          class="text-sm opacity-70"

        >

          В области:

          {{ selectedSpellAreaContext.affectedTokens.length }}

          существ.

        </p>

      </div>

      <div class="flex gap-2">

        <button

          v-if="

            selectedTargetId &&

            (

              selectedSpell.resolution?.type === 'attack' ||

              selectedSpell.resolution?.type === 'saving-throw' ||

              selectedSpell.resolution?.type === 'automatic-hit'

            )

          "

          type="button"

          class="rounded border px-4 py-2"

          :disabled="

            isResolving ||

            !selectedSlotLevel ||

            (

              selectedSpell.target?.type === 'creatures-in-area' &&

              !selectedSpellAreaContext

            )

          "

          @click="resolveSelectedSpell"

        >

          Разрешить

        </button>

        <button

          type="button"

          class="rounded border px-4 py-2"

          :disabled="isResolving"

          @click="cancelSpell"

        >

          Отмена

        </button>

      </div>

    </div>

    <div class="space-y-2">

      <h3 class="font-semibold">

        Заговоры

      </h3>

      <div

        v-if="!cantrips.length"

        class="rounded border p-3 text-sm opacity-70"

      >

        Нет доступных заговоров.

      </div>

      <div

        v-for="spell in cantrips"

        :key="spell.id"

        class="flex items-center justify-between rounded border p-3"

      >

        <div>

          <div class="font-medium">

            {{ spell.name }}

          </div>

          <div class="text-sm opacity-70">

            {{ getSpellStatus(spell) }}

          </div>

        </div>

        <button

          type="button"

          class="rounded border px-3 py-2"

          :disabled="!isSpellAvailable(spell)"

          @click="beginSpell(spell)"

        >

          Использовать

        </button>

      </div>

    </div>

    <div

      v-if="!cantrips.length && !levelledSpells.length"

      class="rounded border p-3 text-sm opacity-70"

    >

      <template

        v-if="

          spellbookSpells.length &&

          !preparedSpells.length

        "

      >

        Есть {{ spellbookSpells.length }}

        заклинаний в книге, но ни одно не подготовлено для боя.

      </template>

      <template

        v-else-if="knownSpells.length"

      >

        Известные заклинания есть, но сейчас они недоступны для накладывания.

      </template>

      <template v-else>

        У этого участника нет изученных или подготовленных заклинаний.

      </template>

    </div>

    <div

      v-for="(spellsAtLevel, level) in groupedSpells"

      :key="level"

      class="space-y-2"

    >

      <h3 class="font-semibold">

        {{ level }} уровень

      </h3>

      <div

        v-for="spell in spellsAtLevel"

        :key="spell.id"

        class="flex items-center justify-between rounded border p-3"

      >

        <div>

          <div class="font-medium">

            {{ spell.name }}

          </div>

          <div class="text-sm opacity-70">

            {{ getSpellStatus(spell) }}

          </div>

        </div>

        <button

          type="button"

          class="rounded border px-3 py-2"

          :disabled="!isSpellAvailable(spell)"

          @click="beginSpell(spell)"

        >

          Использовать

        </button>

      </div>

    </div>

    <div

      v-if="availableSlotLevels.length"

      class="space-y-2"

    >

      <h3 class="font-semibold">

        Ячейки заклинаний

      </h3>

      <div

        v-for="slot in availableSlotLevels"

        :key="slot.level"

        class="flex justify-between rounded border p-3"

      >

        <span>

          {{ slot.level }} уровень

        </span>

        <span>

          {{ slot.current }} / {{ slot.maximum }}

        </span>

      </div>

    </div>

  </section>

</template>