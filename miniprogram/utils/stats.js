const { getHabits, getLogs } = require('./storage')

function buildHabitStats() {
  const logs = getLogs()

  return getHabits().map((habit) => {
    const habitLogs = logs.filter((log) => log.habitId === habit.id && log.status === 'completed')
    const totalValue = habitLogs.reduce((sum, log) => sum + Number(log.value || 0), 0)

    return {
      ...habit,
      completedDays: habitLogs.length,
      totalValue,
      displayTotal: habit.goalType === 'done' ? `${habitLogs.length} 天` : `${totalValue} ${habit.unit}`
    }
  })
}

function buildOverview() {
  const stats = buildHabitStats()
  return {
    habitCount: stats.length,
    completedDays: stats.reduce((sum, item) => sum + item.completedDays, 0),
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
  buildOverview
}
