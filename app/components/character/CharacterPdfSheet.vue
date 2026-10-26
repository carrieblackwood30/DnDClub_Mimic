
<script setup>
import { computed, ref, nextTick } from 'vue'
import { skills } from '~/data/skills'
import { spells as spellCatalog } from '~/data/spells'
import { getAbilityModifier } from '~/domain/character/statRules'

const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const sheet = ref(null)
const characterRef = computed(() => props.character)

const {
  race,
  subrace,
  characterClass,
  subclass,
  armor,
  shield,
  weapon,
  selectedSkills
} = useSavedCharacterData(characterRef)

const { maxHitPoints } = useSavedCharacterHP(
  characterRef,
  characterClass
)

const { armorClass } = useSavedCharacterAC(
  characterRef,
  armor,
  shield
)

const {
  abilityModifiers,
  proficiencyBonus,
  getSkillModifier
} = useSavedCharacterStats(characterRef)

const { savingThrows } = useSavedCharacterSaves(
  characterRef,
  characterClass
)

const abilities = [
  { id: 'strength', name: 'Сила', short: 'СИЛ' },
  { id: 'dexterity', name: 'Ловкость', short: 'ЛОВ' },
  { id: 'constitution', name: 'Телосложение', short: 'ТЕЛ' },
  { id: 'intelligence', name: 'Интеллект', short: 'ИНТ' },
  { id: 'wisdom', name: 'Мудрость', short: 'МДР' },
  { id: 'charisma', name: 'Харизма', short: 'ХАР' }
]

const damageTypeNames = {
  acid: 'кислота',
  cold: 'холод',
  fire: 'огонь',
  lightning: 'электричество',
  poison: 'яд',
  necrotic: 'некротическая энергия',
  radiant: 'излучение',
  psychic: 'психическая энергия',
  thunder: 'звук',
  force: 'силовое поле',
  bludgeoning: 'дробящий',
  piercing: 'колющий',
  slashing: 'рубящий'
}

const characterName = computed(() =>
  props.character.name?.trim() || 'Безымянный герой'
)

const movementSpeed = computed(() =>
  subrace.value?.speed ?? race.value?.speed ?? 30
)

const initiative = computed(() =>
  abilityModifiers.value?.dexterity ?? 0
)

const passivePerception = computed(() => {
  const perception = skills.find(skill => skill.id === 'perception')

  return 10 + (perception ? getSkillModifier(perception) : 0)
})

const hitDice = computed(() => {
  const die = characterClass.value?.hitDie ?? 8

  return `${props.character.level ?? 1}к${die}`
})

const formatModifier = value => {
  const number = Number(value ?? 0)

  return number >= 0 ? `+${number}` : String(number)
}

const humanizeId = value => {
  if (!value) return 'Не указано'

  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const allSkills = computed(() =>
  skills.map(skill => ({
    ...skill,
    modifier: getSkillModifier(skill),
    proficient: props.character.selectedSkills?.includes(skill.id) ?? false
  }))
)

const skillColumns = computed(() => [
  allSkills.value.slice(0, 9),
  allSkills.value.slice(9)
])

const savingThrowNames = computed(() =>
  savingThrows.value.map(save => ({
    ...save,
    name: abilities.find(item => item.id === save.ability)?.name ?? save.ability
  }))
)

const spellEntries = computed(() => {
  const character = props.character

  const cantrips = character.knownCantripIds ?? []
  const known = character.knownSpellIds ?? []
  const prepared = character.preparedSpellIds ?? []
  const spellbook = character.spellbookSpellIds ?? []

  const ids = [...new Set([
    ...cantrips,
    ...known,
    ...prepared,
    ...spellbook
  ])]

  return ids
    .map(id => {
      const spell = spellCatalog.find(item => item.id === id)

      return {
        id,
        name: spell?.name ?? humanizeId(id),
        level: spell?.level ?? (cantrips.includes(id) ? 0 : 1),
        prepared: prepared.includes(id),
        known: known.includes(id),
        inSpellbook: spellbook.includes(id),
        isCantrip: cantrips.includes(id) || spell?.level === 0
      }
    })
    .sort((a, b) =>
      a.level - b.level || a.name.localeCompare(b.name, 'ru')
    )
})

const spellSlots = computed(() =>
  (props.character.spellSlots ?? [])
    .map((count, index) => ({
      level: index + 1,
      count: Number(count) || 0
    }))
    .filter(slot => slot.count > 0)
)

const characterTraits = computed(() => {
  const all = [
    ...(subrace.value?.traits ?? []),
    ...(race.value?.traits ?? [])
  ]

  const used = new Set()

  return all.filter(trait => {
    const key = trait.id ?? trait.name ?? trait.type

    if (used.has(key)) return false

    used.add(key)
    return true
  })
})

const featureDetail = trait => {
  const details = []

  if (trait.range) {
    details.push(`Дальность: ${trait.range} фт.`)
  }

  if (trait.damageType) {
    details.push(
      `Тип урона: ${damageTypeNames[trait.damageType] ?? trait.damageType}`
    )
  }

  if (trait.damageResistance) {
    const resistance = Array.isArray(trait.damageResistance)
      ? trait.damageResistance
      : [trait.damageResistance]

    details.push(
      `Сопротивление: ${resistance.map(
        type => damageTypeNames[type] ?? type
      ).join(', ')}`
    )
  }

  if (trait.cantrip?.id) {
    const spell = spellCatalog.find(item => item.id === trait.cantrip.id)

    details.push(`Заговор: ${spell?.name ?? humanizeId(trait.cantrip.id)}`)
  }

  if (trait.spell) {
    const spell = spellCatalog.find(item => item.id === trait.spell)

    details.push(`Заклинание: ${spell?.name ?? humanizeId(trait.spell)}`)
  }

  if (trait.spells?.length) {
    details.push(
      `Заклинания: ${trait.spells.map(spell => {
        const found = spellCatalog.find(item => item.id === spell.id)
        return found?.name ?? humanizeId(spell.id)
      }).join(', ')}`
    )
  }

  if (trait.type === 'breath-weapon') {
    details.push('Конус 15 фт. или линия 30 × 5 фт.')
  }

  if (trait.type === 'temporary-flight') {
    details.push('Полёт на 10 минут; восстановление после продолжительного отдыха.')
  }

  if (trait.value && trait.perLevel) {
    details.push(`+${trait.value} ОЗ за уровень`)
  }

  return details.join(' · ') ||
    trait.description ||
    humanizeId(trait.type)
}

const feats = computed(() =>
  (props.character.feats ?? []).map(feat =>
    typeof feat === 'string'
      ? humanizeId(feat)
      : feat.name ?? humanizeId(feat.id)
  )
)

const filename = computed(() => {
  const safeName = characterName.value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .trim()

  return `Cult of Mimic - ${safeName || 'Герой'}.pdf`
})

const download = async () => {
  if (!sheet.value) {
    throw new Error('Не найден шаблон листа персонажа')
  }

  await nextTick()

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await new Promise(resolve => requestAnimationFrame(resolve))

  const imported = await import('html2pdf.js')
  const html2pdf = imported.default ?? imported

  await html2pdf()
    .set({
      filename: filename.value,
      margin: 0,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
    html2canvas: {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#f2e7d0',
    windowWidth: 794,
    scrollX: 0,
    scrollY: 0
    },
    jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true
    },
    pagebreak: {
    mode: []
    }
    })
    .from(sheet.value)
    .save()
}

defineExpose({ download })
</script>

<template>
  <Teleport to="body">
    <div class="pdf-capture-host" aria-hidden="true">
      <div ref="sheet" class="pdf-document">
        <section class="pdf-page pdf-page-one">
          <header class="pdf-brand">
            <div class="pdf-emblem">✦</div>

            <div class="pdf-brand-text">
              <div class="pdf-eyebrow">CULT OF MIMIC</div>
              <div class="pdf-brand-title">Книга героя</div>
              <div class="pdf-muted">Лист персонажа · Dungeons & Dragons</div>
            </div>

            <div class="pdf-brand-mark">ЗАПИСЬ № {{ character.level }}</div>
          </header>

          <section class="pdf-identity pdf-panel">
            <div class="pdf-identity-main">
              <div class="pdf-label">ИМЯ ГЕРОЯ</div>
              <h1>{{ characterName }}</h1>

              <p class="pdf-class-line">
                {{ characterClass?.name ?? 'Класс не выбран' }}
                <span>✦</span>
                {{ subclass?.name ?? 'Подкласс не выбран' }}
              </p>
            </div>

            <div class="pdf-level-seal">
              <span>УРОВЕНЬ</span>
              <strong>{{ character.level ?? 1 }}</strong>
            </div>

            <div class="pdf-identity-details">
              <div>
                <span>Раса</span>
                <strong>
                  {{ race?.name ?? 'Не выбрана' }}
                  <template v-if="subrace"> · {{ subrace.name }}</template>
                </strong>
              </div>

              <div>
                <span>Предыстория</span>
                <strong>{{ humanizeId(character.backgroundId) }}</strong>
              </div>

              <div>
                <span>Опыт</span>
                <strong>{{ character.experiencePoints ?? 0 }} XP</strong>
              </div>
            </div>
          </section>

          <section class="pdf-stat-strip">
            <div class="pdf-stat-card">
              <span>КЗ</span>
              <strong>{{ armorClass }}</strong>
              <small>Класс защиты</small>
            </div>

            <div class="pdf-stat-card">
              <span>ОЗ</span>
              <strong>{{ maxHitPoints }}</strong>
              <small>Максимум хитов</small>
            </div>

            <div class="pdf-stat-card">
              <span>ИНИЦИАТИВА</span>
              <strong>{{ formatModifier(initiative) }}</strong>
              <small>Модификатор ЛОВ</small>
            </div>

            <div class="pdf-stat-card">
              <span>СКОРОСТЬ</span>
              <strong>{{ movementSpeed }}</strong>
              <small>футов за ход</small>
            </div>

            <div class="pdf-stat-card">
              <span>МАСТЕРСТВО</span>
              <strong>{{ formatModifier(proficiencyBonus) }}</strong>
              <small>Бонус владения</small>
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-section-heading">
              <span>01</span>
              <h2>Характеристики</h2>
              <i></i>
            </div>

            <div class="pdf-abilities">
              <div
                v-for="ability in abilities"
                :key="ability.id"
                class="pdf-ability"
              >
                <div class="pdf-ability-name">{{ ability.short }}</div>
                <div class="pdf-ability-score">
                  {{ character.abilityScores?.[ability.id] ?? 10 }}
                </div>
                <div class="pdf-ability-mod">
                  {{ formatModifier(abilityModifiers?.[ability.id] ?? 0) }}
                </div>
              </div>
            </div>
          </section>

          <div class="pdf-main-columns">
            <section class="pdf-panel pdf-section-panel">
              <div class="pdf-section-heading">
                <span>02</span>
                <h2>Спасброски</h2>
              </div>

              <div
                v-for="save in savingThrowNames"
                :key="save.ability"
                class="pdf-row"
              >
                <span class="pdf-proficiency-dot">
                  {{ save.isProficient ? '◆' : '◇' }}
                </span>

                <span class="pdf-row-name">{{ save.name }}</span>

                <strong>{{ formatModifier(save.modifier) }}</strong>
              </div>

              <div class="pdf-divider"></div>

              <div class="pdf-passive">
                <span>Пассивное восприятие</span>
                <strong>{{ passivePerception }}</strong>
              </div>

              <div class="pdf-passive">
                <span>Кость хитов</span>
                <strong>{{ hitDice }}</strong>
              </div>
            </section>

            <section class="pdf-panel pdf-section-panel">
              <div class="pdf-section-heading">
                <span>03</span>
                <h2>Навыки</h2>
              </div>

              <div class="pdf-skill-columns">
                <div
                  v-for="(column, columnIndex) in skillColumns"
                  :key="columnIndex"
                  class="pdf-skill-column"
                >
                  <div
                    v-for="skill in column"
                    :key="skill.id"
                    class="pdf-row pdf-skill-row"
                  >
                    <span class="pdf-proficiency-dot">
                      {{ skill.proficient ? '◆' : '◇' }}
                    </span>

                    <span class="pdf-row-name">{{ skill.name }}</span>

                    <strong>{{ formatModifier(skill.modifier) }}</strong>
                  </div>
                </div>
              </div>

              <div class="pdf-legend">
                <span>◆ Владение</span>
                <span>◇ Без владения</span>
              </div>
            </section>
          </div>

          <div class="pdf-lower-columns">
            <section class="pdf-panel pdf-section-panel">
              <div class="pdf-section-heading">
                <span>04</span>
                <h2>Оружие и атаки</h2>
              </div>

              <template v-if="weapon">
                <div class="pdf-item-title">{{ weapon.name }}</div>

                <div class="pdf-weapon-stats">
                  <div>
                    <span>Урон</span>
                    <strong>{{ weapon.damage ?? '—' }}</strong>
                  </div>

                  <div>
                    <span>Тип</span>
                    <strong>
                      {{ damageTypeNames[weapon.damageType] ?? weapon.damageType ?? '—' }}
                    </strong>
                  </div>

                  <div v-if="weapon.range">
                    <span>Дистанция</span>
                    <strong>
                      {{ weapon.range.normal }} / {{ weapon.range.long }} фт.
                    </strong>
                  </div>
                </div>

                <p class="pdf-muted">
                  {{ weapon.properties?.map(humanizeId).join(', ') || 'Без особых свойств' }}
                </p>
              </template>

              <p v-else class="pdf-empty">
                Оружие не выбрано.
              </p>

              <div class="pdf-divider"></div>

              <div class="pdf-passive">
                <span>Бонус мастерства</span>
                <strong>{{ formatModifier(proficiencyBonus) }}</strong>
              </div>
            </section>

            <section class="pdf-panel pdf-section-panel">
              <div class="pdf-section-heading">
                <span>05</span>
                <h2>Экипировка</h2>
              </div>

              <div class="pdf-equipment-row">
                <span>Броня</span>
                <strong>{{ armor?.name ?? 'Не выбрана' }}</strong>
              </div>

              <div class="pdf-equipment-row">
                <span>Щит</span>
                <strong>{{ shield?.name ?? 'Не используется' }}</strong>
              </div>

              <div class="pdf-equipment-row">
                <span>Оружие</span>
                <strong>{{ weapon?.name ?? 'Не выбрано' }}</strong>
              </div>

              <div class="pdf-equipment-row">
                <span>Навыков с владением</span>
                <strong>{{ selectedSkills.length }}</strong>
              </div>
            </section>
          </div>

          <footer class="pdf-footer">
            <span>CULT OF MIMIC</span>
            <span>Твоя легенда. Твои правила. Твоя судьба.</span>
            <span>01</span>
          </footer>
        </section>

        <section class="pdf-page pdf-page-two">
          <header class="pdf-brand">
            <div class="pdf-emblem">✦</div>

            <div class="pdf-brand-text">
              <div class="pdf-eyebrow">CULT OF MIMIC</div>
              <div class="pdf-brand-title">{{ characterName }}</div>
              <div class="pdf-muted">Особенности, магия и заметки</div>
            </div>

            <div class="pdf-brand-mark">УРОВЕНЬ {{ character.level }}</div>
          </header>

          <div class="pdf-detail-columns">
            <div class="pdf-detail-column">
              <section class="pdf-panel pdf-section-panel">
                <div class="pdf-section-heading">
                  <span>06</span>
                  <h2>Заклинания</h2>
                </div>

                <div v-if="spellSlots.length" class="pdf-spell-slots">
                  <div
                    v-for="slot in spellSlots"
                    :key="slot.level"
                    class="pdf-slot"
                  >
                    <span>{{ slot.level }} круг</span>
                    <strong>{{ slot.count }}</strong>
                  </div>
                </div>

                <div
                  v-if="spellEntries.length"
                  class="pdf-spell-list"
                >
                  <div
                    v-for="spell in spellEntries"
                    :key="spell.id"
                    class="pdf-spell-row"
                  >
                    <div class="pdf-spell-level">
                      {{ spell.isCantrip ? 'ЗАГОВОР' : `${spell.level} КРУГ` }}
                    </div>

                    <div class="pdf-spell-info">
                      <strong>{{ spell.name }}</strong>

                      <small>
                        {{
                          spell.prepared
                            ? 'Подготовлено'
                            : spell.known
                              ? 'Известно'
                              : spell.inSpellbook
                                ? 'В книге заклинаний'
                                : 'Врождённая магия'
                        }}
                      </small>
                    </div>
                  </div>
                </div>

                <p v-else class="pdf-empty">
                  Заклинания не записаны.
                </p>
              </section>

              <section class="pdf-panel pdf-section-panel">
                <div class="pdf-section-heading">
                  <span>07</span>
                  <h2>Черты и особенности</h2>
                </div>

                <div
                  v-for="(trait, index) in characterTraits"
                  :key="trait.id ?? index"
                  class="pdf-feature"
                >
                  <strong>{{ trait.name ?? humanizeId(trait.type) }}</strong>
                  <p>{{ featureDetail(trait) }}</p>
                </div>

                <p v-if="!characterTraits.length" class="pdf-empty">
                  Особенности не указаны.
                </p>
              </section>
            </div>

            <div class="pdf-detail-column">
              <section class="pdf-panel pdf-section-panel">
                <div class="pdf-section-heading">
                  <span>08</span>
                  <h2>Черты персонажа</h2>
                </div>

                <div
                  v-for="(feat, index) in feats"
                  :key="`${feat}-${index}`"
                  class="pdf-feature"
                >
                  <strong>{{ feat }}</strong>
                </div>

                <p v-if="!feats.length" class="pdf-empty">
                  Дополнительные черты не выбраны.
                </p>
              </section>

              <section class="pdf-panel pdf-section-panel">
                <div class="pdf-section-heading">
                  <span>09</span>
                  <h2>Записи и заметки</h2>
                </div>

                <div class="pdf-note-label">История героя</div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>

                <div class="pdf-note-label">Союзники, цели и сокровища</div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>
                <div class="pdf-writing-line"></div>
              </section>

              <section class="pdf-panel pdf-section-panel">
                <div class="pdf-section-heading">
                  <span>✦</span>
                  <h2>Памятка героя</h2>
                </div>

                <div class="pdf-passive">
                  <span>Уровень</span>
                  <strong>{{ character.level }}</strong>
                </div>

                <div class="pdf-passive">
                  <span>Опыт</span>
                  <strong>{{ character.experiencePoints ?? 0 }}</strong>
                </div>

                <div class="pdf-passive">
                  <span>Класс</span>
                  <strong>{{ characterClass?.name ?? 'Не выбран' }}</strong>
                </div>
              </section>
            </div>
          </div>

          <footer class="pdf-footer">
            <span>CULT OF MIMIC</span>
            <span>Даже у самого хитрого мимика есть своя история.</span>
            <span>02</span>
          </footer>
        </section>
      </div>
    </div>
  </Teleport>
</template>


<style>
.pdf-capture-host {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 794px;
  margin: 0;
  padding: 0;
  pointer-events: none;
}

.pdf-document,
.pdf-document * {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  font-style: normal;
}

.pdf-document {
  width: 794px;
  margin: 0;
  padding: 0;
  color: #302318;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.4;
  background: #f2e7d0;
}

.pdf-document h1,
.pdf-document h2,
.pdf-document p {
  margin-bottom: 0;
}

.pdf-page {
  position: relative;
  box-sizing: border-box;
  width: 794px;
  min-height: 1122px;
  margin: 0;
  padding: 27px;
  overflow-wrap: anywhere;
  color: #302318;
  background: #f2e7d0;
  border: 8px solid #35271c;
  box-shadow: inset 0 0 0 2px #a77b3f;
}

.pdf-page + .pdf-page {
  margin-top: 0;
}

.pdf-brand {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 12px;
  border-bottom: 2px solid #a77b3f;
}

.pdf-emblem {
  display: flex;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  border: 2px solid #9b733c;
  border-radius: 50%;
  background: #26392d;
  color: #ead6a5;
  font-size: 25px;
}

.pdf-brand-text {
  flex: 1;
  min-width: 0;
}

.pdf-eyebrow {
  color: #786039;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
}

.pdf-brand-title {
  margin-top: 3px;
  color: #302318;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.2;
}

.pdf-muted {
  margin-top: 4px;
  color: #806d53;
  font-size: 10px;
  line-height: 1.45;
}

.pdf-brand-mark {
  max-width: 125px;
  padding: 7px;
  border: 1px solid #b89a64;
  color: #66502f;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
  overflow-wrap: anywhere;
}

.pdf-panel {
  min-width: 0;
  border: 1px solid #bda77e;
  border-radius: 5px;
  background: rgba(255, 250, 238, 0.63);
}

.pdf-identity {
  position: relative;
  margin-top: 13px;
  padding: 13px;
}

.pdf-identity-main {
  min-width: 0;
  padding-right: 84px;
}

.pdf-label {
  color: #806039;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.pdf-identity h1 {
  margin-top: 5px;
  color: #302318;
  font-size: 27px;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.pdf-class-line {
  margin-top: 6px;
  color: #634d33;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.5;
}

.pdf-class-line span {
  padding: 0 4px;
  color: #a77b3f;
}

.pdf-level-seal {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  width: 66px;
  height: 66px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #9d773e;
  border-radius: 50%;
  background: #293b2d;
  color: #f2e3c0;
}

.pdf-level-seal span {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pdf-level-seal strong {
  margin-top: 2px;
  font-size: 25px;
  line-height: 1.15;
}

.pdf-identity-details {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #d4c19b;
}

.pdf-identity-details > div {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  gap: 4px;
}

.pdf-identity-details span {
  color: #826b4a;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pdf-identity-details strong {
  font-size: 10px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.pdf-stat-strip {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.pdf-stat-card {
  display: flex;
  min-width: 0;
  min-height: 72px;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 3px;
  border: 1px solid #c3ad83;
  border-radius: 5px;
  background: #e8dbc0;
  text-align: center;
}

.pdf-stat-card span {
  color: #826b4a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.2px;
  overflow-wrap: anywhere;
}

.pdf-stat-card strong {
  margin-top: 4px;
  color: #293b2d;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}

.pdf-stat-card small {
  margin-top: 4px;
  color: #826b4a;
  font-size: 7px;
  line-height: 1.3;
}

.pdf-section {
  min-width: 0;
  margin-top: 14px;
}

.pdf-section-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #baa074;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-section-heading > span {
  display: flex;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #293b2d;
  color: #f2e4c4;
  font-size: 8px;
  font-weight: 700;
}

.pdf-section-heading h2 {
  min-width: 0;
  margin-top: 0;
  color: #433020;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
}

.pdf-section-heading i {
  height: 1px;
  flex: 1 1 auto;
  background: #d0bc92;
}

.pdf-abilities {
  display: flex;
  gap: 7px;
}

.pdf-ability {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  padding: 7px 3px;
  border: 1px solid #bba276;
  border-radius: 5px;
  background: #e9dcc1;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-ability-name {
  color: #75603e;
  font-size: 8px;
  font-weight: 700;
}

.pdf-ability-score {
  margin-top: 4px;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.15;
}

.pdf-ability-mod {
  min-width: 42px;
  margin-top: 4px;
  padding: 4px 2px;
  border-radius: 4px;
  background: #293b2d;
  color: #f5e8c9;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.pdf-main-columns,
.pdf-lower-columns,
.pdf-detail-columns {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
}

.pdf-main-columns > :first-child {
  flex: 0 0 34%;
  width: auto;
  min-width: 0;
}

.pdf-main-columns > :last-child {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
}

.pdf-lower-columns > * {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
}

.pdf-section-panel {
  padding: 10px;
}

.pdf-section-panel .pdf-section-heading {
  margin-bottom: 6px;
}

.pdf-row {
  display: flex;
  min-width: 0;
  min-height: 21px;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid rgba(178, 151, 105, 0.28);
  font-size: 8.5px;
  line-height: 1.35;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-proficiency-dot {
  width: 10px;
  flex: 0 0 10px;
  color: #5e7849;
  font-size: 7px;
  text-align: center;
}

.pdf-row-name {
  min-width: 0;
  flex: 1 1 auto;
  overflow-wrap: anywhere;
}

.pdf-row strong {
  flex: 0 0 auto;
  color: #293b2d;
  font-size: 9px;
  font-weight: 700;
}

.pdf-divider {
  height: 1px;
  margin: 8px 0;
  background: #cdb991;
}

.pdf-passive,
.pdf-equipment-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 0;
  font-size: 8.5px;
  line-height: 1.4;
}

.pdf-passive span,
.pdf-equipment-row span {
  min-width: 0;
  flex: 1 1 auto;
  color: #826b4a;
}

.pdf-passive strong,
.pdf-equipment-row strong {
  min-width: 0;
  max-width: 58%;
  color: #3d2f20;
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}

.pdf-skill-columns {
  display: flex;
  min-width: 0;
  gap: 6px;
}

.pdf-skill-column {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  width: 0;
  min-width: 0;
}

.pdf-skill-row {
  min-height: 20px;
  gap: 3px;
  font-size: 7.5px;
}

.pdf-skill-row .pdf-row-name {
  overflow-wrap: anywhere;
}

.pdf-skill-row strong {
  font-size: 8px;
}

.pdf-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 7px;
  color: #846c49;
  font-size: 7px;
}

.pdf-item-title {
  margin: 6px 0;
  color: #293b2d;
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pdf-weapon-stats {
  display: flex;
  gap: 8px;
  margin-top: 7px;
}

.pdf-weapon-stats > div {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  gap: 3px;
}

.pdf-weapon-stats span {
  color: #826b4a;
  font-size: 8px;
}

.pdf-weapon-stats strong {
  font-size: 10px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pdf-empty {
  color: #927b5a;
  font-size: 9px;
  line-height: 1.5;
}

.pdf-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 13px;
  padding-top: 7px;
  border-top: 1px solid #bda276;
  color: #806744;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.pdf-footer span:nth-child(2) {
  flex: 1 1 auto;
  font-weight: 400;
  letter-spacing: 0;
  text-align: center;
}

.pdf-footer span:last-child {
  flex: 0 0 auto;
}

.pdf-detail-columns > :first-child {
  flex: 0 0 55%;
  width: auto;
  min-width: 0;
}

.pdf-detail-columns > :last-child {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
}

.pdf-detail-column {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.pdf-spell-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 7px;
}

.pdf-slot {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  border: 1px solid #c0a779;
  border-radius: 4px;
  font-size: 8px;
}

.pdf-slot strong {
  color: #293b2d;
  font-weight: 700;
}

.pdf-spell-row {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 7px;
  padding: 6px 0;
  border-bottom: 1px solid #dfcfac;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-spell-level {
  min-width: 52px;
  flex: 0 0 52px;
  padding: 5px 2px;
  border-radius: 3px;
  background: #e4d4b4;
  color: #6e5937;
  font-size: 7px;
  font-weight: 700;
  text-align: center;
}

.pdf-spell-info {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 3px;
}

.pdf-spell-info strong {
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.pdf-spell-info small {
  color: #8a714a;
  font-size: 8px;
  line-height: 1.35;
}

.pdf-feature {
  padding: 7px 0;
  border-bottom: 1px solid #dfcfac;
  break-inside: avoid;
  page-break-inside: avoid;
}

.pdf-feature strong {
  color: #3e5038;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.pdf-feature p {
  margin-top: 4px;
  color: #806b4d;
  font-size: 9px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.pdf-note-label {
  margin-top: 9px;
  margin-bottom: 4px;
  color: #826b4a;
  font-size: 9px;
  font-weight: 700;
}

.pdf-writing-line {
  height: 24px;
  border-bottom: 1px solid #d3c19a;
}

@media print {
  .pdf-page {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>