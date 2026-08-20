import { computed } from 'vue'
import { skills } from '~/data/skills'

export const useCharacterSkills = () => {
  const characterCreator = useCharacterCreatorStore()

  const {
    abilityModifiers
  } = useCharacterStats()

  const {
    proficiencyBonus
  } = useCharacterProficiency()

  const {
    skillChoices
  } = useCharacterClass()

  const skillAbilities = {
    acrobatics: 'dexterity',
    animalHandling: 'wisdom',
    arcana: 'intelligence',
    athletics: 'strength',
    deception: 'charisma',
    history: 'intelligence',
    insight: 'wisdom',
    intimidation: 'charisma',
    investigation: 'intelligence',
    medicine: 'wisdom',
    nature: 'intelligence',
    perception: 'wisdom',
    performance: 'charisma',
    persuasion: 'charisma',
    religion: 'intelligence',
    sleightOfHand: 'dexterity',
    stealth: 'dexterity',
    survival: 'wisdom'
  }

  const availableSkills = computed(() => {
    if (!skillChoices.value) {
      return []
    }

    return skills.filter(skill =>
      skillChoices.value.options.includes(skill.id)
    )
  })

  const maxSelectedSkills = computed(() => {
    return skillChoices.value?.count ?? 0
  })

  const selectedSkillsCount = computed(() => {
    return characterCreator.selectedSkills.length
  })

  const canSelectMoreSkills = computed(() => {
    return (
      selectedSkillsCount.value <
      maxSelectedSkills.value
    )
  })

  const isSkillSelected = (skillId) => {
    return characterCreator.selectedSkills.includes(skillId)
  }

  const toggleSkill = (skillId) => {
    const isSelected = isSkillSelected(skillId)

    if (!isSelected && !canSelectMoreSkills.value) {
      return
    }

    characterCreator.toggleSkill(skillId)
  }

  const getSkillModifier = (skill) => {
    const ability = skillAbilities[skill.id]

    if (!ability) {
      return 0
    }

    const baseModifier =
      abilityModifiers.value[ability] ?? 0

    const isProficient =
      characterCreator.selectedSkills.includes(skill.id)

    return isProficient
      ? baseModifier + proficiencyBonus.value
      : baseModifier
  }

  const hasSkillProficiency = (skillId) => {
    return characterCreator.selectedSkills.includes(
      skillId
    )
  }

  const getSkillAbility = (skillId) => {
    return skillAbilities[skillId] ?? null
  }

  return {
    availableSkills,
    maxSelectedSkills,
    selectedSkillsCount,
    canSelectMoreSkills,

    isSkillSelected,
    toggleSkill,

    getSkillModifier,
    hasSkillProficiency,
    getSkillAbility
  }
}