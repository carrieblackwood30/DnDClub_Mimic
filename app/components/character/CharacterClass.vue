<script setup>
import { computed } from 'vue'

const characterCreator = useCharacterCreatorStore()
const classesStore = useClassesStore()

const fightingStyleOptions = computed(() => {
  const classId = characterCreator.classId

  const options = [
    {
      id: 'archery',
      name: 'Стрельба',
      description: '+2 к броскам атаки дальнобойным оружием'
    },
    {
      id: 'defense',
      name: 'Защита',
      description: '+1 к КД, пока носишь броню'
    },
    {
      id: 'dueling',
      name: 'Дуэлянт',
      description: '+2 к урону при использовании оружия в одной руке'
    },
    {
      id: 'great-weapon-fighting',
      name: 'Сражение большим оружием',
      description: 'Позволяет перебрасывать определённые результаты костей урона'
    },
    {
      id: 'protection',
      name: 'Оборона',
      description: 'Позволяет реакцией защищать соседнего союзника щитом'
    },
    {
      id: 'two-weapon-fighting',
      name: 'Сражение двумя оружиями',
      description: 'Добавляет модификатор характеристики к урону второй атаки'
    }
  ]

  const allowedStyles = {
    fighter: options.map(item => item.id),
    paladin: [
      'defense',
      'dueling',
      'great-weapon-fighting',
      'protection'
    ],
    ranger: [
      'archery',
      'defense',
      'dueling',
      'two-weapon-fighting'
    ]
  }

  return options.filter(item =>
    (allowedStyles[classId] ?? [])
      .includes(item.id)
  )
})

const canChooseFightingStyle = computed(() => {
  const classId = characterCreator.classId
  const level = Number(characterCreator.level ?? 1)

  if (classId === 'fighter') {
    return level >= 1
  }

  if (
    classId === 'paladin' ||
    classId === 'ranger'
  ) {
    return level >= 2
  }

  return false
})

const selectFightingStyle = styleId => {
  characterCreator.setClassChoice(
    'fightingStyle',
    styleId
  )
}

const selectClass = (classId) => {
  characterCreator.classId = classId
  characterCreator.classChoices = {}
  characterCreator.subclassId = null
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="mb-4 text-2xl font-black text-[#decfb2]">
        Выберите класс
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          v-for="characterClass in classesStore.allClasses"
          :key="characterClass.id"
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="
            characterCreator.classId === characterClass.id
              ? 'border-[#b48a4e] bg-[#34200e]'
              : 'border-[#47311d] bg-[#160d08] hover:border-[#80603a]'
          "
          @click="selectClass(characterClass.id)"
        >
          <h3 class="text-lg font-black text-[#decfb2]">
            {{ characterClass.name }}
          </h3>

          <p class="mt-2 text-sm text-[#99856a]">
            Кость хитов: d{{ characterClass.hitDie }}
          </p>
        </button>
      </div>
    </div>

    <section
      v-if="canChooseFightingStyle"
      class="rounded-2xl border border-[#4d3822] bg-[linear-gradient(145deg,#21160d,#120b07)] p-5"
    >
      <h3 class="text-xl font-black text-[#decfb2]">
        Боевой стиль
      </h3>

      <p class="mt-2 text-sm text-[#9a856a]">
        Выбери стиль боевой подготовки героя.
      </p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          v-for="style in fightingStyleOptions"
          :key="style.id"
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="
            characterCreator.classChoices?.fightingStyle === style.id
              ? 'border-[#b48a4e] bg-[#34200e]'
              : 'border-[#47311d] bg-[#160d08] hover:border-[#80603a]'
          "
          @click="selectFightingStyle(style.id)"
        >
          <div class="font-black text-[#dec79d]">
            {{ style.name }}
          </div>

          <div class="mt-2 text-sm leading-relaxed text-[#99856a]">
            {{ style.description }}
          </div>

          <div
            v-if="characterCreator.classChoices?.fightingStyle === style.id"
            class="mt-3 text-xs font-black uppercase tracking-wider text-[#dcb76f]"
          >
            ✓ Выбрано
          </div>
        </button>
      </div>
    </section>
  </div>
</template>