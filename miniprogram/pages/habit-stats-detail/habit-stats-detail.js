const { getHabitById, getLogs } = require('../../utils/storage')
const { todayKey } = require('../../utils/date')

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

function isHabitDueOnDate(habit, date) {
  if (habit.frequency.type === 'daily') {
    return true
  }

  if (habit.frequency.type === 'weekly') {
    return habit.frequency.weekdays.includes(date.getDay())
  }

  return true
}

function countCurrentStreak(days) {
  let streak = 0

  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index]

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

Page({
  data: {
    habit: null,
    summary: {
      startDate: '',
      firstCompletedDate: '暂无',
      completedDays: 0,
      breakCount: 0,
      completionRate: 0,
      currentStreak: 0,
      dailyAverage: 0,
      totalValueText: '0'
    },
    chartDays: [],
    breakDates: []
  },

  onLoad(options) {
    const habit = getHabitById(options.id)
    if (!habit) {
      wx.showToast({ title: '习惯不存在', icon: 'none' })
      return
    }

    this.buildDetail(habit)
  },

  buildDetail(habit) {
    const today = parseDate(todayKey())
    const startDate = habit.createdAt ? new Date(habit.createdAt) : today
    const startKey = formatDate(startDate)
    const logs = getLogs()
      .filter((log) => log.habitId === habit.id && log.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date))
    const completedDateSet = new Set(logs.map((log) => log.date))
    const firstCompletedDate = logs[0] ? logs[0].date : '暂无'
    const chartStart = addDays(today, -29)
    const chartDays = []
    const allDays = []
    const breakDates = []

    for (let cursor = new Date(startDate); cursor <= today; cursor = addDays(cursor, 1)) {
      const date = formatDate(cursor)
      const required = isHabitDueOnDate(habit, cursor)
      const completed = completedDateSet.has(date)

      allDays.push({ date, required, completed })

      if (required && !completed) {
        breakDates.push(date)
      }

      if (cursor >= chartStart) {
        chartDays.push({
          date,
          dayLabel: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
          state: completed ? 'done' : required ? 'missed' : 'rest'
        })
      }
    }

    const dueDays = allDays.filter((day) => day.required).length
    const completedDays = logs.length
    const totalValue = logs.reduce((sum, log) => sum + Number(log.value || 0), 0)

    this.setData({
      habit,
      summary: {
        startDate: startKey,
        firstCompletedDate,
        completedDays,
        breakCount: breakDates.length,
        completionRate: dueDays ? Math.round((completedDays / dueDays) * 100) : 0,
        currentStreak: countCurrentStreak(allDays),
        dailyAverage: dueDays ? Number((totalValue / dueDays).toFixed(1)) : 0,
        totalValueText: habit.goalType === 'done' ? `${completedDays} 天` : `${totalValue} ${habit.unit}`
      },
      chartDays,
      breakDates: breakDates.slice(-10).reverse()
    })
  }
})
