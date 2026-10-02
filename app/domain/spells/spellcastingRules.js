export const SPELLCASTING_RULES = {
  bard: {
    type: 'known',
    ability: 'charisma',
    ritualRequiresKnown: true,
    spellbook: false,
    prepared: false,
    pactMagic: false
  },

  cleric: {
    type: 'prepared',
    ability: 'wisdom',
    ritualRequiresPrepared: true,
    spellbook: false,
    prepared: true,
    pactMagic: false
  },

  druid: {
    type: 'prepared',
    ability: 'wisdom',
    ritualRequiresPrepared: true,
    spellbook: false,
    prepared: true,
    pactMagic: false
  },

  paladin: {
    type: 'prepared',
    ability: 'charisma',
    ritualRequiresPrepared: true,
    spellbook: false,
    prepared: true,
    pactMagic: false
  },

  ranger: {
    type: 'known',
    ability: 'wisdom',
    ritualRequiresKnown: true,
    spellbook: false,
    prepared: false,
    pactMagic: false
  },

  sorcerer: {
    type: 'known',
    ability: 'charisma',
    ritualRequiresKnown: false,
    spellbook: false,
    prepared: false,
    pactMagic: false
  },

  warlock: {
    type: 'known',
    ability: 'charisma',
    ritualRequiresKnown: false,
    spellbook: false,
    prepared: false,
    pactMagic: true
  },

  wizard: {
    type: 'spellbook',
    ability: 'intelligence',
    ritualRequiresSpellbook: true,
    spellbook: true,
    prepared: true,
    pactMagic: false
  }
}

export const getSpellcastingRules = classId => {
  return SPELLCASTING_RULES[classId] ?? null
}

export const isKnownSpellcaster = classId => {
  return (
    getSpellcastingRules(classId)?.type ===
    'known'
  )
}

export const isPreparedSpellcaster = classId => {
  return (
    getSpellcastingRules(classId)?.type ===
    'prepared'
  )
}

export const isSpellbookCaster = classId => {
  return (
    getSpellcastingRules(classId)?.type ===
    'spellbook'
  )
}

export const isPactMagicCaster = classId => {
  return Boolean(
    getSpellcastingRules(classId)?.pactMagic
  )
}

export const getSpellcastingAbility = classId => {
  return (
    getSpellcastingRules(classId)
      ?.ability ?? null
  )
}

export const canCastRitual = (
  classId,
  {
    isKnown = false,
    isPrepared = false,
    isInSpellbook = false
  } = {}
) => {
  const rules =
    getSpellcastingRules(classId)

  if (!rules) {
    return false
  }

  if (rules.ritualRequiresSpellbook) {
    return isInSpellbook
  }

  if (rules.ritualRequiresPrepared) {
    return isPrepared
  }

  if (rules.ritualRequiresKnown) {
    return isKnown
  }

  return false
}