const { addHabit, getHabitById, updateHabit } = require('../../utils/storage')

const goalTypes = ['duration', 'count', 'done']

Page({
  data: {
    habitId: '',
    isEditing: false,
    name: '',
    targetValue: 30,
    unit: '分钟',
    reminderTime: '21:00',
    goalTypeIndex: 0,
    goalTypeLabels: ['时长型', '计数型', '完成型']
  },

  onLoad(options) {
    if (!options.id) {
      return
    }

    const habit = getHabitById(options.id)
    if (!habit) {
      wx.showToast({ title: '习惯不存在', icon: 'none' })
      return
    }

    this.setData({
      habitId: habit.id,
      isEditing: true,
      name: habit.name,
      targetValue: habit.targetValue,
      unit: habit.unit,
      reminderTime: habit.reminderTime,
      goalTypeIndex: Math.max(goalTypes.indexOf(habit.goalType), 0)
    })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  onTargetInput(event) {
    this.setData({ targetValue: Number(event.detail.value) || 1 })
  },

  onUnitInput(event) {
    this.setData({ unit: event.detail.value })
  },

  onReminderChange(event) {
    this.setData({ reminderTime: event.detail.value })
  },

  onGoalTypeChange(event) {
    const goalTypeIndex = Number(event.detail.value)
    this.setData({
      goalTypeIndex,
      unit: goalTypeIndex === 1 ? '个' : goalTypeIndex === 2 ? '次' : '分钟'
    })
  },

  saveHabit() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入习惯名称', icon: 'none' })
      return
    }

    const habitPayload = {
      name: this.data.name.trim(),
      icon: this.data.isEditing ? getHabitById(this.data.habitId).icon : '✨',
      color: this.data.isEditing ? getHabitById(this.data.habitId).color : '#6C63FF',
      goalType: goalTypes[this.data.goalTypeIndex],
      targetValue: this.data.targetValue,
      unit: this.data.unit || '次',
      frequency: { type: 'daily', weekdays: [] },
      reminderTime: this.data.reminderTime,
      group: this.data.isEditing ? getHabitById(this.data.habitId).group : '自定义',
      encouragement: this.data.isEditing ? getHabitById(this.data.habitId).encouragement : '今天也稳稳完成'
    }

    if (this.data.isEditing) {
      updateHabit(this.data.habitId, habitPayload)
      wx.showToast({ title: '已保存', icon: 'success' })
    } else {
      addHabit(habitPayload)
      wx.showToast({ title: '已创建', icon: 'success' })
    }

    wx.navigateBack()
  }
})
