<script setup>
const characterCreator = useCharacterCreatorStore()
const charactersStore = useCharactersStore()

const { abilityScores } = useCharacterStats()
const { initializeSpellSlots } = useCharacterSpellSlots()
const { initializeSpellbook } = useCharacterSpellcasting()

const creationChecklist = computed(() => [
  {
    label: 'Имя',
    ready: Boolean(
      characterCreator.name?.trim()
    )
  },
  {
    label: 'Раса',
    ready: Boolean(
      characterCreator.raceId
    )
  },
  {
    label: 'Класс',
    ready: Boolean(
      characterCreator.classId
    )
  },
  {
    label: 'Предыстория',
    ready: Boolean(
      characterCreator.backgroundId
    )
  }
])

const hasBasicSetupWarnings = computed(() => {
  return creationChecklist.value.some(
    item => !item.ready
  )
})

const createCharacter = () => {
  initializeSpellSlots()
  initializeSpellbook()

  const character = characterCreator.createCharacter(
    abilityScores.value
  )

  character.id = crypto.randomUUID()

  charactersStore.addCharacter(character)

  console.log('Создан персонаж:', character)
}

const levelsRoman = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX'
]
</script>

<template>
  <div
    class="min-h-screen overflow-x-clip bg-[#080604] text-[#dfd0b4]"
  >
    <!-- Атмосферный фон -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(54,77,42,0.20),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(104,73,36,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(61,39,20,0.18),transparent_35%)]"
    />

    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-20 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_24px,rgba(136,99,54,0.035)_25px,transparent_26px)]"
    />

    <!-- Верхняя панель -->
    <header
      class="sticky top-0 z-50 border-b border-[#4a3520] bg-[#100b07]/95 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#80603a] bg-[radial-gradient(circle,#382716,#130c07)] text-xl text-[#d7b26d] shadow-[inset_0_1px_rgba(255,255,255,0.06),0_5px_18px_rgba(0,0,0,0.3)]"
          >
            ✦
          </div>

          <div class="min-w-0">
            <div
              class="text-[9px] font-black tracking-[0.35em] text-[#bb8d4d]"
            >
              CULT OF MIMIC
            </div>

            <h1
              class="truncate text-xl font-black tracking-tight text-[#e9dcc2] sm:text-2xl"
            >
              Книга героя
            </h1>

            <p
              class="hidden text-[11px] text-[#78664f] sm:block"
            >
              Создание нового персонажа
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <div
            class="hidden rounded-lg border border-[#46331f] bg-[#171008] px-3 py-2 text-right sm:block"
          >
            <div
              class="text-[8px] font-black uppercase tracking-[0.18em] text-[#715d45]"
            >
              Герой
            </div>

            <div
              class="max-w-[170px] truncate text-sm font-bold text-[#c9b28e]"
            >
              {{
                characterCreator.name ||
                'Без имени'
              }}
            </div>
          </div>

          <div
            class="rounded-lg border border-[#70532f] bg-[#24170c] px-3 py-2 text-center"
          >
            <div
              class="text-[8px] font-black uppercase tracking-[0.15em] text-[#786247]"
            >
              Уровень
            </div>

            <div
              class="text-lg font-black leading-none text-[#dab56d]"
            >
              {{ characterCreator.level }}
            </div>
          </div>
        </div>
      </div>
    </header>

  <main
    class="relative z-10 mx-auto grid max-w-[1550px] grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8 lg:py-8"
  >
    <aside
      class="self-start lg:sticky lg:top-24 lg:z-20"
    >
      <div
        class="rounded-2xl border border-[#554027] bg-[linear-gradient(145deg,#24170d,#120a06)] shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
      >
        <!-- Заголовок -->
        <div
          class="border-b border-[#3d2b1b] bg-[#181008]/80 px-5 py-5"
        >
          <div
            class="text-[11px] font-black uppercase tracking-[0.18em] text-[#b1844d]"
          >
            Перед созданием
          </div>

          <h2
            class="mt-1 text-xl font-black text-[#e5d6ba]"
          >
            Проверь героя
          </h2>

          <p
            class="mt-2 text-sm leading-relaxed text-[#917d63]"
          >
            Убедись, что основные данные заполнены и
            ты не забыл подготовить персонажа к приключению.
          </p>
        </div>

        <div class="space-y-4 p-4">
          <!-- Герой -->
          <div
            class="rounded-xl border border-[#3b2919] bg-[#100905]/80 p-4"
          >
            <div
              class="text-[11px] font-black uppercase tracking-[0.14em] text-[#776047]"
            >
              Твой герой
            </div>

            <div
              class="mt-2 truncate text-base font-bold text-[#dcc8a6]"
            >
              {{
                characterCreator.name ||
                'Имя ещё не выбрано'
              }}
            </div>

            <div
              class="mt-3 flex items-center justify-between border-t border-[#2d2015] pt-3"
            >
              <span
                class="text-sm text-[#806d56]"
              >
                Уровень
              </span>

              <span
                class="text-lg font-black text-[#d2aa65]"
              >
                {{ characterCreator.level }}
              </span>
            </div>
          </div>

          <!-- Основные данные -->
          <div
            class="rounded-xl border border-[#3b2919] bg-[#100905]/80 p-4"
          >
            <div
              class="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#776047]"
            >
              Основные данные
            </div>

            <div class="space-y-2">
              <div
                v-for="item in creationChecklist"
                :key="item.label"
                class="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                :class="
                  item.ready
                    ? 'bg-[#1a2717]/60'
                    : 'bg-[#26160e]/70'
                "
              >
                <span
                  class="text-sm font-medium"
                  :class="
                    item.ready
                      ? 'text-[#a9b694]'
                      : 'text-[#a18769]'
                  "
                >
                  {{ item.label }}
                </span>

                <span
                  class="text-base font-black"
                  :class="
                    item.ready
                      ? 'text-[#8fad76]'
                      : 'text-[#be8146]'
                  "
                >
                  {{ item.ready ? '✓' : '!' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Что проверить -->
          <div
            class="rounded-xl border border-[#3b2919] bg-[#100905]/80 p-4"
          >
            <div
              class="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#776047]"
            >
              Не забудь проверить
            </div>

            <div class="space-y-1">
              <a
                href="#abilities"
                class="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[#a38c6d] transition hover:bg-[#21150b] hover:text-[#d5ba83]"
              >
                Характеристики
              </a>

              <a
                href="#skills"
                class="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[#a38c6d] transition hover:bg-[#21150b] hover:text-[#d5ba83]"
              >
                Навыки и владения
              </a>

              <a
                href="#equipment"
                class="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[#a38c6d] transition hover:bg-[#21150b] hover:text-[#d5ba83]"
              >
                Экипировка
              </a>

              <a
                href="#spells"
                class="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[#a38c6d] transition hover:bg-[#21150b] hover:text-[#d5ba83]"
              >
                Заклинания и ячейки
              </a>

              <a
                href="#combat"
                class="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[#a38c6d] transition hover:bg-[#21150b] hover:text-[#d5ba83]"
              >
                Оружие и бой
              </a>
            </div>
          </div>

          <!-- Состояние -->
          <div
            class="rounded-xl border p-4"
            :class="
              hasBasicSetupWarnings
                ? 'border-[#604427] bg-[#28170d]'
                : 'border-[#45563b] bg-[#182115]'
            "
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 text-lg"
                :class="
                  hasBasicSetupWarnings
                    ? 'text-[#c2874b]'
                    : 'text-[#91ae78]'
                "
              >
                {{ hasBasicSetupWarnings ? '⚠' : '✓' }}
              </div>

              <div>
                <div
                  class="text-sm font-bold"
                  :class="
                    hasBasicSetupWarnings
                      ? 'text-[#d1a16b]'
                      : 'text-[#aac097]'
                  "
                >
                  {{
                    hasBasicSetupWarnings
                      ? 'Нужно кое-что заполнить'
                      : 'Основные данные готовы'
                  }}
                </div>

                <div
                  class="mt-1.5 text-xs leading-relaxed text-[#857158]"
                >
                  {{
                    hasBasicSetupWarnings
                      ? 'Проверь имя, расу, класс и предысторию.'
                      : 'Теперь проверь характеристики, снаряжение и магию.'
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

      <!-- Книга -->
      <section class="min-w-0 space-y-5">
        <!-- Имя и уровень -->
        <section
          id="identity"
          class="relative overflow-hidden rounded-2xl border border-[#594027] bg-[radial-gradient(circle_at_50%_0%,rgba(113,81,41,0.18),transparent_38%),linear-gradient(145deg,#291b0f,#140d08)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.28)] sm:p-7"
        >
          <div
            class="pointer-events-none absolute inset-0 border border-[#80603a]/10"
          />

          <div
            class="relative text-center"
          >
            <div
              class="text-[9px] font-black uppercase tracking-[0.28em] text-[#9b743f]"
            >
              Глава первая
            </div>

            <h2
              class="mt-2 text-3xl font-black tracking-tight text-[#e7d8bc] sm:text-4xl"
            >
              Кто ступит на путь?
            </h2>

            <p
              class="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#88745a]"
            >
              Дай своему герою имя и выбери уровень,
              с которого начинается его история.
            </p>

            <div
              class="mx-auto mt-6 max-w-2xl"
            >
              <label
                class="mb-2 block text-left text-[10px] font-black uppercase tracking-[0.16em] text-[#a48761]"
              >
                Имя героя
              </label>

              <input
                v-model="characterCreator.name"
                type="text"
                placeholder="Имя, которое будут помнить..."
                class="h-12 w-full rounded-xl border border-[#5f4529] bg-[#0d0906] px-4 text-center text-sm font-semibold text-[#e4d5ba] outline-none placeholder:text-[#5c4b39] focus:border-[#b48345] focus:ring-2 focus:ring-[#a9763d]/20"
              />
            </div>

            <!-- Уровень -->
            <div
              class="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#4d3722] bg-[#100a06]/70 p-4"
            >
              <div
                class="flex flex-col gap-2 text-left sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <div
                    class="text-[9px] font-black uppercase tracking-[0.18em] text-[#766046]"
                  >
                    Уровень героя
                  </div>

                  <div
                    class="mt-1 flex items-baseline gap-2"
                  >
                    <span
                      class="font-serif text-3xl font-black text-[#e0ba70]"
                    >
                      {{ characterCreator.level }}
                    </span>

                    <span
                      class="text-xs text-[#766047]"
                    >
                      {{
                        levelsRoman[
                          characterCreator.level - 1
                        ]
                      }}
                    </span>
                  </div>
                </div>

                <div
                  class="text-[10px] text-[#62513c]"
                >
                  Выбери уровень от I до XX
                </div>
              </div>

              <div
                class="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10"
              >
                <button
                  v-for="level in 20"
                  :key="level"
                  type="button"
                  :class="[
                    'group flex aspect-square flex-col items-center justify-center rounded-xl border transition',
                    characterCreator.level === level
                      ? 'border-[#bd8d4b] bg-[radial-gradient(circle,#59401f,#241508)] text-[#efd08e] shadow-[0_0_0_1px_rgba(197,150,78,0.12),0_7px_18px_rgba(0,0,0,0.32)]'
                      : 'border-[#3f2d1c] bg-[#130c07] text-[#80684d] hover:border-[#71512f] hover:bg-[#1e1309] hover:text-[#c2a36e]'
                  ]"
                  @click="
                    characterCreator.setLevel(level)
                  "
                >
                  <span
                    class="font-serif text-xs font-black sm:text-sm"
                  >
                    {{ levelsRoman[level - 1] }}
                  </span>

                  <span
                    :class="[
                      'text-[8px]',
                      characterCreator.level === level
                        ? 'text-[#bd9559]'
                        : 'text-[#584735]'
                    ]"
                  >
                    {{ level }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Происхождение -->
        <section
          id="race-class"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              II
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава вторая
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Происхождение героя
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterRace />
          </div>

          <div
            class="my-7 flex items-center justify-center gap-3 text-[#705331]"
          >
            <div class="h-px flex-1 bg-[#3a2919]" />
            <span>✦</span>
            <div class="h-px flex-1 bg-[#3a2919]" />
          </div>

          <CharacterClass />
        </section>

        <!-- Характеристики -->
        <section
          id="abilities"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              III
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава третья
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Сила и слабости
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterAbilities />
          </div>
        </section>

        <!-- Навыки -->
        <section
          id="skills"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              IV
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава четвёртая
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Искусство и знания
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterSkills />
          </div>
        </section>

        <!-- Снаряжение -->
        <section
          id="equipment"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              V
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава пятая
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Оружие и снаряжение
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterEquipment />
          </div>
        </section>

        <!-- Магия -->
        <section
          id="spells"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              VI
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава шестая
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Магия и тайны
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterSpells />
          </div>

          <div
            class="my-7 flex items-center justify-center gap-3 text-[#705331]"
          >
            <div class="h-px flex-1 bg-[#3a2919]" />
            <span>✦</span>
            <div class="h-px flex-1 bg-[#3a2919]" />
          </div>

          <CharacterSpellcasting />
        </section>

        <!-- Бой -->
        <section
          id="combat"
          class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] sm:p-7"
        >
          <div
            class="flex items-center gap-3 border-b border-[#392819] pb-4"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] font-serif text-sm font-black text-[#d5ae68]"
            >
              VII
            </div>

            <div>
              <div
                class="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
              >
                Глава седьмая
              </div>

              <h2
                class="mt-1 text-xl font-black text-[#decfb2] sm:text-2xl"
              >
                Искусство войны
              </h2>
            </div>
          </div>

          <div class="mt-6">
            <CharacterWeapon />
          </div>

          <div
            class="my-7 flex items-center justify-center gap-3 text-[#705331]"
          >
            <div class="h-px flex-1 bg-[#3a2919]" />
            <span>✦</span>
            <div class="h-px flex-1 bg-[#3a2919]" />
          </div>

          <CharacterAttacks />

          <div
            class="my-7 flex items-center justify-center gap-3 text-[#705331]"
          >
            <div class="h-px flex-1 bg-[#3a2919]" />
            <span>✦</span>
            <div class="h-px flex-1 bg-[#3a2919]" />
          </div>

          <CharacterSavingThrows />
        </section>

        <!-- Предпросмотр -->
        <section
          class="rounded-2xl border border-[#614628] bg-[radial-gradient(circle_at_50%_0%,rgba(113,81,41,0.15),transparent_35%),linear-gradient(145deg,#291b0f,#130c07)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.3)] sm:p-7"
        >
          <div class="text-center">
            <div
              class="text-[9px] font-black uppercase tracking-[0.24em] text-[#9b743f]"
            >
              Последняя запись
            </div>

            <h2
              class="mt-2 text-2xl font-black text-[#e3d5bb] sm:text-3xl"
            >
              Судьба героя
            </h2>

            <p
              class="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-[#7f6b52]"
            >
              Проверь итоговые значения перед тем,
              как записать персонажа в свою коллекцию.
            </p>
          </div>

          <div
            class="mt-6 rounded-xl border border-[#4a3420] bg-[#100a06]/50 p-3 sm:p-5"
          >
            <CharacterPreview />
          </div>

          <div
            class="mt-6 flex justify-center"
          >
            <button
              type="button"
              class="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#b48443] bg-[linear-gradient(180deg,#b98543,#744b24)] px-7 text-sm font-black text-[#1a0f07] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              @click="createCharacter"
            >
              <span
                class="text-lg transition-transform group-hover:rotate-[-8deg]"
              >
                ⚔
              </span>

              Записать героя
            </button>
          </div>
        </section>
      </section>
    </main>

    <!-- Нижняя плавающая кнопка -->
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-40 hidden sm:block"
    >
      <button
        type="button"
        class="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-[#73532d] bg-[#15100b]/95 px-4 py-3 text-xs font-black text-[#cda968] shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur transition hover:border-[#a7783c] hover:bg-[#21160c] hover:text-[#e3c17f]"
        @click="createCharacter"
      >
        <span>✦</span>
        Создать героя
      </button>
    </div>
  </div>
</template>