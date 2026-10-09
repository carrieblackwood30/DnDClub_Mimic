import {
  getAbilityModifier
} from '~/domain/character/statRules'

import {
  getFightingStyleACBonus
} from '~/domain/character/classFeatureRules'

export const getCharacterArmorClass = ({
  classId = null,
  subclassId = null,
  level = 1,
  abilityScores = {},
  armor = null,
  shield = null,
  classChoices = {}
} = {}) => {
  const dexterityModifier =
    getAbilityModifier(
      abilityScores.dexterity ?? 10
    )

  const constitutionModifier =
    getAbilityModifier(
      abilityScores.constitution ?? 10
    )

  const wisdomModifier =
    getAbilityModifier(
      abilityScores.wisdom ?? 10
    )

  let armorClass

  if (armor) {
    armorClass = Number(
      armor.baseAC ?? 10
    )

    if (armor.dexBonus) {
      const dexterityBonus =
        armor.maxDexBonus == null
          ? dexterityModifier
          : Math.min(
              dexterityModifier,
              armor.maxDexBonus
            )

      armorClass += dexterityBonus
    }
  } else if (classId === 'barbarian') {
    armorClass =
      10 +
      dexterityModifier +
      constitutionModifier
  } else if (
    classId === 'monk' &&
    !shield
  ) {
    armorClass =
      10 +
      dexterityModifier +
      wisdomModifier
  } else if (
    classId === 'sorcerer' &&
    subclassId === 'draconic-bloodline'
  ) {
    armorClass =
      13 +
      dexterityModifier
  } else {
    armorClass =
      10 +
      dexterityModifier
  }

  if (shield) {
    armorClass += Number(
      shield.armorBonus ?? 0
    )
  }

  armorClass +=
    getFightingStyleACBonus({
      classId,
      level,
      armor,
      classChoices
    })

  return armorClass
}