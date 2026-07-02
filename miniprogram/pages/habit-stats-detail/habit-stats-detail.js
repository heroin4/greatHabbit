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

Page({
  data: {
    habit: null,
    summary: {
      startDate: '',
      firstCompletedDate: '暂无',
      completedDays: 0,
      breakCount: 0
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
    const breakDates = []

    for (let cursor = new Date(startDate); cursor <= today; cursor = addDays(cursor, 1)) {
      const date = formatDate(cursor)
      const required = isHabitDueOnDate(habit, cursor)
      const completed = completedDateSet.has(date)

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

    this.setData({
      habit,
      summary: {
        startDate: startKey,
        firstCompletedDate,
        completedDays: logs.length,
        breakCount: breakDates.length
      },
      chartDays,
      breakDates: breakDates.slice(-10).reverse()
    })
  }
})
