const { getHabits, getLogs } = require('./storage')

function getRewardForCompletedDays(completedDays) {
  if (completedDays >= 100) {
    return { level: 'legend', icon: '🏆', title: '百日大师', hint: '连续投入已经成为生活方式' }
  }

  if (completedDays >= 30) {
    return { level: 'gold', icon: '🥇', title: '月度守护者', hint: '完成 30 天，值得认真奖励' }
  }

  if (completedDays >= 7) {
    return { level: 'silver', icon: '🌟', title: '七日稳定星', hint: '完成 7 天，节奏开始稳定' }
  }

  if (completedDays >= 3) {
    return { level: 'bronze', icon: '🌱', title: '三日萌芽', hint: '完成 3 天，习惯正在发芽' }
  }

  return { level: 'seed', icon: '✨', title: '待点亮', hint: '完成 3 天可点亮第一枚奖励' }
}

function buildHabitStats() {
  const logs = getLogs()

  return getHabits().map((habit) => {
    const habitLogs = logs.filter((log) => log.habitId === habit.id && log.status === 'completed')
    const totalValue = habitLogs.reduce((sum, log) => sum + Number(log.value || 0), 0)
    const completedDays = habitLogs.length

    return {
      ...habit,
      completedDays,
      reward: getRewardForCompletedDays(completedDays),
      totalValue,
      displayTotal: habit.goalType === 'done' ? `${habitLogs.length} 天` : `${totalValue} ${habit.unit}`
    }
  })
}

function buildOverview() {
  const stats = buildHabitStats()
  const unlockedRewards = stats.filter((item) => item.reward.level !== 'seed').length
  return {
    habitCount: stats.length,
    completedDays: stats.reduce((sum, item) => sum + item.completedDays, 0),
    unlockedRewards,
    totalDuration: stats
      .filter((item) => item.goalType === 'duration')
      .reduce((sum, item) => sum + item.totalValue, 0),
    totalCount: stats
      .filter((item) => item.goalType === 'count')
      .reduce((sum, item) => sum + item.totalValue, 0),
    stats
  }
}

module.exports = {
  buildHabitStats,
  buildOverview,
  getRewardForCompletedDays
}
