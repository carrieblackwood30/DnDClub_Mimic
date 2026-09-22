export const reactions = [
  {
    id: 'shield',
    name: 'Щит',
    type: 'spell',
    spellId: 'shield',
    spellLevel: 1,
    trigger: 'incoming-attack',
    acBonus: 5,
    duration: 'until-start-of-next-turn',
    requiresHit: true,
    preventsCriticalHit: false
  }
]