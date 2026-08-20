<script setup>
const characterCreator = useCharacterCreatorStore()
const racesStore = useRacesStore()

const {
  race,
  subraces,
  subrace
} = useCharacterRace()

const selectRace = (raceId) => {
  characterCreator.raceId = raceId
  characterCreator.subraceId = null
}

const selectSubrace = (subraceId) => {
  characterCreator.subraceId = subraceId
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      Выберите расу
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        v-for="item in racesStore.allRaces"
        :key="item.id"
        type="button"
        class="border rounded-lg p-4 text-left hover:bg-gray-100"
        :class="{
          'border-black bg-gray-100':
            characterCreator.raceId === item.id
        }"
        @click="selectRace(item.id)"
      >
        <h3 class="text-lg font-semibold">
          {{ item.name }}
        </h3>
      </button>
    </div>

    <div
      v-if="race && subraces.length"
      class="mt-8"
    >
      <h2 class="text-2xl font-bold mb-4">
        Выберите подрасу
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          v-for="item in subraces"
          :key="item.id"
          type="button"
          class="border rounded-lg p-4 text-left hover:bg-gray-100"
          :class="{
            'border-black bg-gray-100':
              characterCreator.subraceId === item.id
          }"
          @click="selectSubrace(item.id)"
        >
          <h3 class="text-lg font-semibold">
            {{ item.name }}
          </h3>
        </button>
      </div>
    </div>

    <div
      v-if="race"
      class="mt-8"
    >
      <p>
        Выбрана раса:
        <strong>{{ race.name }}</strong>
      </p>

      <p v-if="subrace">
        Выбрана подраса:
        <strong>{{ subrace.name }}</strong>
      </p>
    </div>
  </div>
</template>