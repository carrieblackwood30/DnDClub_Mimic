<script setup>
import { computed, ref, toRef } from 'vue'
import { useSavedCharacterAttacks } from '~/composables/useSavedCharacterAttacks'

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
  attackCount,
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
  canParticipantAct,
  currentParticipant,
  getEffectiveArmorClass
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

const attackActionActive = computed(() => {
  const participant =
    combatStore.participants.find(
      item =>
        item.id ===
        characterParticipantId.value
    )

  return participant?.attackActionActive ?? false
})

const attacksUsed = computed(() => {
  const participant =
    combatStore.participants.find(
      item =>
        item.id ===
        characterParticipantId.value
    )

  return participant?.attackActionAttacksUsed ?? 0
})

const canMakeAttack = computed(() => {
  if (!canAttack.value) {
    return false
  }

  return combatStore.canUseAttackActionAttack(
    characterParticipantId.value
  )
})

const attacks = ref([])

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
}

const rollWeaponAttack = (mode = 'normal') => {
  const target =
    combatStore.selectedTarget

  if (!canMakeAttack.value) {
    return
  }

  if (
    !target ||
    target.currentHP <= 0
  ) {
    return
  }

  const startsNewAttackAction =
    !attackActionActive.value

  const result = rollAttack(mode)

  if (!result) {
    return
  }

  const actionAttackUsed =
    combatStore.useAttackActionAttack(
      characterParticipantId.value
    )

  if (!actionAttackUsed) {
    return
  }

  if (startsNewAttackAction) {
    attacks.value = []
  }

  const targetAC =
    getEffectiveArmorClass(target.id)

  const resolution =
    resolveAttack(
      result.roll,
      attack.value.attackModifier,
      targetAC
    )

  attacks.value.push({
    id:
      `${characterParticipantId.value}-${Date.now()}-${Math.random()}`,
    number: attacksUsed.value,
    targetId: target.id,
    targetName: target.name,
    ...result,
    ...resolution,
    targetAC,
    damage: null,
    appliedDamage: null
  })
}

const rollWeaponDamage = (attackId) => {
  const attackResult = attacks.value.find(
    item => item.id === attackId
  )

  if (
    !attackResult ||
    !attackResult.hit ||
    attackResult.damage
  ) {
    return
  }

  const target =
    combatStore.participants.find(
      participant =>
        participant.id ===
        attackResult.targetId
    )

  if (!target) {
    return
  }

  const result =
    rollAttackDamage(
      attackResult.critical
    )

  if (!result) {
    return
  }

  const totalDamage = Math.max(
    0,
    result.total +
      attack.value.damageModifier
  )

  attackResult.damage = result
  attackResult.appliedDamage =
    combatStore.applyDamage(
      target.id,
      totalDamage
    )
}

const resetTarget = () => {
  const target =
    combatStore.selectedTarget

  if (!target) {
    return
  }

  combatStore.resetTarget(target.id)
  attacks.value = []
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
      Атака недоступна.
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

      <div
        class="mt-3 space-y-1 text-sm"
      >
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
          v-if="attack.weapon.properties?.length"
        >
          Свойства:
          {{
            attack.weapon.properties.join(
              ', '
            )
          }}
        </p>
      </div>

      <div
        class="mt-4 border-t pt-4"
      >
        <p
          class="text-sm font-semibold mb-2"
        >
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
            <option value="">
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
                  getEffectiveArmorClass(
                    combatStore.selectedTarget.id
                  )
                }}
              </strong>
            </p>

            <p>
              HP:
              <strong>
                {{
                  combatStore.selectedTarget.currentHP
                }}
                /
                {{
                  combatStore.selectedTarget.maxHP
                }}
              </strong>
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
        class="mt-4 border rounded-lg p-3"
      >
        <p class="font-semibold">
          Атаки за действие:
          {{ attacksUsed }}/{{ attackCount }}
        </p>

        <p
          v-if="combatStore.combatStarted"
          class="mt-1 text-sm"
        >
          <span v-if="canAttack">
            Ход вашего персонажа
          </span>

          <span v-else>
            Сейчас ход:
            {{
              currentParticipant?.name
            }}
          </span>
        </p>
      </div>

      <div class="mt-4">
        <p
          class="text-sm font-semibold mb-2"
        >
          Бросок атаки
        </p>

        <div
          class="flex flex-wrap gap-2"
        >
          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="!canMakeAttack"
            @click="
              rollWeaponAttack('normal')
            "
          >
            Обычный
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="!canMakeAttack"
            @click="
              rollWeaponAttack('advantage')
            "
          >
            Преимущество
          </button>

          <button
            type="button"
            class="border rounded px-3 py-1"
            :disabled="!canMakeAttack"
            @click="
              rollWeaponAttack('disadvantage')
            "
          >
            Помеха
          </button>
        </div>
      </div>

      <div
        v-if="attacks.length"
        class="mt-4 space-y-4"
      >
        <div
          v-for="attackResult in attacks"
          :key="attackResult.id"
          class="border rounded-lg p-4"
        >
          <p class="font-semibold">
            Атака #{{ attackResult.number }}
          </p>

          <p class="text-sm mt-1">
            Цель:
            <strong>
              {{ attackResult.targetName }}
            </strong>
          </p>

          <div
            v-if="attackResult.critical"
            class="mt-3 border rounded-lg p-3"
          >
            🎯 КРИТИЧЕСКОЕ ПОПАДАНИЕ!
          </div>

          <div
            v-else-if="attackResult.criticalFail"
            class="mt-3 border rounded-lg p-3"
          >
            💀 КРИТИЧЕСКИЙ ПРОМАХ!
          </div>

          <div
            v-else-if="attackResult.hit"
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

          <div
            class="mt-3 space-y-1"
          >
            <p>
              Режим:
              <strong>
                {{
                  getModeName(
                    attackResult.mode
                  )
                }}
              </strong>
            </p>

            <p>
              Бросок:
              <strong>
                {{ attackResult.roll }}
              </strong>
            </p>

            <p>
              Модификатор:
              <strong>
                {{
                  formatModifier(
                    attackResult.modifier
                  )
                }}
              </strong>
            </p>

            <p>
              Итог:
              <strong>
                {{ attackResult.total }}
              </strong>
            </p>

            <p>
              AC цели:
              <strong>
                {{ attackResult.targetAC }}
              </strong>
            </p>

            <p
              v-if="attackResult.rolls?.length > 1"
              class="text-sm text-gray-500"
            >
              Броски:
              {{ attackResult.rolls.join(', ') }}
            </p>
          </div>

          <div
            v-if="
              attackResult.hit &&
              !attackResult.damage
            "
            class="mt-4"
          >
            <button
              type="button"
              class="border rounded px-3 py-1"
              @click="
                rollWeaponDamage(
                  attackResult.id
                )
              "
            >
              🎲 Бросить урон
            </button>
          </div>

          <div
            v-if="attackResult.damage"
            class="mt-4 border-t pt-4"
          >
            <p class="font-semibold">
              Результат урона
            </p>

            <p
              v-if="attackResult.damage.isFixed"
              class="mt-2"
            >
              Фиксированный урон:
              <strong>
                {{
                  attackResult.damage.total
                }}
              </strong>
            </p>

            <p v-else class="mt-2">
              Кубики:
              <strong>
                {{
                  attackResult.damage.rolls.join(
                    ', '
                  )
                }}
              </strong>
            </p>

            <p
              v-if="!attackResult.damage.isFixed"
            >
              Сумма кубиков:
              <strong>
                {{
                  attackResult.damage.total
                }}
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
                  Math.max(
                    0,
                    attackResult.damage.total +
                      attack.damageModifier
                  )
                }}
              </strong>
            </p>

            <p
              v-if="attackResult.appliedDamage"
              class="mt-2"
            >
              Получено урона:
              <strong>
                {{
                  attackResult.appliedDamage.damage
                }}
              </strong>
            </p>

            <p
              v-if="attackResult.appliedDamage"
            >
              HP цели:
              <strong>
                {{
                  attackResult.appliedDamage.currentHP
                }}
                /
                {{
                  attackResult.appliedDamage.maxHP
                }}
              </strong>
            </p>

            <p
              v-if="attackResult.appliedDamage?.defeated"
              class="mt-2 font-semibold"
            >
              💀 Цель повержена
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>