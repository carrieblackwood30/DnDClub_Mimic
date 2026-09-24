import { computed } from 'vue'

import { useDice } from '~/composables/useDice'

import { useSavedCharacterEffects } from '~/composables/useSavedCharacterEffects'

import { useAttackProgression } from '~/composables/useAttackProgression'


export const useSavedCharacterAttacks = (
  character,
  weapon,
  characterClass
) => {
  const {
    rollCheck,
    rollDamage
  } = useDice()

  const {
    getAttackMode
  } = useSavedCharacterEffects(
    character,
    characterClass
  )

  const {
    getAttackCount
  } = useAttackProgression()

  const attackCount = computed(() => {
    if (!character.value) {
      return 1
    }

    return getAttackCount({
      classId:
        character.value.classId,
      level:
        character.value.level,
      subclassId:
        character.value.subclassId,
      pactBoon:
        character.value.pactBoon ?? null,
      invocationIds:
        character.value.invocationIds ?? []
    })
  })

  const attack = computed(() => {
    if (!character.value) {
      return null
    }

    const level =
      character.value.level ?? 1

    const proficiencyBonus =
      Math.floor(
        (level - 1) / 4
      ) + 2

    const abilityScores =
      character.value.abilityScores ?? {}

    const getModifier = (
      ability
    ) => {
      const score =
        abilityScores[ability] ?? 10

      return Math.floor(
        (score - 10) / 2
      )
    }

    if (!weapon.value) {
      const ability =
        'strength'

      const abilityModifier =
        getModifier(ability)

      return {
        weapon: {
          id: 'unarmed-strike',
          name: 'Безоружный удар',
          type: 'melee',
          category: 'unarmed',
          damage: '1',
          damageType: 'bludgeoning',
          properties: []
        },
        ability,
        abilityModifier,
        attackModifier:
          abilityModifier +
          proficiencyBonus,
        damageModifier:
          abilityModifier,
        hasProficiency: true,
        isFinesse: false,
        isRanged: false,
        isThrown: false,
        attackCount:
          attackCount.value,
        isUnarmed: true
      }
    }

    const weaponProficiencies =
      characterClass.value
        ?.proficiencies
        ?.weapons ?? []

    const hasProficiency =
      weaponProficiencies.includes(
        weapon.value.category
      ) ||
      weaponProficiencies.includes(
        weapon.value.id
      )

    const isFinesse =
      weapon.value.properties?.includes(
        'finesse'
      ) ?? false

    const isRanged =
      weapon.value.type ===
      'ranged'

    const isThrown =
      weapon.value.properties?.includes(
        'thrown'
      ) ?? false

    let ability =
      weapon.value.ability

    if (isFinesse) {
      const selectedAbility =
        character.value.weaponAbility

      if (
        selectedAbility ===
          'strength' ||
        selectedAbility ===
          'dexterity'
      ) {
        ability =
          selectedAbility
      }
    }

    const abilityModifier =
      getModifier(ability)

    const attackModifier =
      abilityModifier +
      (
        hasProficiency
          ? proficiencyBonus
          : 0
      )

    const damageModifier =
      abilityModifier

    return {
      weapon: weapon.value,
      ability,
      abilityModifier,
      attackModifier,
      damageModifier,
      hasProficiency,
      isFinesse,
      isRanged,
      isThrown,
      attackCount:
        attackCount.value,
      isUnarmed: false
    }
  })

  const rollAttack = (
    mode = 'normal'
  ) => {
    if (!attack.value) {
      return null
    }

    const requestedMode = [
      'normal',
      'advantage',
      'disadvantage'
    ].includes(mode)
      ? mode
      : 'normal'

    const finalMode =
      getAttackMode({
        advantage:
          requestedMode ===
          'advantage',
        disadvantage:
          requestedMode ===
          'disadvantage'
      })

    return rollCheck(
      attack.value.attackModifier,
      finalMode
    )
  }

  const rollAttackDamage = (
    critical = false
  ) => {
    if (!attack.value) {
      return null
    }

    return rollDamage(
      attack.value.weapon.damage,
      {
        critical:
          critical &&
          !attack.value.isUnarmed
      }
    )
  }

  return {
    attack,
    attackCount,
    rollAttack,
    rollAttackDamage
  }
}