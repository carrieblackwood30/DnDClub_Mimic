export const reactions = [
  {
    id: 'shield',
    name: 'Щит',
    type: 'spell',
    trigger: 'incoming-attack',
    acBonus: 5,
    duration: 'until-start-of-next-turn',
    requiresHit: true,
    preventsCriticalHit: false
  }
]