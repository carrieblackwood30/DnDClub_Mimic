export const isSpellAvailableToClass = (
  spell,
  classId
) => {
  if (!spell || !classId) {
    return false
  }

  if (!Array.isArray(spell.classes)) {
    return false
  }

  return spell.classes.includes(classId)
}

export const isCantrip = spell => {
  return Number(spell?.level ?? -1) === 0
}

export const isLevelledSpell = spell => {
  return Number(spell?.level ?? 0) > 0
}

export const isSpellKnownByParticipant = (
  participant,
  spellId
) => {
  if (!participant || !spellId) {
    return false
  }

  if (
    participant.knownSpellIds?.includes(
      spellId
    )
  ) {
    return true
  }

  if (
    participant.knownCantripIds?.includes(
      spellId
    )
  ) {
    return true
  }

  return false
}

export const isSpellPreparedByParticipant = (
  participant,
  spellId
) => {
  if (!participant || !spellId) {
    return false
  }

  return Boolean(
    participant.preparedSpellIds?.includes(
      spellId
    )
  )
}

export const isSpellInSpellbook = (
  participant,
  spellId
) => {
  if (!participant || !spellId) {
    return false
  }

  return Boolean(
    participant.spellbookSpellIds?.includes(
      spellId
    )
  )
}

export const canParticipantAccessSpell = ({
  participant,
  spell,
  isPreparedCaster = false
}) => {
  if (!participant || !spell) {
    return false
  }

  if (isCantrip(spell)) {
    return isSpellKnownByParticipant(
      participant,
      spell.id
    )
  }

  if (isPreparedCaster) {
    return isSpellPreparedByParticipant(
      participant,
      spell.id
    )
  }

  return isSpellKnownByParticipant(
    participant,
    spell.id
  )
}

export const filterClassSpells = (
  spellList,
  classId
) => {
  if (!Array.isArray(spellList)) {
    return []
  }

  return spellList.filter(
    spell =>
      isSpellAvailableToClass(
        spell,
        classId
      )
  )
}

export const filterParticipantSpells = ({
  spellList,
  participant,
  isPreparedCaster = false
}) => {
  if (
    !Array.isArray(spellList) ||
    !participant
  ) {
    return []
  }

  return spellList.filter(
    spell =>
      canParticipantAccessSpell({
        participant,
        spell,
        isPreparedCaster
      })
  )
}