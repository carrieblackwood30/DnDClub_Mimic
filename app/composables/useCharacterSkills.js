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
    if (!skill?.ability) {
      return 0
    }

    const baseModifier =
      abilityModifiers.value[skill.ability] ?? 0

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
    return (
      skills.find(skill => skill.id === skillId)?.ability ??
      null
    )
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