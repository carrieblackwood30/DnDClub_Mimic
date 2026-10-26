<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true
  }
})

const character = props.character

const {
  race,
  subrace,
  characterClass,
  subclass,
  armorClass
} = useSavedCharacter(character)

const pdfSheet = ref(null)
const pdfReady = ref(false)
const pdfDownloading = ref(false)
const pdfError = ref('')

const downloadCharacterPdf = async () => {
  if (pdfDownloading.value) return

  pdfDownloading.value = true
  pdfError.value = ''
  pdfReady.value = true

  try {
    await nextTick()

    if (!pdfSheet.value?.download) {
      throw new Error('Шаблон PDF не готов')
    }

    await pdfSheet.value.download()
  } catch (error) {
    console.error('Ошибка создания PDF персонажа:', error)
    pdfError.value = 'Не удалось создать PDF. Попробуй ещё раз.'
  } finally {
    pdfReady.value = false
    pdfDownloading.value = false
  }
}

</script>

<template>
  <article
    class="group relative overflow-hidden rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] shadow-[0_18px_50px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-[#765630] hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]"
  >
    <!-- Верхнее декоративное свечение -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(164,116,55,0.18),transparent_68%)] opacity-70 transition group-hover:opacity-100"
    />

    <div class="relative p-5 sm:p-6">
      <!-- Имя / класс -->
      <div
        class="flex items-start justify-between gap-4 border-b border-[#392819] pb-5"
      >
        <div class="min-w-0">
          <div
            class="text-[10px] font-black uppercase tracking-[0.22em] text-[#8e6b3d]"
          >
            Герой
          </div>

          <h2
            class="mt-1 truncate font-serif text-2xl font-black text-[#e7d8bb] sm:text-3xl"
          >
            {{ character.name || 'Без имени' }}
          </h2>

          <p
            class="mt-2 text-sm font-bold text-[#b69a70] sm:text-base"
          >
            {{ characterClass?.name ?? 'Класс не выбран' }}

            <span class="mx-1 text-[#614628]">
              ·
            </span>

            {{ character.level }} уровень
          </p>

          <p
            class="mt-1 text-sm text-[#806c53]"
          >
            {{ race?.name ?? 'Раса не выбрана' }}

            <span v-if="subrace">
              — {{ subrace.name }}
            </span>
          </p>
          <p class="mt-2 text-sm text-[#b69a70]">
            Класс защиты:
            <span class="font-black text-[#d8b66f]">
              {{ armorClass }}
            </span>
          </p>
        </div>

        <!-- Уровень -->
        <div
          class="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-[#765630] bg-[radial-gradient(circle,#3a2916,#160d07)] shadow-[inset_0_1px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.3)]"
        >
          <div
            class="font-serif text-2xl font-black leading-none text-[#d8b66f]"
          >
            {{ character.level }}
          </div>

          <div
            class="text-[8px] font-black uppercase tracking-[0.12em] text-[#80633d]"
          >
            УРОВЕНЬ
          </div>
        </div>
      </div>

      <!-- Характеристики -->
      <div class="mt-5">
        <div
          class="mb-3 flex items-center gap-3"
        >
          <div
            class="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
          >
            Характеристики
          </div>

          <div class="h-px flex-1 bg-[#392819]" />

          <span class="text-[#705331]">
            ✦
          </span>
        </div>

        <div
          class="grid grid-cols-3 gap-2 sm:gap-3"
        >
          <!-- Сила -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Сила
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.strength }}
            </p>
          </div>

          <!-- Ловкость -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Ловкость
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.dexterity }}
            </p>
          </div>

          <!-- Телосложение -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Телосложение
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.constitution }}
            </p>
          </div>

          <!-- Интеллект -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Интеллект
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.intelligence }}
            </p>
          </div>

          <!-- Мудрость -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Мудрость
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.wisdom }}
            </p>
          </div>

          <!-- Харизма -->
          <div
            class="rounded-xl border border-[#44311f] bg-[#100a06]/70 p-3 text-center transition hover:border-[#6b4d2d] hover:bg-[#171008]"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.12em] text-[#78654c]"
            >
              Харизма
            </p>

            <p
              class="mt-1 font-serif text-2xl font-black text-[#d8bd85]"
            >
              {{ character.abilityScores.charisma }}
            </p>
          </div>
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="mt-5">
        <div
          class="mb-3 flex items-center gap-3"
        >
          <div
            class="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e6b3d]"
          >
            Детали
          </div>

          <div class="h-px flex-1 bg-[#392819]" />
        </div>

        <div
          class="space-y-2"
        >
          <div
            class="flex items-center justify-between rounded-xl border border-[#3d2b1a] bg-[#100a06]/60 px-3 py-3"
          >
            <span class="text-sm text-[#79664c]">
              Подкласс
            </span>

            <strong
              class="text-sm font-bold text-[#c0a77c]"
            >
              {{ subclass?.name ?? 'Не выбран' }}
            </strong>
          </div>

          <div
            class="flex items-center justify-between rounded-xl border border-[#3d2b1a] bg-[#100a06]/60 px-3 py-3"
          >
            <span class="text-sm text-[#79664c]">
              Оружие
            </span>

            <strong
              class="max-w-[55%] truncate text-sm font-bold text-[#c0a77c]"
            >
              {{ character.weaponId ?? 'Не выбрано' }}
            </strong>
          </div>

          <div
            class="flex items-center justify-between rounded-xl border border-[#3d2b1a] bg-[#100a06]/60 px-3 py-3"
          >
            <span class="text-sm text-[#79664c]">
              Навыков
            </span>

            <strong
              class="text-sm font-bold text-[#c0a77c]"
            >
              {{ character.selectedSkills.length }}
            </strong>
          </div>
        </div>
      </div>

      <!-- Действия -->
      <div
        class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        <!-- Открыть персонажа -->
        <NuxtLink
          :to="`/characters/${character.id}`"
          class="group flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#5b4328] bg-[#171008] px-4 text-sm font-black text-[#cda968] transition hover:border-[#8a6738] hover:bg-[#24170c] hover:text-[#e3c17f]"
        >
          <span class="text-base">
            📖
          </span>

          <span>
            Открыть лист
          </span>

          <span
            class="text-[#8c6838] transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </NuxtLink>

        <!-- Battlefield -->
        <NuxtLink
          to="/battlefield"
          class="group flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#a8783f] bg-[linear-gradient(180deg,#8a5c2d,#573617)] px-4 text-sm font-black text-[#f1d49a] shadow-[0_8px_22px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <span
            class="text-lg transition-transform group-hover:scale-110"
          >
            ⚔
          </span>

          <span>
            Battlefield
          </span>

          <span
            class="text-[#e6bd73] transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </NuxtLink>

        <button
          type="button"
          :disabled="pdfDownloading"
          class="group flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#52664a] bg-[linear-gradient(180deg,#263a2c,#14231a)] px-3 text-sm font-black text-[#c4dbad] transition hover:-translate-y-0.5 hover:border-[#829b68] hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          @click="downloadCharacterPdf"
        >
          <span class="text-lg">
            {{ pdfDownloading ? '…' : '↓' }}
          </span>

          <span>
            {{ pdfDownloading ? 'Готовим PDF…' : 'Скачать PDF' }}
          </span>
        </button>
      </div>
      <p
        v-if="pdfError"
        class="mt-2 text-xs text-red-400"
      >
        {{ pdfError }}
      </p>
    </div>
    <CharacterPdfSheet
      v-if="pdfReady"
      ref="pdfSheet"
      :character="character"
    />
  </article>
</template>