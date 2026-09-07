export const useDice = () => {
  /*
   * Один бросок d20
   */
  const rollD20 = () => {
    return Math.floor(
      Math.random() * 20
    ) + 1
  }

  /*
   * Определяет естественный результат d20.
   *
   * Важно:
   * natural 20 и natural 1
   * определяются ДО добавления модификатора.
   */
  const getRollType = (roll) => {
    if (roll === 20) {
      return 'critical'
    }

    if (roll === 1) {
      return 'critical-fail'
    }

    return 'normal'
  }

  /*
   * d20 с преимуществом
   */
  const rollD20WithAdvantage = () => {
    const first = rollD20()
    const second = rollD20()

    const result =
      Math.max(first, second)

    return {
      rolls: [first, second],
      result
    }
  }

  /*
   * d20 с помехой
   */
  const rollD20WithDisadvantage = () => {
    const first = rollD20()
    const second = rollD20()

    const result =
      Math.min(first, second)

    return {
      rolls: [first, second],
      result
    }
  }

  /*
   * Универсальный бросок проверки.
   *
   * mode:
   * normal
   * advantage
   * disadvantage
   */
  const rollCheck = (
    modifier = 0,
    mode = 'normal'
  ) => {
    let roll
    let rolls

    if (mode === 'advantage') {
      const result =
        rollD20WithAdvantage()

      rolls = result.rolls
      roll = result.result
    } else if (
      mode === 'disadvantage'
    ) {
      const result =
        rollD20WithDisadvantage()

      rolls = result.rolls
      roll = result.result
    } else {
      roll = rollD20()
      rolls = [roll]
    }

    /*
     * Тип определяется по выбранному
     * итоговому d20.
     */
    const rollType =
      getRollType(roll)

    return {
      rolls,
      roll,
      modifier,
      total: roll + modifier,
      mode,
      rollType,

      /*
       * Удобные флаги для UI
       */
      isCritical:
        rollType === 'critical',

      isCriticalFail:
        rollType === 'critical-fail'
    }
  }

  return {
    rollD20,
    rollD20WithAdvantage,
    rollD20WithDisadvantage,
    getRollType,
    rollCheck
  }
}