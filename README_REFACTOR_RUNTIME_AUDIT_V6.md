# Dnd Cult of Mimic — runtime audit v6

## Fixes in this release

### Spell damage crash
Fixed `app/stores/combat.js` `applyDamage()` which referenced an undefined `amount` variable although the argument was named `damage`.

The function now normalizes `damage` to a non-negative number, applies it to `currentHP`, clears sleep on positive damage, and returns the applied-damage result.

### Spell result window
`BattlefieldSpellPanel.vue` now keeps the selected spell open after resolution so the result remains visible instead of immediately closing the spell view.

The result shows, depending on spell type:
- target
- d20 roll and roll mode
- attack total vs AC
- spell attack bonus
- hit / miss / critical result
- damage and damage dice
- target HP after damage
- saving throw ability, roll, total and DC
- push distance
- Sleep application/immunity
- defeated state
- area spell results per affected creature

### Spell damage application
Damage is applied only when the existing resolution says damage should be dealt. Attack spells damage only on a hit. Saving-throw spells keep the existing half/none/full damage semantics from `useCombatSpellcasting`. Area spells apply their individual resolution results. Automatic-hit spells still apply their resolved damage.

## Preserved mechanics
Only these files were changed from v5:
- `app/stores/combat.js`
- `app/components/battlefield/BattlefieldSpellPanel.vue`

`useCombatSpellcasting.js`, `CombatSpellcasting.vue`, Shield reaction, Sleep, push effects, spell-slot logic, casting-time/action/bonus-action/reaction checks, range/LoS/cover checks, attack advantage/disadvantage, critical spell damage, Extra Attack, movement, Opportunity Attack, and other combat mechanics were not rewritten.

## Validation performed
- 70 JavaScript files transpiled with the installed TypeScript compiler: no diagnostics.
- 46 Vue SFC `<script setup>` blocks transpiled: no diagnostics.
- Behavioral test for `applyDamage`: passed.
- Behavioral test for Battlefield spell resolution effects and result lines: passed.
- Checked that legacy battlefield/spell API names removed in previous refactors are absent.
- `npm ci` was attempted but exceeded the container transport timeout, so a full Nuxt browser/runtime build could not be performed in this environment.
