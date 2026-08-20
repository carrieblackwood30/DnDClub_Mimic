<script setup>
const characterCreator = useCharacterCreatorStore()
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold">
      Создание персонажа
    </h1>

    <div class="mt-8">
      <label class="block mb-2">
        Имя персонажа
      </label>

      <input
        v-model="characterCreator.name"
        type="text"
        placeholder="Введите имя"
        class="border rounded px-3 py-2"
      />
    </div>

    <div class="mt-8">
      <label class="block mb-2">
        Уровень персонажа
      </label>

      <select
        :value="characterCreator.level"
        class="border rounded px-3 py-2"
        @change="characterCreator.setLevel(Number($event.target.value))"
      >
        <option
          v-for="level in 20"
          :key="level"
          :value="level"
        >
          {{ level }}
        </option>
      </select>
    </div>

    <div class="mt-8">
      <p>
        Выбранная раса:
        {{ characterCreator.raceId }}
      </p>

      <p>
        Выбранная подраса:
        {{ characterCreator.subraceId }}
      </p>

      <p>
        Выбранное имя:
        {{ characterCreator.name }}
      </p>

      <p>
        Выбранный класс:
        {{ characterCreator.classId }}
      </p>

      <p>
        Выбранный подкласс:
        {{ characterCreator.subclassId }}
      </p>
    </div>

    <div class="mt-10">
      <CharacterRace />
    </div>

    <div class="mt-10">
      <CharacterClass />
    </div>

    <div class="mt-10">
      <CharacterAbilities />
    </div>

    <div class="mt-10">
      <CharacterSkills />
    </div>

    <div class="mt-10">
      <CharacterPreview />
    </div>

    <div class="mt-10">
      <CharacterEquipment />
    </div>

    <div class="mt-10">
      <CharacterWeapon />
    </div>

    <div class="mt-10">
      <CharacterAttacks />
    </div>

    <div class="mt-10">
      <CharacterSavingThrows />
    </div>
    
    <div class="mt-10">
    <CharacterSpellcasting />
  </div>
  </div>
  
</template>