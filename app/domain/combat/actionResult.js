export const createAttackResult = ({
  sourceId,
  targetId,
  roll,
  modifier,
  total,
  targetAC,
  hit,
  critical = false,
  damage = null,
  effects = []
}) => ({
  type: 'attack',
  sourceId,
  targetId,
  roll,
  modifier,
  total,
  targetAC,
  hit,
  critical,
  damage,
  effects
})

export const createSavingThrowResult = ({
  sourceId,
  targetId,
  ability,
  roll,
  modifier,
  total,
  dc,
  success,
  damage = null,
  effects = []
}) => ({
  type: 'saving-throw',
  sourceId,
  targetId,
  ability,
  roll,
  modifier,
  total,
  dc,
  success,
  damage,
  effects
})