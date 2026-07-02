const { todayKey, weekdayIndex } = require('./date')

const ACTIVE_USER_KEY = 'great_habit_active_user_id'
const DEFAULT_USER_ID = 'local_guest'
const HABITS_KEY = 'habits'
const LOGS_KEY = 'logs'

const defaultHabits = [
  {
    id: 'sample_meditation_10',
    name: '示例：冥想 10 分钟',
    icon: '🧘',
    color: '#7C6FF6',
    goalType: 'duration',
    targetValue: 10,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '07:30',
    encouragement: '先用 10 分钟安住呼吸',
    group: '示例',
    sortOrder: 10,
    isExample: true,
    createdAt: '2026-07-02T00:00:00.000Z'
  }
]

function normalizeUserId(userId) {
  return String(userId || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '')
}

function getActiveUserId() {
  const userId = wx.getStorageSync(ACTIVE_USER_KEY)

  if (userId) {
    return userId
  }

  wx.setStorageSync(ACTIVE_USER_KEY, DEFAULT_USER_ID)
  return DEFAULT_USER_ID
}

function setActiveUserId(userId) {
  const nextUserId = normalizeUserId(userId) || DEFAULT_USER_ID
  wx.setStorageSync(ACTIVE_USER_KEY, nextUserId)
  return nextUserId
}

function getUserScopedKey(key) {
  return `great_habit_${getActiveUserId()}_${key}`
}

function getHabits() {
  return wx.getStorageSync(getUserScopedKey(HABITS_KEY)) || []
}

function saveHabits(habits) {
  wx.setStorageSync(getUserScopedKey(HABITS_KEY), habits)
}

function getLogs() {
  return wx.getStorageSync(getUserScopedKey(LOGS_KEY)) || []
}

function getHabitById(id) {
  return getHabits().find((habit) => habit.id === id) || null
}

function saveLogs(logs) {
  wx.setStorageSync(getUserScopedKey(LOGS_KEY), logs)
}

function seedDefaultHabits() {
  if (getHabits().length === 0) {
    saveHabits(defaultHabits)
  }
}

function resetDemoData() {
  saveHabits(defaultHabits)
  saveLogs([])
}

function isHabitDueToday(habit, date = new Date()) {
  if (habit.frequency.type === 'daily') {
    return true
  }

  if (habit.frequency.type === 'weekly') {
    return habit.frequency.weekdays.includes(weekdayIndex(date))
  }

  return true
}

function getTodayHabits(date = new Date()) {
  const dateKey = todayKey(date)
  const logs = getLogs().filter((log) => log.date === dateKey)

  return getHabits()
    .filter((habit) => !habit.archived && isHabitDueToday(habit, date))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((habit) => ({
      ...habit,
      log: logs.find((log) => log.habitId === habit.id) || null
    }))
}

function upsertHabitLog({ habit, value, status = 'completed', note = '' }) {
  const date = todayKey()
  const logs = getLogs()
  const nextLog = {
    id: `${habit.id}_${date}`,
    habitId: habit.id,
    habitName: habit.name,
    date,
    status,
    value,
    unit: habit.unit,
    note,
    createdAt: new Date().toISOString()
  }

  const existingIndex = logs.findIndex((log) => log.habitId === habit.id && log.date === date)
  if (existingIndex >= 0) {
    logs[existingIndex] = { ...logs[existingIndex], ...nextLog }
  } else {
    logs.push(nextLog)
  }

  saveLogs(logs)
  return nextLog
}

function addHabit(habit) {
  const habits = getHabits()
  const nextHabit = {
    ...habit,
    id: `habit_${Date.now()}`,
    sortOrder: Date.now(),
    createdAt: new Date().toISOString()
  }
  saveHabits([...habits, nextHabit])
  return nextHabit
}

function updateHabit(id, updates) {
  const habits = getHabits()
  const previousHabit = habits.find((habit) => habit.id === id)
  const nextHabits = habits.map((habit) => {
    if (habit.id !== id) {
      return habit
    }

    return {
      ...habit,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    }
  })
  saveHabits(nextHabits)

  if (previousHabit) {
    const today = todayKey()
    const nextLogs = getLogs().map((log) => {
      if (log.habitId !== id) {
        return log
      }

      return {
        ...log,
        habitName: updates.name,
        unit: updates.unit,
        value: log.date === today ? updates.targetValue : log.value
      }
    })
    saveLogs(nextLogs)
  }

  return getHabitById(id)
}

function deleteHabit(id) {
  saveHabits(getHabits().filter((habit) => habit.id !== id))
  saveLogs(getLogs().filter((log) => log.habitId !== id))
}

module.exports = {
  addHabit,
  getActiveUserId,
  deleteHabit,
  getHabitById,
  getHabits,
  getLogs,
  getTodayHabits,
  resetDemoData,
  seedDefaultHabits,
  setActiveUserId,
  updateHabit,
  upsertHabitLog
}
