const { getTodayHabits, upsertHabitLog } = require('../../utils/storage')
const { todayKey } = require('../../utils/date')

Page({
  data: {
    today: '',
    habits: [],
    completedCount: 0
  },

  onShow() {
    this.loadHabits()
  },

  loadHabits() {
    const habits = getTodayHabits()
    this.setData({
      today: todayKey(),
      habits,
      completedCount: habits.filter((habit) => habit.log).length
    })
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/habit-edit/habit-edit' })
  },

  recordHabit(event) {
    const habit = this.data.habits.find((item) => item.id === event.currentTarget.dataset.id)
    if (!habit) {
      return
    }

    wx.showModal({
      title: `记录${habit.name}`,
      editable: true,
      placeholderText: `默认 ${habit.targetValue}${habit.unit}，可输入实际数值`,
      success: (result) => {
        if (!result.confirm) {
          return
        }

        const value = Number(result.content) || habit.targetValue
        upsertHabitLog({ habit, value })
        this.loadHabits()
        wx.showToast({ title: '已记录', icon: 'success' })
      }
    })
  }
})
