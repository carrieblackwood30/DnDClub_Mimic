export const spells = [
{
id: 'mage-hand',
name: 'Волшебная рука',
level: 0,
school: 'conjuration',
castingTime: '1-action',
range: '30-feet',
components: ['V', 'S'],
duration: '1-minute',
concentration: false,
ritual: false,
resolution: {
type: 'effect'
},
classes: [
'bard',
'sorcerer',
'warlock',
'wizard'
]
},
{
id: 'fire-bolt',
name: 'Огненный снаряд',
level: 0,
school: 'evocation',
castingTime: '1-action',
range: '120-feet',
components: ['V', 'S'],
duration: 'instantaneous',
concentration: false,
ritual: false,
resolution: {
type: 'attack',
attackType: 'ranged-spell'
},
damage: {
dice: '1d10',
type: 'fire',
scaling: {
characterLevels: {
5: '2d10',
11: '3d10',
17: '4d10'
}
}
},
effects: [
{
type: 'ignite-flammable-object',
requiresWornOrCarried: false
}
],
classes: [
'sorcerer',
'wizard'
]
},
{
id: 'ray-of-frost',
name: 'Луч холода',
level: 0,
school: 'evocation',
castingTime: '1-action',
range: '60-feet',
components: ['V', 'S'],
duration: 'instantaneous',
concentration: false,
ritual: false,
resolution: {
type: 'attack',
attackType: 'ranged-spell'
},
damage: {
dice: '1d8',
type: 'cold',
scaling: {
characterLevels: {
5: '2d8',
11: '3d8',
17: '4d8'
}
}
},
effects: [
{
type: 'speed-reduction',
value: 10,
unit: 'feet',
duration: 'until-start-of-caster-next-turn'
}
],
classes: [
'sorcerer',
'wizard'
]
},
{
id: 'shocking-grasp',
name: 'Электрошок',
level: 0,
school: 'evocation',
castingTime: '1-action',
range: 'touch',
components: ['V', 'S'],
duration: 'instantaneous',
concentration: false,
ritual: false,
resolution: {
type: 'attack',
attackType: 'melee-spell'
},
attackModifiers: [
{
type: 'advantage',
condition: 'target-wearing-metal-armor'
}
],
damage: {
dice: '1d8',
type: 'lightning',
scaling: {
characterLevels: {
5: '2d8',
11: '3d8',
17: '4d8'
}
}
},
effects: [
{
type: 'prevent-reaction',
duration: 'until-start-of-target-next-turn'
}
],
classes: [
'sorcerer',
'wizard'
]
},
{
id: 'light',
name: 'Свет',
level: 0,
school: 'evocation',
castingTime: '1-action',
range: 'touch',
components: ['V', 'M'],
duration: '1-hour',
concentration: false,
ritual: false,
resolution: {
type: 'effect'
},
classes: [
'bard',
'cleric',
'sorcerer',
'wizard'
]
},
{
id: 'minor-illusion',
name: 'Малая иллюзия',
level: 0,
school: 'illusion',
castingTime: '1-action',
range: '30-feet',
components: ['S', 'M'],
duration: '1-minute',
concentration: false,
ritual: false,
resolution: {
type: 'effect'
},
classes: [
'bard',
'sorcerer',
'warlock',
'wizard'
]
},
{
id: 'prestidigitation',
name: 'Фокусы',
level: 0,
school: 'transmutation',
castingTime: '1-action',
range: '10-feet',
components: ['V', 'S'],
duration: 'up-to-1-hour',
concentration: false,
ritual: false,
resolution: {
type: 'effect'
},
classes: [
'bard',
'sorcerer',
'warlock',
'wizard'
]
},
{
id: 'message',
name: 'Сообщение',
level: 0,
school: 'transmutation',
castingTime: '1-action',
range: '120-feet',
components: ['V', 'S', 'M'],
duration: '1-round',
concentration: false,
ritual: false,
resolution: {
type: 'effect'
},
classes: [
'bard',
'sorcerer',
'wizard'
]
},
{
id: 'shield',
name: 'Щит',
level: 1,
school: 'abjuration',
castingTime: 'reaction',
reactionTrigger: [
'hit-by-attack',
'targeted-by-magic-missile'
],
range: 'self',
components: ['V', 'S'],
duration: '1-round',
concentration: false,
ritual: false,
resolution: {
type: 'reaction'
},
effect: {
type: 'ac-bonus',
value: 5,
appliesToTriggeringAttack: true,
affectsCriticalHit: false
},
secondaryEffects: [
{
type: 'negate-magic-missile-damage'
}
],
classes: [
'sorcerer',
'wizard'
]
},
{
id: 'magic-missile',
name: 'Волшебная стрела',
level: 1,
school: 'evocation',
castingTime: '1-action',
range: '120-feet',
components: ['V', 'S'],
duration: 'instantaneous',
concentration: false,
ritual: false,
resolution: {
type: 'automatic-hit'
},
damage: {
dice: '1d4',
modifier: 1,
type: 'force',
instances: 3
},
scaling: {
type: 'additional-instances',
value: 1,
perSlotLevelAbove: 1
},
classes: [
'sorcerer',
'wizard'
]
},
{
id: 'detect-magic',
name: 'Обнаружение магии',
level: 1,
school: 'divination',
castingTime: '1-action',
range: 'self',
components: ['V', 'S'],
duration: '10-minutes',
concentration: true,
ritual: true,
resolution: {
type: 'effect'
},
classes: [
'bard',
'cleric',
'druid',
'paladin',
'ranger',
'sorcerer',
'wizard'
]
},
{
id: 'find-familiar',
name: 'Поиск фамильяра',
level: 1,
school: 'conjuration',
castingTime: '1-hour',
range: '10-feet',
components: ['V', 'S', 'M'],
duration: 'instantaneous',
concentration: false,
ritual: true,
resolution: {
type: 'effect'
},
classes: [
'wizard'
]
},
{
id: 'identify',
name: 'Опознание',
level: 1,
school: 'divination',
castingTime: '1-minute',
range: 'touch',
components: ['V', 'S', 'M'],
duration: 'instantaneous',
concentration: false,
ritual: true,
resolution: {
type: 'effect'
},
classes: [
'bard',
'wizard'
]
},
{
id: 'sleep',
name: 'Сон',
level: 1,
school: 'enchantment',
castingTime: '1-action',
range: '90-feet',
components: ['V', 'S', 'M'],
duration: '1-minute',
concentration: false,
ritual: false,
resolution: {
type: 'special'
},
special: {
type: 'sleep-pool',
dice: '5d8',
targetType: 'creature',
radius: 20,
affectsUnconscious: false,
immunityConditions: [
'undead',
'immune-to-charmed'
],
selection: 'lowest-current-hp-first',
subtractCurrentHitPoints: true,
effect: {
type: 'unconscious',
duration: '1-minute',
endsOnDamage: true,
endsOnActionWake: true
}
},
scaling: {
type: 'additional-dice',
dice: '2d8',
perSlotLevelAbove: 1
},
classes: [
'bard',
'sorcerer',
'wizard'
]
},
{
id: 'thunderwave',
name: 'Громовая волна',
level: 1,
school: 'evocation',
castingTime: '1-action',
range: 'self',
area: {
type: 'cube',
size: 15,
unit: 'feet'
},
components: ['V', 'S'],
duration: 'instantaneous',
concentration: false,
ritual: false,
resolution: {
type: 'saving-throw',
ability: 'constitution'
},
damage: {
dice: '2d8',
type: 'thunder',
onSave: 'half'
},
effects: [
{
type: 'push',
distance: 10,
unit: 'feet',
on: 'failed-save'
}
],
scaling: {
type: 'additional-dice',
dice: '1d8',
perSlotLevelAbove: 1
},
secondaryEffects: [
{
type: 'push-unsecured-objects',
distance: 10,
unit: 'feet'
},
{
type: 'sound',
audibleRange: 300,
unit: 'feet'
}
],
classes: [
'bard',
'druid',
'sorcerer',
'wizard'
]
}
]
