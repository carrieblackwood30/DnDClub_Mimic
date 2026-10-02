# Dnd Cult of Mimic — Battlefield / Spellcasting Runtime Audit v5

## Base

Based on `Dnd-Cult-of-Mimic-battlefield-fixed-v4.zip`.

## Main change

The Battlefield page no longer mounts `CombatSpellcasting.vue` directly. It now mounts the dedicated `BattlefieldSpellPanel.vue`.

`CombatSpellcasting.vue` is kept unchanged for the character page.

This isolates the Battlefield spell UI from the runtime error that occurred while clicking a spell inside the Battlefield.

## Spell mechanics retained

The Battlefield spell panel uses the existing `useCombatSpellcasting()` and `useCombat()` systems rather than duplicating the combat rules.

Supported in the panel:

- spell availability and spell slots;
- upcasting through higher-level slots;
- action / bonus-action / reaction casting time;
- spell attacks and d20 result details;
- saving throws with ability and save DC;
- automatic-hit spells such as Magic Missile;
- area saving throws for Sleep and Thunderwave;
- area direction and affected creature count;
- range, Line of Sight and total cover checks;
- target AC information;
- Sleep special handling already implemented in `useCombatSpellcasting()`;
- push effects from failed saves;
- Shield reaction through the existing `useReactionEffect()` path, preserving +5 AC and reaction usage.

## UI

The spell UI is now a compact internal panel with its own scroll area. Selecting a spell opens a small details module containing:

- range;
- attack bonus or saving throw + DC;
- target;
- distance;
- Line of Sight;
- cover;
- spell slot;
- result details.

## Verification performed

- 46 Vue SFCs compiled successfully with `@vue/compiler-sfc`.
- All `app/**/*.js` files passed `node --check`.
- Spell data scan confirmed resolution types: attack, automatic-hit, effect, reaction, saving-throw.
- Area spells detected: Sleep, Thunderwave.
- Reaction spell detected: Shield.

## Build limitation

A full `nuxt build` was attempted with the available project dependencies, but the environment's `rolldown` native binding is unavailable for Linux x64. This is an environment/dependency issue; source-level Vue and JavaScript validation completed successfully.
