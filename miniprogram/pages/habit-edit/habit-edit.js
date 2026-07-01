const { addHabit } = require('../../utils/storage')

const goalTypes = ['duration', 'count', 'done']

Page({
  data: {
    name: '',
    targetValue: 30,
    unit: '分钟',
    reminderTime: '21:00',
    goalTypeIndex: 0,
    goalTypeLabels: ['时长型', '计数型', '完成型']
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

    addHabit({
      name: this.data.name.trim(),
      icon: '✨',
      color: '#6C63FF',
      goalType: goalTypes[this.data.goalTypeIndex],
      targetValue: this.data.targetValue,
      unit: this.data.unit || '次',
      frequency: { type: 'daily', weekdays: [] },
      reminderTime: this.data.reminderTime,
      group: '自定义',
      encouragement: '今天也稳稳完成'
    })

    wx.showToast({ title: '已创建', icon: 'success' })
    wx.navigateBack()
  }
})
