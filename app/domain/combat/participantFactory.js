import { classes } from '~/data/classes'
import { races } from '~/data/races'
import { weapons } from '~/data/weapons'
import { armors } from '~/data/armors'
import { shields } from '~/data/shields'
import { attackProgression } from '~/data/attackProgression'

const getAbilityModifier = score => {
  return Math.floor((Number(score ?? 10) - 10) / 2)
}

const getProficiencyBonus = level => {
  return Math.floor((Number(level ?? 1) - 1) / 4) + 2
}

const getRaceSpeed = character => {
  const race = races.find(item => item.id === character?.raceId)

  if (!race) return 30

  const subrace = race.subraces?.find(
    item => item.id === character?.subraceId
  )

  return Number(subrace?.speed ?? race.speed ?? 30)
}

const getClassData = character => {
  return classes.find(item => item.id === character?.classId) ?? null
}

const getWeaponData = character => {
  if (!character?.weaponId) return null
  return weapons.find(item => item.id === character.weaponId) ?? null
}

const getArmorData = character => {
  if (!character?.armorId) return null
  return armors.find(item => item.id === character.armorId) ?? null
}

const getShieldData = character => {
  if (!character?.shieldId) return null
  return shields.find(item => item.id === character.shieldId) ?? null
}

const getMaxHitPoints = character => {
  const classData = getClassData(character)
  if (!classData) return Number(character?.maxHP ?? 1)

  const level = Number(character?.level ?? 1)
  const constitutionModifier = getAbilityModifier(
    character?.abilityScores?.constitution
  )

  const firstLevelHp = Math.max(
    1,
    Number(classData.hitDie ?? 0) + constitutionModifier
  )

  if (level === 1) return firstLevelHp

  const hpPerLevel = Math.max(
    1,
    Math.floor(Number(classData.hitDie ?? 0) / 2) + 1 + constitutionModifier
  )

  return firstLevelHp + hpPerLevel * (level - 1)
}

const getArmorClass = character => {
  const dexterityModifier = getAbilityModifier(
    character?.abilityScores?.dexterity
  )
  const armor = getArmorData(character)
  const shield = getShieldData(character)

  let armorClass = 10 + dexterityModifier

  if (armor) {
    armorClass = Number(armor.baseAC ?? 10)

    if (armor.dexBonus) {
      const maxDexBonus = armor.maxDexBonus
      const dexBonus = maxDexBonus == null
        ? dexterityModifier
        : Math.min(dexterityModifier, maxDexBonus)

      armorClass += dexBonus
    }
  }

  if (shield) {
    armorClass += Number(shield.armorBonus ?? 0)
  }

  return armorClass
}

const getAttackCount = character => {
  const classId = character?.classId
  const level = Math.min(
    Math.max(Number(character?.level ?? 1), 1),
    20
  )
  const progression = attackProgression[classId]

  if (!progression?.extraAttack) return 1

  const extraAttack = progression.extraAttack

  if (extraAttack.subclass) {
    const subclass = extraAttack.subclass[character?.subclassId]
    if (!subclass) return 1

    const levels = Object.keys(subclass).map(Number)
    const available = levels.filter(item => level >= item)
    if (!available.length) return 1

    return Math.max(...available.map(item => subclass[item]))
  }

  if (extraAttack.invocation) {
    const invocation = extraAttack.invocation
    const hasLevel = level >= (invocation.requiredLevel ?? 1)
    const hasPact = character?.pactBoon === invocation.requiredPactBoon
    const hasInvocation = (character?.invocationIds ?? []).includes(invocation.id)

    return hasLevel && hasPact && hasInvocation
      ? invocation.attacks
      : 1
  }

  const levels = Object.keys(extraAttack).map(Number)
  const available = levels.filter(item => level >= item)
  if (!available.length) return 1

  return Math.max(...available.map(item => extraAttack[item]))
}

const getWeaponAttackProfile = character => {
  const level = Number(character?.level ?? 1)
  const proficiencyBonus = getProficiencyBonus(level)
  const abilityScores = character?.abilityScores ?? {}
  const weapon = getWeaponData(character)
  const classData = getClassData(character)
  const classWeaponProficiencies = classData?.proficiencies?.weapons ?? []

  if (!weapon) {
    const abilityModifier = getAbilityModifier(abilityScores.strength)

    return {
      weapon: {
        id: 'unarmed-strike',
        name: 'Безоружный удар',
        type: 'melee',
        ability: 'strength',
        damage: '1',
        damageType: 'bludgeoning',
        properties: []
      },
      ability: 'strength',
      abilityModifier,
      attackModifier: abilityModifier + proficiencyBonus,
      damageModifier: abilityModifier,
      hasProficiency: true,
      isRanged: false,
      isThrown: false,
      reach: 5,
      normalRange: 5,
      longRange: 5,
      attackCount: getAttackCount(character)
    }
  }

  const hasProficiency =
    classWeaponProficiencies.includes(weapon.category) ||
    classWeaponProficiencies.includes(weapon.id)

  const isFinesse = weapon.properties?.includes('finesse') ?? false
  const isRanged = weapon.type === 'ranged'
  const isThrown = weapon.properties?.includes('thrown') ?? false

  let ability = weapon.ability ?? 'strength'

  if (isFinesse) {
    const selectedAbility = character?.weaponAbility
    if (
      selectedAbility === 'strength' ||
      selectedAbility === 'dexterity'
    ) {
      ability = selectedAbility
    }
  }

  const abilityModifier = getAbilityModifier(
    abilityScores[ability]
  )

  return {
    weapon,
    ability,
    abilityModifier,
    attackModifier: abilityModifier + (hasProficiency ? proficiencyBonus : 0),
    damageModifier: abilityModifier,
    hasProficiency,
    isRanged,
    isThrown,
    reach: weapon.properties?.includes('reach') ? 10 : 5,
    normalRange: Number(weapon.range?.normal ?? (isRanged ? 5 : 5)),
    longRange: Number(weapon.range?.long ?? (isRanged ? weapon.range?.normal ?? 5 : 5)),
    attackCount: getAttackCount(character)
  }
}

export const createCharacterParticipant = character => {
  if (!character?.id) return null

  const maxHP = getMaxHitPoints(character)
  const armorClass = getArmorClass(character)
  const attackProfile = getWeaponAttackProfile(character)
  const dexterityModifier = getAbilityModifier(
    character?.abilityScores?.dexterity
  )

  return {
    id: `character-${character.id}`,
    characterId: character.id,
    name: character.name || 'Без имени',
    type: 'player',
    faction: 'friendly',
    level: Number(character.level ?? 1),
    classId: character.classId ?? null,
    subclassId: character.subclassId ?? null,
    raceId: character.raceId ?? null,
    subraceId: character.subraceId ?? null,
    abilityScores: { ...(character.abilityScores ?? {}) },
    weaponId: character.weaponId ?? null,
    weaponAbility: character.weaponAbility ?? null,
    armorId: character.armorId ?? null,
    shieldId: character.shieldId ?? null,
    initiativeModifier: dexterityModifier,
    initiative: 0,
    maxHP,
    currentHP: Math.max(
      0,
      Math.min(
        Number(character.currentHP ?? maxHP),
        maxHP
      )
    ),
    armorClass,
    speed: getRaceSpeed(character),
    attackBonus: attackProfile.attackModifier,
    damageDice: attackProfile.weapon.id === 'unarmed-strike'
      ? '1'
      : attackProfile.weapon.damage,
    damageBonus: attackProfile.damageModifier,
    attackActionMaxAttacks: attackProfile.attackCount,
    weaponAttackProfile: attackProfile,
    selectedReactions: [ ...(character.selectedReactions ?? []) ],
    spellSlots: [ ...(character.spellSlots ?? []) ],
    currentSpellSlots: [ ...(character.spellSlots ?? []) ],
    knownCantripIds: [ ...(character.knownCantripIds ?? []) ],
    knownSpellIds: [ ...(character.knownSpellIds ?? []) ],
    preparedSpellIds: [ ...(character.preparedSpellIds ?? []) ],
    spellbookSpellIds: [ ...(character.spellbookSpellIds ?? []) ]
  }
}

export const getParticipantAttackProfile = participant => {
  if (!participant) return null

  if (participant.weaponAttackProfile) {
    return participant.weaponAttackProfile
  }

  if (!participant.weaponId && (participant.type === 'enemy' || participant.type === 'monster')) {
    const attackBonus = Number(
      participant.attackBonus ??
      participant.attackModifier ??
      0
    )
    const damageDice =
      participant.damageDice ??
      participant.damage ??
      '1d6'
    const damageBonus = Number(
      participant.damageBonus ??
      participant.damageModifier ??
      0
    )

    return {
      weapon: {
        id: `monster-attack-${participant.enemyPreset ?? participant.id}`,
        name: participant.attackName ?? 'Атака существа',
        type: participant.attackType ?? 'melee',
        ability: null,
        damage: damageDice,
        damageType: participant.damageType ?? 'bludgeoning',
        properties: []
      },
      ability: null,
      abilityModifier: attackBonus,
      attackModifier: attackBonus,
      damageModifier: damageBonus,
      hasProficiency: true,
      isRanged: participant.attackType === 'ranged',
      isThrown: false,
      reach: Number(participant.reach ?? 5),
      normalRange: Number(participant.normalRange ?? (participant.attackType === 'ranged' ? 80 : 5)),
      longRange: Number(participant.longRange ?? (participant.attackType === 'ranged' ? 320 : 5)),
      attackCount: Number(participant.attackActionMaxAttacks ?? 1)
    }
  }

  return getWeaponAttackProfile(participant)
}
