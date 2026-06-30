const { todayKey, weekdayIndex } = require('./date')

const HABITS_KEY = 'great_habit_habits'
const LOGS_KEY = 'great_habit_logs'

const defaultHabits = [
  {
    id: 'chanting',
    name: '念诵经文',
    icon: '📿',
    color: '#7C6FF6',
    goalType: 'duration',
    targetValue: 30,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '06:30',
    encouragement: '清晨先安住身心',
    group: '修行',
    sortOrder: 10,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'meditation',
    name: '静坐冥想',
    icon: '🧘',
    color: '#8E7DFF',
    goalType: 'duration',
    targetValue: 15,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '07:10',
    encouragement: '给自己一段安静时间',
    group: '修行',
    sortOrder: 20,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'squat',
    name: '深蹲',
    icon: '🏋️',
    color: '#FF8A5B',
    goalType: 'count',
    targetValue: 50,
    unit: '个',
    frequency: { type: 'weekly', weekdays: [1, 2, 3, 4, 5] },
    reminderTime: '20:30',
    encouragement: '今天也给身体一点力量',
    group: '健康',
    sortOrder: 30,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'drink_water',
    name: '喝水',
    icon: '💧',
    color: '#3BA7FF',
    goalType: 'count',
    targetValue: 8,
    unit: '杯',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '10:00',
    encouragement: '先喝一杯水再继续忙',
    group: '健康',
    sortOrder: 40,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'stretching',
    name: '拉伸',
    icon: '🤸',
    color: '#FFB84D',
    goalType: 'duration',
    targetValue: 10,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '22:00',
    encouragement: '放松肩颈和腰背',
    group: '健康',
    sortOrder: 50,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'english',
    name: '学习英语',
    icon: '📚',
    color: '#21B6A8',
    goalType: 'duration',
    targetValue: 30,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '21:00',
    encouragement: '今天也进步一点点',
    group: '学习',
    sortOrder: 60,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'reading',
    name: '阅读',
    icon: '📖',
    color: '#5C7CFA',
    goalType: 'duration',
    targetValue: 20,
    unit: '分钟',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '21:40',
    encouragement: '读几页也算向前走',
    group: '学习',
    sortOrder: 70,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'journal',
    name: '写日记',
    icon: '✍️',
    color: '#D46BFF',
    goalType: 'done',
    targetValue: 1,
    unit: '次',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '22:30',
    encouragement: '简单记录今天的收获',
    group: '复盘',
    sortOrder: 80,
    createdAt: '2026-06-30T00:00:00.000Z'
  },
  {
    id: 'early_sleep',
    name: '早睡',
    icon: '🌙',
    color: '#5965D8',
    goalType: 'done',
    targetValue: 1,
    unit: '次',
    frequency: { type: 'daily', weekdays: [] },
    reminderTime: '23:00',
    encouragement: '早点休息，明天更稳',
    group: '作息',
    sortOrder: 90,
    createdAt: '2026-06-30T00:00:00.000Z'
  }
]

function getHabits() {
  return wx.getStorageSync(HABITS_KEY) || []
}

function saveHabits(habits) {
  wx.setStorageSync(HABITS_KEY, habits)
}

function getLogs() {
  return wx.getStorageSync(LOGS_KEY) || []
}

function saveLogs(logs) {
  wx.setStorageSync(LOGS_KEY, logs)
}

function seedDefaultHabits() {
  if (getHabits().length === 0) {
    saveHabits(defaultHabits)
  }
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

module.exports = {
  addHabit,
  getHabits,
  getLogs,
  getTodayHabits,
  seedDefaultHabits,
  upsertHabitLog
}
