<script setup>
import { ref, toRef, computed } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },

  weapon: {
    type: Object,
    default: null
  },

  characterClass: {
    type: Object,
    default: null
  }
})

const characterRef = toRef(
  props,
  'character'
)

const weaponRef = toRef(
  props,
  'weapon'
)

const characterClassRef = toRef(
  props,
  'characterClass'
)

const {
  attack,
  rollAttack,
  rollAttackDamage
} = useSavedCharacterAttacks(
  characterRef,
  weaponRef,
  characterClassRef
)

const {
  resolveAttack
} = useAttackResolution()

const {
  canParticipantAct
} = useCombat()

const combatStore = useCombatStore()

const characterParticipantId = computed(() => {
  return `character-${props.character.id}`
})

const canAttack = computed(() => {
  return canParticipantAct(
    characterParticipantId.value
  )
})

const lastAttack = ref(null)
const lastDamage = ref(null)
const lastAppliedDamage = ref(null)

const abilities = [
  {
    id: 'strength',
    name: 'Сила'
  },
  {
    id: 'dexterity',
    name: 'Ловкость'
  },
  {
    id: 'constitution',
    name: 'Телосложение'
  },
  {
    id: 'intelligence',
    name: 'Интеллект'
  },
  {
    id: 'wisdom',
    name: 'Мудрость'
  },
  {
    id: 'charisma',
    name: 'Харизма'
  }
]

const getAbilityName = (abilityId) => {
  return (
    abilities.find(
      ability => ability.id === abilityId
    )?.name ?? abilityId
  )
}

const formatModifier = (modifier) => {
  return modifier >= 0
    ? `+${modifier}`
    : `${modifier}`
}

const getModeName = (mode) => {
  if (mode === 'advantage') {
    return 'Преимущество'
  }

  if (mode === 'disadvantage') {
    return 'Помеха'
  }

  return 'Обычный'
}

const selectTarget = (targetId) => {
  combatStore.selectTarget(targetId)

  lastAttack.value = null
  lastDamage.value = null
  lastAppliedDamage.value = null
}

const rollWeaponAttack = (
  mode = 'normal'
) => {
  const target =
    combatStore.selectedTarget

  if (!canAttack.value) {
    return
  }

  if (
    !target ||
    target.currentHP <= 0
  ) {
    return
  }

  const actionUsed =
    combatStore.useAction(
      characterParticipantId.value
    )

  if (!actionUsed) {
    return
  }

  const result = rollAttack(mode)

  if (!result) {
    return
  }

  const resolution = resolveAttack(
    result.roll,
    attack.value.attackModifier,
    target.armorClass
  )

  lastAttack.value = {
    ...result,
    ...resolution
  }

  lastDamage.value = null
  lastAppliedDamage.value = null
}

const rollWeaponDamage = () => {
  const target =
    combatStore.selectedTarget

  if (
    !target ||
    !lastAttack.value ||
    lastAttack.value.miss ||
    lastAttack.value.criticalFail
  ) {
    return
  }

  const result = rollAttackDamage(
    lastAttack.value.critical
  )

  if (!result) {
    return
  }

  lastDamage.value = result

  const damage =
    result.total +
    attack.value.damageModifier

  lastAppliedDamage.value =
    combatStore.applyDamage(
      target.id,
      damage
    )
}

const resetTarget = () => {
  const target =
    combatStore.selectedTarget

  if (!target) {
    return
  }

  combatStore.resetTarget(
    target.id
  )

  lastAttack.value = null
  lastDamage.value = null
  lastAppliedDamage.value = null
}
</script>

<template>
  <div class="mt-6 border rounded-lg p-4">
    <h2 class="text-xl font-bold">
      Атаки
    </h2>

    <div
      v-if="!attack"
      class="mt-3 text-sm text-gray-500"
    >
      Оружие не выбрано.
    </div>

    <div
      v-else
      class="mt-4 border rounded-lg p-4"
    >
      <div
        class="flex items-center justify-between"
      >
        <div>
          <p class="font-semibold">
            {{ attack.weapon.name }}
          </p>

          <p class="text-sm text-gray-500">
            Бонус атаки:

            <strong>
              {{
                formatModifier(
                  attack.attackModifier
                )
              }}
            </strong>
          </p>
        </div>

        <div
          v-if="attack.hasProficiency"
          title="Владение оружием"
          class="text-lg"
        >
          ✓
        </div>

        <div
          v-else
          class="text-sm"
        >
          ⚠ Нет владения
        </div>
      </div>

      <div class="mt-3 space-y-1 text-sm">
        <p>
          Характеристика:

          <strong>
            {{
              getAbilityName(
                attack.ability
              )
            }}
          </strong>
        </p>

        <p>
          Урон:

          <strong>
            {{ attack.weapon.damage }}

            {{
              formatModifier(
                attack.damageModifier
              )
            }}
          </strong>
        </p>

        <p
          v-if="attack.weapon.damageType"
        >
          Тип урона:

          {{ attack.weapon.damageType }}
        </p>

        <p
          v-if="
            attack.weapon.properties?.length
          "
        >
          Свойства:

          {{ attack.weapon.properties.join(', ') }}
        </p>
      </div>

      <div class="mt-4 border-t pt-4">
        <p class="text-sm font-semibold mb-2">
          Цель
        </p>

        <div class="space-y-2">
          <select
            :value="
              combatStore.selectedTargetId
            "
            class="border rounded px-3 py-1"
            @change="
              selectTarget(
                $event.target.value
              )
            "
          >
            <option
              value=""
            >
              Выберите цель
            </option>

            <option
              v-for="target in combatStore.targets"
              :key="target.id"
              :value="target.id"
            >
              {{ target.name }}
              — AC {{ target.armorClass }}
              — HP {{ target.currentHP }}/{{ target.maxHP }}
            </option>
          </select>

          <div
            v-if="combatStore.selectedTarget"
            class="border rounded-lg p-3 text-sm"
          >
            <p>
              Цель:

              <strong>
                {{
                  combatStore.selectedTarget.name
                }}
              </strong>
            </p>

            <p>
              AC:

              <strong>
                {{
                  combatStore.selectedTarget
                    .armorClass
                }}
              </strong>
            </p>

            <p>
              HP:

              <strong>
                {{
                  combatStore.selectedTarget
                    .currentHP
                }}
                /
                {{
                  combatStore.selectedTarget
                    .maxHP
                }}
              </strong>
            </p>

            <p
              v-if="
                combatStore.selectedTarget
                  .currentHP <= 0
              "
              class="mt-2 font-semibold"
            >
              💀 Цель повержена
            </p>

            <button
              type="button"
              class="mt-3 border rounded px-3 py-1"
              @click="resetTarget"
            >
              Восстановить цель
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="combatStore.combatStarted"
        class="mt-4 border rounded-lg p-3"
      >
        <p
          v-if="canAttack"
          class="font-semibold"
        >
          ⚔ Сейчас ваш ход
        </p>

        <p
          v-else
          class="text-sm"
        >
          Сейчас ход:

          <strong>
            {{
              combatStore.currentParticipant?.name
            }}
          </strong>
        </p>
      </div>

      <div class="mt-4">
        <p class="text-sm font-semibold mb-2">
          Бросок атаки
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="
              !combatStore.selectedTarget ||
              combatStore.selectedTarget.currentHP <= 0
            "
            @click="
              rollWeaponAttack('normal')
            "
          >
            Обычный
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="
              !combatStore.selectedTarget ||
              combatStore.selectedTarget.currentHP <= 0
            "
            @click="
              rollWeaponAttack(
                'advantage'
              )
            "
          >
            Преимущество
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="
              !combatStore.selectedTarget ||
              combatStore.selectedTarget.currentHP <= 0
            "
            @click="
              rollWeaponAttack(
                'disadvantage'
              )
            "
          >
            Помеха
          </button>
        </div>
      </div>

      <div
        v-if="lastAttack"
        class="mt-4 border-t pt-4"
      >
        <p class="font-semibold">
          Результат атаки
        </p>

        <div
          v-if="lastAttack.critical"
          class="mt-3 border rounded-lg p-3"
        >
          🎯 КРИТИЧЕСКОЕ ПОПАДАНИЕ!
        </div>

        <div
          v-else-if="
            lastAttack.criticalFail
          "
          class="mt-3 border rounded-lg p-3"
        >
          💀 КРИТИЧЕСКИЙ ПРОМАХ!
        </div>

        <div
          v-else-if="lastAttack.hit"
          class="mt-3 border rounded-lg p-3"
        >
          ⚔ ПОПАДАНИЕ!
        </div>

        <div
          v-else
          class="mt-3 border rounded-lg p-3"
        >
          ✕ ПРОМАХ!
        </div>

        <div class="mt-3 space-y-1">
          <p>
            Режим:

            <strong>
              {{
                getModeName(
                  lastAttack.mode
                )
              }}
            </strong>
          </p>

          <p>
            Бросок:

            <strong>
              {{ lastAttack.roll }}
            </strong>
          </p>

          <p>
            Модификатор:

            <strong>
              {{
                formatModifier(
                  lastAttack.modifier
                )
              }}
            </strong>
          </p>

          <p>
            Итог:

            <strong>
              {{ lastAttack.total }}
            </strong>
          </p>

          <p>
            AC цели:

            <strong>
              {{
                combatStore.selectedTarget
                  ?.armorClass
              }}
            </strong>
          </p>

          <p
            v-if="
              lastAttack.rolls.length > 1
            "
            class="text-sm text-gray-500"
          >
            Броски:

            {{ lastAttack.rolls.join(', ') }}
          </p>
        </div>

        <div
          v-if="
            lastAttack.hit &&
            !lastAttack.criticalFail
          "
          class="mt-4"
        >
          <button
            type="button"
            class="border rounded px-3 py-1"
            @click="rollWeaponDamage"
          >
            🎲 Бросить урон
          </button>
        </div>

        <div
          v-if="lastDamage"
          class="mt-4 border-t pt-4"
        >
          <p class="font-semibold">
            Результат урона
          </p>

          <p class="mt-2">
            Кубики:

            <strong>
              {{ lastDamage.rolls.join(', ') }}
            </strong>
          </p>

          <p>
            Сумма кубиков:

            <strong>
              {{ lastDamage.total }}
            </strong>
          </p>

          <p>
            Модификатор:

            <strong>
              {{
                formatModifier(
                  attack.damageModifier
                )
              }}
            </strong>
          </p>

          <p>
            Общий урон:

            <strong>
              {{
                lastDamage.total +
                attack.damageModifier
              }}
            </strong>
          </p>

          <p
            v-if="lastAppliedDamage"
            class="mt-2"
          >
            Получено урона:

            <strong>
              {{ lastAppliedDamage.damage }}
            </strong>
          </p>

          <p
            v-if="lastAppliedDamage"
          >
            HP цели:

            <strong>
              {{ lastAppliedDamage.currentHP }}
              /
              {{ lastAppliedDamage.maxHP }}
            </strong>
          </p>

          <p
            v-if="lastAppliedDamage?.defeated"
            class="mt-2 font-semibold"
          >
            💀 Цель повержена
          </p>

          <p
            v-if="lastDamage.critical"
            class="mt-2"
          >
            🎯 Критический урон
          </p>
        </div>
      </div>
    </div>
  </div>
</template>