import { computed } from 'vue'
import { useDice } from '~/composables/useDice'

export const useSavedCharacterAttacks = (
  character,
  weapon,
  characterClass
) => {
  const { rollCheck } = useDice()

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

    /*
     * Владение оружием
     */
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

    /*
     * Характеристика атаки
     */
    let ability =
      weapon.value.ability

    /*
     * Finesse:
     * используем сохранённый выбор
     * STR или DEX.
     */
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

    /*
     * Бонус атаки
     */
    const attackModifier =
      abilityModifier +
      (
        hasProficiency
          ? proficiencyBonus
          : 0
      )

    /*
     * Модификатор урона
     */
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

  /*
   * Бросок атаки.
   *
   * mode:
   * 'normal'
   * 'advantage'
   * 'disadvantage'
   */
  const rollAttack = (
    mode = 'normal'
  ) => {
    if (!attack.value) {
      return null
    }

    /*
     * Проверяем, что передан
     * допустимый режим.
     */
    const requestedMode = [
      'normal',
      'advantage',
      'disadvantage'
    ].includes(mode)
      ? mode
      : 'normal'

    /*
     * Передаём Advantage / Disadvantage
     * в систему эффектов.
     *
     * Там дополнительно учитывается
     * помеха от экипировки.
     */
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

  return {
    attack,
    rollAttack
  }
}