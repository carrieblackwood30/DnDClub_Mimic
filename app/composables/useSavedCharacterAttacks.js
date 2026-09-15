import { computed } from 'vue'
import { useDice } from '~/composables/useDice'

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

  const attack = computed(() => {
    if (
      !character.value ||
      !weapon.value
    ) {
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

    const getModifier = (ability) => {
      const score =
        abilityScores[ability] ?? 10

      return Math.floor(
        (score - 10) / 2
      )
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

    let ability =
      weapon.value.ability

    if (
      weapon.value.properties?.includes(
        'finesse'
      )
    ) {
      ability =
        character.value.weaponAbility ||
        weapon.value.ability
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
      hasProficiency
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
          requestedMode === 'advantage',
        disadvantage:
          requestedMode === 'disadvantage'
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
        critical
      }
    )
  }

  return {
    attack,
    rollAttack,
    rollAttackDamage
  }
}