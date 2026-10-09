<script setup>
import { onMounted } from 'vue'

const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.loadCharacters()
})
</script>

<template>
  <div
    class="min-h-screen overflow-x-clip bg-[#080604] text-[#dfd0b4]"
  >
    <!-- Атмосферный фон -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(54,77,42,0.22),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(104,73,36,0.16),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(61,39,20,0.20),transparent_38%)]"
    />

    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-20 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_24px,rgba(136,99,54,0.035)_25px,transparent_26px)]"
    />

    <!-- Верхняя панель -->
    <header
      class="sticky top-0 z-50 border-b border-[#4a3520] bg-[#100b07]/95 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#80603a] bg-[radial-gradient(circle,#382716,#130c07)] text-xl text-[#d7b26d] shadow-[inset_0_1px_rgba(255,255,255,0.06),0_5px_18px_rgba(0,0,0,0.3)]"
          >
            ✦
          </div>

          <div class="min-w-0">
            <div
              class="text-[9px] font-black uppercase tracking-[0.24em] text-[#8e6b3d]"
            >
              CULT OF MIMIC
            </div>

            <h1
              class="truncate text-xl font-black tracking-tight text-[#e9dcc2] sm:text-2xl"
            >
              Зал героев
            </h1>

            <p
              class="hidden text-xs text-[#78664f] sm:block"
            >
              Твои созданные персонажи
            </p>
          </div>
        </div>

        <NuxtLink
          to="/characters/create"
          class="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#b48443] bg-[linear-gradient(180deg,#b98543,#744b24)] px-4 py-2 text-sm font-black text-[#1a0f07] shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 sm:px-5"
        >
          <span
            class="text-lg transition-transform group-hover:rotate-[-8deg]"
          >
            ⚔
          </span>

          <span class="hidden sm:inline">
            Создать героя
          </span>

          <span class="sm:hidden">
            Создать
          </span>
        </NuxtLink>
      </div>
    </header>

    <!-- Основное содержимое -->
    <main
      class="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10"
    >
      <!-- Заголовок -->
      <section
        class="mb-7 rounded-2xl border border-[#4d3822] bg-[radial-gradient(circle_at_50%_0%,rgba(113,81,41,0.15),transparent_38%),linear-gradient(145deg,#21160d,#120b07)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-8"
      >
        <div class="text-center">
          <div
            class="text-[10px] font-black uppercase tracking-[0.28em] text-[#9b743f]"
          >
            Книга персонажей
          </div>

          <h2
            class="mt-2 font-serif text-3xl font-black text-[#ead9b8] sm:text-4xl"
          >
            Твои герои
          </h2>

          <p
            class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#89765d] sm:text-base"
          >
            Здесь хранятся персонажи, которых ты создал.
            Выбери героя, чтобы открыть его лист и продолжить приключение.
          </p>

          <div class="mt-6 flex items-center justify-center gap-3 text-[#705331]">
            <div class="h-px w-16 bg-[#3a2919] sm:w-24" />
            <span class="text-lg">✦</span>
            <div class="h-px w-16 bg-[#3a2919] sm:w-24" />
          </div>
        </div>
      </section>

      <!-- Список -->
      <section>
        <div
          v-if="charactersStore.characters.length === 0"
          class="rounded-2xl border border-dashed border-[#5a4126] bg-[linear-gradient(145deg,#1b120b,#0f0906)] p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-16"
        >
          <div
            class="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#765630] bg-[radial-gradient(circle,#332311,#120a06)] text-3xl text-[#c99b50] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            ♜
          </div>

          <div
            class="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-[#8e6b3d]"
          >
            Книга пуста
          </div>

          <h3
            class="mt-2 font-serif text-2xl font-black text-[#e2d0ad] sm:text-3xl"
          >
            Здесь ещё нет героев
          </h3>

          <p
            class="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#78664e] sm:text-base"
          >
            Создай своего первого персонажа и отправь его
            навстречу приключениям.
          </p>

          <NuxtLink
            to="/characters/create"
            class="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl border border-[#b48443] bg-[linear-gradient(180deg,#b98543,#744b24)] px-6 text-sm font-black text-[#1a0f07] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <span
              class="text-lg transition-transform group-hover:rotate-[-8deg]"
            >
              ⚔
            </span>

            Создать первого героя
          </NuxtLink>
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-5 xl:grid-cols-2"
        >
          <CharacterCard
            v-for="character in charactersStore.characters"
            :key="character.id"
            :character="character"
          />
        </div>
      </section>
    </main>

    <!-- Плавающая кнопка -->
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-40 hidden sm:block"
    >
      <NuxtLink
        to="/characters/create"
        class="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-[#73532d] bg-[#15100b]/95 px-4 py-3 text-xs font-black text-[#cda968] shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur transition hover:border-[#a7783c] hover:bg-[#21160c] hover:text-[#e3c17f]"
      >
        <span>✦</span>
        Новый герой
      </NuxtLink>
    </div>
  </div>
</template>