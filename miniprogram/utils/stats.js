const { todayKey } = require('./date')
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

function parseDate(dateKey) {
  const parts = dateKey.split('-').map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getHabitStartKey(habit) {
  if (!habit.createdAt) {
    return todayKey()
  }

  return formatDate(new Date(habit.createdAt))
}

function isHabitDueOnDate(habit, date) {
  if (!habit.frequency || habit.frequency.type === 'daily') {
    return true
  }

  if (habit.frequency.type === 'weekly') {
    return habit.frequency.weekdays.includes(date.getDay())
  }

  return true
}

function buildTimeline(habit, completedDateSet) {
  const startDate = parseDate(getHabitStartKey(habit))
  const today = parseDate(todayKey())
  const days = []

  for (let cursor = new Date(startDate); cursor <= today; cursor = addDays(cursor, 1)) {
    const date = formatDate(cursor)
    const required = isHabitDueOnDate(habit, cursor)
    const completed = completedDateSet.has(date)

    days.push({ date, required, completed })
  }

  return days
}

function countPeriod(timeline, days) {
  const period = timeline.slice(-days)
  return period.reduce((result, day) => {
    if (!day.required) {
      return result
    }

    return {
      due: result.due + 1,
      completed: result.completed + (day.completed ? 1 : 0)
    }
  }, { due: 0, completed: 0 })
}

function countCurrentStreak(timeline) {
  let streak = 0

  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    const day = timeline[index]

    if (!day.required) {
      continue
    }

    if (!day.completed) {
      break
    }

    streak += 1
  }

  return streak
}

function buildHabitStats() {
  const logs = getLogs()

  return getHabits().map((habit) => {
    const habitLogs = logs.filter((log) => log.habitId === habit.id && log.status === 'completed')
    const completedDateSet = new Set(habitLogs.map((log) => log.date))
    const timeline = buildTimeline(habit, completedDateSet)
    const dueDays = timeline.filter((day) => day.required).length
    const completedDays = timeline.filter((day) => day.required && day.completed).length
    const todayCompleted = completedDateSet.has(todayKey())
    const totalValue = habitLogs.reduce((sum, log) => sum + Number(log.value || 0), 0)
    const completionRate = dueDays ? Math.round((completedDays / dueDays) * 100) : 0
    const dailyAverage = dueDays ? Number((totalValue / dueDays).toFixed(1)) : 0
    const currentStreak = countCurrentStreak(timeline)
    const last7 = countPeriod(timeline, 7)
    const previous7 = countPeriod(timeline.slice(0, -7), 7)

    return {
      ...habit,
      completedDays,
      dueDays,
      elapsedDays: timeline.length,
      completionRate,
      currentStreak,
      dailyAverage,
      last7Due: last7.due,
      last7Completed: last7.completed,
      previous7Due: previous7.due,
      previous7Completed: previous7.completed,
      todayCompleted,
      todayStatusText: todayCompleted ? '今日已完成' : '今日未完成',
      reward: getRewardForCompletedDays(completedDays),
      totalValue,
      displayTotal: habit.goalType === 'done' ? `${completedDays} 天` : `${totalValue} ${habit.unit}`
    }
  })
}

function buildOverview() {
  const stats = buildHabitStats()
  const unlockedRewards = stats.filter((item) => item.reward.level !== 'seed').length
  const totalDueDays = stats.reduce((sum, item) => sum + item.dueDays, 0)
  const completedDays = stats.reduce((sum, item) => sum + item.completedDays, 0)
  const activeDays = stats.length ? Math.max(...stats.map((item) => item.elapsedDays)) : 0
  const last7Due = stats.reduce((sum, item) => sum + item.last7Due, 0)
  const last7Completed = stats.reduce((sum, item) => sum + item.last7Completed, 0)
  const previous7Due = stats.reduce((sum, item) => sum + item.previous7Due, 0)
  const previous7Completed = stats.reduce((sum, item) => sum + item.previous7Completed, 0)
  const last7Rate = last7Due ? Math.round((last7Completed / last7Due) * 100) : 0
  const previous7Rate = previous7Due ? Math.round((previous7Completed / previous7Due) * 100) : 0
  const trendDelta = last7Rate - previous7Rate

  return {
    habitCount: stats.length,
    completedDays,
    completionRate: totalDueDays ? Math.round((completedDays / totalDueDays) * 100) : 0,
    weeklyTrendText: trendDelta === 0 ? '近 7 天节奏保持稳定' : `近 7 天完成率${trendDelta > 0 ? '提升' : '下降'} ${Math.abs(trendDelta)}%`,
    dailyAverage: activeDays ? Number((completedDays / activeDays).toFixed(1)) : 0,
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
  getRewardForCompletedDays,
  isHabitDueOnDate
}
