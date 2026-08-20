<script setup>
const characterCreator = useCharacterCreatorStore()
const classesStore = useClassesStore()

const selectClass = (classId) => {
  characterCreator.classId = classId
  characterCreator.subclassId = null
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      Выберите класс
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        v-for="characterClass in classesStore.allClasses"
        :key="characterClass.id"
        type="button"
        class="border rounded-lg p-4 text-left hover:bg-gray-100"
        :class="{
          'border-black bg-gray-100':
            characterCreator.classId === characterClass.id
        }"
        @click="selectClass(characterClass.id)"
      >
        <h3 class="text-lg font-semibold">
          {{ characterClass.name }}
        </h3>

        <p class="text-sm text-gray-500 mt-2">
          Hit Die: d{{ characterClass.hitDie }}
        </p>
      </button>
    </div>
  </div>
</template>