export const attackProgression = {
  barbarian: {
    extraAttack: {
      5: 2
    }
  },

  bard: {
    extraAttack: {
      subclass: {
        'college-of-valor': {
          6: 2
        }
      }
    }
  },

  cleric: {
    extraAttack: null
  },

  druid: {
    extraAttack: null
  },

  fighter: {
    extraAttack: {
      5: 2,
      11: 3,
      20: 4
    }
  },

  monk: {
    extraAttack: {
      5: 2
    }
  },

  paladin: {
    extraAttack: {
      5: 2
    }
  },

  ranger: {
    extraAttack: {
      5: 2
    }
  },

  rogue: {
    extraAttack: null
  },

  sorcerer: {
    extraAttack: null
  },

  warlock: {
    extraAttack: {
      invocation: {
        id: 'thirsting-blade',
        requiredLevel: 5,
        requiredPactBoon: 'pact-of-the-blade',
        attacks: 2,
        weapon: 'pact'
      }
    }
  },

  wizard: {
    extraAttack: null
  }
}
